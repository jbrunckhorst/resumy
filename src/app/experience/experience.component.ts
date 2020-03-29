import { Moment } from 'moment';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ExperienceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string, subtitle: string, startDate: any, endDate: any, today: boolean, description: string[]},
    private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: new FormControl(this.data.title, [Validators.required]),
      subtitle: new FormControl(this.data.subtitle),
      startDate: new FormControl(this.data.startDate, [Validators.required]),
      endDate: new FormControl(this.data.endDate),
      today: new FormControl(this.data.today),
      description: new FormControl('• ' + this.data.description.join('\n• '))
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick() {
    this.form.patchValue({
      // Remove first bullet char and split string into array
      description: this.form.get('description').value.substr(2).split('\n• ')
    });
    this.dialogRef.close(this.form.value);
  }


  chosenYearHandler(normalizedYear: Moment, which: string) {
    if (which === 'start') {
      const ctrlValue = this.form.get('startDate').value;
      ctrlValue.year(normalizedYear.year());
      this.form.patchValue({startDate: ctrlValue});
    } else {
      const ctrlValue = this.form.get('endDate').value;
      ctrlValue.year(normalizedYear.year());
      this.form.patchValue({endDate: ctrlValue});
    }
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>, which: string) {
    if (which === 'start') {
      const ctrlValue = this.form.get('startDate').value;
      ctrlValue.month(normalizedMonth.month());
      this.form.patchValue({startDate: ctrlValue});
    } else {
      const ctrlValue = this.form.get('endDate').value;
      ctrlValue.month(normalizedMonth.month());
      this.form.patchValue({endDate: ctrlValue});
    }
    datepicker.close();
  }
}
