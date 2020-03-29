import { ExperienceComponent } from './../experience/experience.component';
import { Profile, Section, Experience } from './../resume.interface';
import { ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit, ViewChild, HostListener, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject, Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as firebase from 'firebase/app';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { faPhoneAlt, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { UserService } from '../user.service';
import { AngularFireStorage } from '@angular/fire/storage';
library.add(fab);

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {
  location = faMapMarkerAlt;
  phone = faPhoneAlt;
  email = faEnvelope;

  public profile: Profile;
  public imageURL: Observable<string>;
  public experiences: Experience[] = [];
  public sections: Section[] = [];
  public rid: string;
  public activeTab = '';
  screenWidth: number;
  private screenWidth$ = new BehaviorSubject<number>(window.innerWidth);

  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(
    private db: AngularFirestore,
    public storage: AngularFireStorage,
    private user: UserService,
    public dialog: MatDialog,
    public route: ActivatedRoute) {
      this.imageURL = this.storage.ref(user.getImageURL()).getDownloadURL();
  }

  @HostListener('window:resize', ['$event'])
  onResize($event): void {
    this.screenWidth$.next($event.target.innerWidth);
  }

  ngOnInit() {
    this.screenWidth$.subscribe(width => {
      this.screenWidth = width;
    });
    this.profile = new Profile(this.user.getData());
    this.route.params.subscribe((params: Params) => {
      this.rid = params.rid;
      this.db.firestore.collection('resumes').doc(params.rid)
        .collection('sections').get().then((Snapshot) => {
          Snapshot.forEach((doc) => {
            this.sections.push(new Section(doc.id, doc.data()));
            this.activeTab = doc.id;
            doc.ref.collection('experiences').get().then((Snapshot2) => {
              Snapshot2.forEach((exp) => {
                this.experiences.push(new Experience(exp.id, doc.id, exp.data()));
              });
            });
          });
        }).finally(() => {
          this.db.firestore.collection('resumes').doc(params.rid).get().then((doc) => {
            const order = doc.data().order;
            this.sections.sort((a, b) => {
              return order.indexOf(a.id) - order.indexOf(b.id);
            });
          });
        });
      }
    );
  }

  public get sortedExperiences(): Experience[] {
    return this.experiences.filter(x => x.section === this.activeTab).sort((a, b): number => {
      if (a.today || b.today) {
          return a.today && !b.today ? -1 : (!a.today && b.today ? 1 : b.startDate.getTime() - a.startDate.getTime());
      } else {
          return a.endDate.getTime() > b.endDate.getTime() ? -1 : (
            b.endDate.getTime() > a.endDate.getTime() ? 1 : b.startDate.getTime() - a.startDate.getTime());
      }
    });
  }

  public getSortedExperiences(id: string): Experience[] {
    return this.experiences.filter(x => x.section === id).sort((a, b): number => {
      if (a.today || b.today) {
          return a.today && !b.today ? -1 : (!a.today && b.today ? 1 : b.startDate.getTime() - a.startDate.getTime());
      } else {
          return a.endDate.getTime() > b.endDate.getTime() ? -1 : (
            b.endDate.getTime() > a.endDate.getTime() ? 1 : b.startDate.getTime() - a.startDate.getTime());
      }
    });
  }

  onPrintClick() {
    setTimeout(() => {
      window.print();
    });
  }

  dropOrderSections(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
    this.db.collection('resumes').doc(this.rid).update({order: this.sections.map(x => x.id)});
  }

  onAddSectionClick() {
    // tslint:disable-next-line: no-use-before-declare
    const dialogRef = this.dialog.open(DialogAddSectionDialog);

    dialogRef.afterClosed().subscribe((value) => {
      if (value) {
        this.db.collection('resumes').doc(this.rid).collection('sections').add(value).then((doc) => {
          this.db.collection('resumes').doc(this.rid).update({order: firebase.firestore.FieldValue.arrayUnion(doc.id)}).then(() => {
            this.sections.push(new Section(doc.id, value));
            this.activeTab = doc.id;
          });
        });
      }
      console.log('The dialog was closed');
    });
  }

  onEditSectionClick(section: Section) {
    // tslint:disable-next-line: no-use-before-declare
    const dialogRef = this.dialog.open(DialogEditSectionDialog, {
      data: {icon: section.icon, title: section.title}
    });

    dialogRef.afterClosed().subscribe((values) => {
      const index = this.sections.indexOf(section);
      if (values && values !== 'delete') {
        console.log(values);
        this.db.collection('resumes').doc(this.rid).collection('sections').doc(section.id).update(values).then(() => {
          this.sections[index] = new Section(section.id, values);
          this.activeTab = section.id;
        });
      } else if (values === 'delete') {
        this.db.firestore.collection('resumes').doc(this.rid).collection('sections').doc(section.id).collection('experiences').get()
        .then((Snapshot) => {
          Snapshot.forEach((exp) => { exp.ref.delete(); });
        });
        this.db.collection('resumes').doc(this.rid).collection('sections').doc(section.id).delete().then(() => {
          this.db.collection('resumes').doc(this.rid).update({order: firebase.firestore.FieldValue.arrayRemove(section.id)}).then(() => {
            if (index >= 0) {
              this.sections.splice(index, 1);
            }
          });
        });
        this.activeTab = '';
      }
      console.log('The dialog was closed');
    });
  }

  onAddExperienceClick(section: string) {
    // tslint:disable-next-line: no-use-before-declare
    const dialogRef = this.dialog.open(ExperienceComponent, {
      data: {title: '', subtitle: '', startDate: new Date(), endDate: new Date(), today: false, description: ['']}
    });

    dialogRef.afterClosed().subscribe((value) => {
      if (value) {
        this.db.collection('resumes').doc(this.rid).collection('sections').doc(section)
        .collection('experiences').add(value).then((doc) => {
          console.log(section);
          this.experiences.push(new Experience(doc.id, section, value));
        });
      }
      console.log('The dialog was closed');
    });
  }

  onUpdateExperienceClick(experience: Experience) {
    // tslint:disable-next-line: no-use-before-declare
    const dialogRef = this.dialog.open(ExperienceComponent, {
      data: experience
    });

    dialogRef.afterClosed().subscribe((values) => {
      if (values) {
        this.db.collection('resumes').doc(this.rid).collection('sections').doc(experience.section)
        .collection('experiences').doc(experience.id).update(values).then(doc => {
          this.experiences = this.experiences.filter(x => x !== experience);
          this.experiences.push(new Experience(experience.id, experience.section, values));
          // Object.entries(values).forEach(([key, value]) => {
          //   this.experiences.find(x => x === experience)[key] = value;
          // });
        });
      }
      console.log('The dialog was closed');
    });
  }

  onDeleteExperienceClick(experience: Experience) {
    this.db.collection('resumes').doc(this.rid).collection('sections').doc(experience.section)
      .collection('experiences').doc(experience.id).delete().then(() => {
        this.experiences = this.experiences.filter(x => x !== experience);
        console.log('Document successfully deleted!');
    }).catch((error) => {
        console.error('Error removing document: ', error);
    });
  }
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'dialog-section-dialog',
  styleUrls: ['./resume.component.scss'],
  template: `
    <h2 mat-dialog-title>Add Section</h2>
    <div mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field style="width: 40px;">
          <mat-label>Icon</mat-label>
          <mat-select cdkFocusInitial formControlName="icon">
            <mat-select-trigger>
              <mat-icon>{{form.value?.icon}}</mat-icon>
            </mat-select-trigger>
            <mat-option *ngFor="let icon of icons" [value]="icon"><mat-icon>{{ icon }}</mat-icon></mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" autocomplete="off">
          <mat-error *ngIf="form.get('title').hasError('required')">
            Title is <strong>required</strong>
          </mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-button (click)="onSaveClick()" [disabled]="form.invalid">Save</button>
    </div>
  `
})
// tslint:disable-next-line: component-class-suffix
export class DialogAddSectionDialog implements OnInit {
  form: FormGroup;
  icons: string[] = ['work', 'class', 'code', 'explore', 'launch', 'stars', 'timeline', 'view_agenda', 'web', 'add_circle',
    'filter_center_focus', 'chevron_right'];

  constructor(
    public dialogRef: MatDialogRef<DialogAddSectionDialog>,
    private fb: FormBuilder) {
      this.form = this.fb.group({
        icon: new FormControl('chevron_right', [Validators.required]),
        title: new FormControl('', [Validators.required]),
      });
    }

  ngOnInit() {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick() {
    this.dialogRef.close(this.form.value);
  }

}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'dialog-section-dialog',
  styleUrls: ['./resume.component.scss'],
  template: `
    <h2 mat-dialog-title>Edit Section</h2>
    <div mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field style="width: 40px;">
          <mat-label>Icon</mat-label>
          <mat-select cdkFocusInitial formControlName="icon">
            <mat-select-trigger>
              <mat-icon>{{form.value?.icon}}</mat-icon>
            </mat-select-trigger>
            <mat-option *ngFor="let icon of icons" [value]="icon"><mat-icon>{{ icon }}</mat-icon></mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" autocomplete="off">
          <mat-error *ngIf="form.get('title').hasError('required')">
            Title is <strong>required</strong>
          </mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button color="warn" (click)="onDeleteClick()">Delete Section</button>
      <button mat-button (click)="onSaveClick()" [disabled]="form.invalid">Save</button>
    </div>
  `
})
// tslint:disable-next-line: component-class-suffix
export class DialogEditSectionDialog implements OnInit {
  form: FormGroup;
  icons: string[] = ['work', 'class', 'code', 'explore', 'launch', 'stars', 'timeline', 'view_agenda', 'web', 'add_circle',
    'filter_center_focus', 'chevron_right'];

  constructor(
    public dialogRef: MatDialogRef<DialogEditSectionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {icon: string, title: string},
    private fb: FormBuilder) {
      this.form = this.fb.group({
        icon: new FormControl(data.icon, [Validators.required]),
        title: new FormControl(data.title, [Validators.required]),
      });
    }

  ngOnInit() {}

  onDeleteClick(): void {
    this.dialogRef.close('delete');
  }

  onSaveClick() {
    this.dialogRef.close(this.form.value);
  }

}
