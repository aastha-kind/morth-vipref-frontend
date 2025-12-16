import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-reference',
  standalone: false,
  templateUrl: './view-reference.component.html',
  styleUrl: './view-reference.component.css',
  providers: [DatePipe]
})
export class ViewReferenceComponent {
  viewReference!: FormGroup;
  referenceDetails: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private datePipe: DatePipe) {
    this.referenceDetails = data;
  }

  ngOnInit() {
    this.viewReference = new FormGroup({
      "referenceNo": new FormControl(),
      "subject": new FormControl(),
      "assignedAt": new FormControl(),
      "priority": new FormControl(),
      "currentQueue": new FormControl(),
      "status": new FormControl(),
      "actions": new FormControl()
    })
    const formattedReceivedDate = this.datePipe.transform(
      this.referenceDetails.assignedAt,
      'dd MMM yyyy HH:mm:ss'
    );
    this.setFormData(formattedReceivedDate);
  }

  setFormData(formattedReceivedDate:any) {
    this.viewReference.get('referenceNo')?.setValue(this.referenceDetails.referenceNo);
    this.viewReference.get('referenceNo')?.disable()
    this.viewReference.get('subject')?.setValue(this.referenceDetails.subject)
    this.viewReference.get('subject')?.disable()
    this.viewReference.get('assignedAt')?.setValue(formattedReceivedDate)
    this.viewReference.get('assignedAt')?.disable()
    this.viewReference.get('priority')?.setValue(this.referenceDetails.priority)
    this.viewReference.get('priority')?.disable()
    this.viewReference.get('currentQueue')?.setValue(this.referenceDetails.currentQueue)
    this.viewReference.get('currentQueue')?.disable()
    this.viewReference.get('status')?.setValue(this.referenceDetails.status)
    this.viewReference.get('status')?.disable()
  }
}
