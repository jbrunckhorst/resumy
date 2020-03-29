import { ImageUploadComponent } from './../image-upload/image-upload.component';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Component, OnInit, Inject, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { UserService } from './../user.service';
import PlaceResult = google.maps.places.PlaceResult;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  public info: FormGroup;
  public activeTab = 'profile';
  private uid: string;
  public resumes: string[];
  public imageURL: Observable<string>;
  screenWidth: number;
  private screenWidth$ = new BehaviorSubject<number>(window.innerWidth);

  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(
    private db: AngularFirestore,
    public storage: AngularFireStorage,
    private user: UserService,
    public dialog: MatDialog,
    public router: Router) {
      this.uid = user.getUID();
      this.imageURL = this.storage.ref(user.getImageURL()).getDownloadURL();
      this.resumes = user.getResumes();
      const userData = this.user.getData();
      this.info = new FormGroup({
        name: new FormControl(userData.name),
        phone: new FormControl(userData.phone),
        email: new FormControl(userData.email),
        adress: new FormControl(userData.adress),
        references: new FormArray(userData.references.map(x => new FormControl(x))),
        languages: new FormArray(userData.languages.map(x => new FormControl(x)))
      });
    }

  @HostListener('window:resize', ['$event'])
  onResize($event): void {
    this.screenWidth$.next($event.target.innerWidth);
  }

  ngOnInit() {
    this.screenWidth$.subscribe(width => {
      this.screenWidth = width;
    });
    this.info.valueChanges.subscribe(data => {
      console.log(data);
      this.db.firestore.collection('users').doc(this.uid).update(data);
    });
  }

  get references() {
    return this.info.get('references') as FormArray;
  }

  get languages() {
    return this.info.get('languages') as FormArray;
  }

  addReference() {
    this.references.push(new FormControl(''));
  }

  removeReference(index: number) {
    this.references.removeAt(index);
  }

  addLanguage() {
    this.languages.push(new FormControl(''));
  }

  removeLanguage(index: number) {
    this.languages.removeAt(index);
  }

  goToResume(title: string) {
    this.db.firestore.collection('resumes').where('uid', '==', this.uid).where('title', '==', title)
    .limit(1).get().then((querySnapshot) => {
      querySnapshot.forEach(resume => {
        this.router.navigate(['resume', resume.id]);
      });
    });
  }

  onAutocompleteSelected(result: PlaceResult) {
    console.log(result);
    this.db.firestore.collection('users').doc(this.uid).update({adress: result.formatted_address});
  }

  onProfileClick() {
    this.imageURL.toPromise().then(imageURL => {
      const dialogRef = this.dialog.open(ImageUploadComponent, {
        data: { uid: this.uid, url: imageURL }
      });

      dialogRef.afterClosed().subscribe((value) => {
        this.imageURL = this.storage.ref(value).getDownloadURL();
        console.log('The dialog was closed');
      });
    });
  }

  onAddClick() {
    // tslint:disable-next-line: no-use-before-declare
    const dialogRef = this.dialog.open(DialogAddResumeDialog, {
      data: { uid: this.uid, existingTitles: this.resumes }
    });

    dialogRef.afterClosed().subscribe((value) => {
      if (value) {
        this.db.collection('resumes').add(value).then((doc) => {
          this.db.collection('users').doc(this.uid).update({resumes: firebase.firestore.FieldValue.arrayUnion(value.title)});
          this.resumes.push(value.title);
        });
      }
    });
  }

  async onDeleteClick(title: string) {
    this.db.firestore.collection('resumes').where('uid', '==', this.uid).where('title', '==', title)
    .limit(1).get().then((querySnapshot) => {
      querySnapshot.forEach(doc => {
        doc.ref.delete().then(() => {
          this.db.collection('users').doc(this.uid).update({resumes: firebase.firestore.FieldValue.arrayRemove(title)});
          this.resumes = this.resumes.filter(resume => resume !== title);
        });
      });
    });
  }
}


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'dialog-resume-dialog',
  template: `
    <h2 mat-dialog-title>Add Resume</h2>
    <div mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="give your resume a name" autocomplete="off">
          <mat-error *ngIf="this.form.hasError('required', 'title')">Title is <strong>required</strong></mat-error>
          <mat-error *ngIf="this.form.hasError('alreadyExists', 'title')">Title already <strong>exists</strong></mat-error>
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
export class DialogAddResumeDialog implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogAddResumeDialog>,
    @Inject(MAT_DIALOG_DATA) private data: {uid: string, existingTitles: string[]},
    private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: new FormControl('',
        [Validators.required, (control: FormControl) => {
          if (this.data.existingTitles.includes(control.value)) {
            return {alreadyExists: {title: control.value}};
          } else {
            return null;
          }
        }]),
      uid: this.data.uid,
      order: []
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick() {
    this.dialogRef.close(this.form.value);
  }

}
