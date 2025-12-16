import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-office-type-master-dialog',
  standalone: false,
  templateUrl: './office-type-master-dialog.component.html',
  styleUrl: './office-type-master-dialog.component.css'
})
export class OfficeTypeMasterDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OfficeTypeMasterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (!this.data.officeType) {
      this.data.officeType = { officeTypeName: '', officeTypeCode: '' };
    }
  }

  saveOfficeType() {
    this.dialogRef.close({ action: 'add', officeType: this.data.officeType });
  }

  updateOfficeType() {
    this.dialogRef.close({ action: 'edit', officeType: this.data.officeType });
  }

  deleteOfficeType() {
    this.dialogRef.close({ action: 'delete', officeType: this.data.officeType });
  }
}
