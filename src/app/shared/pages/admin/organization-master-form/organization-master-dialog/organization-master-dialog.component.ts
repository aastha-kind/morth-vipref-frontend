import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-organization-master-dialog',
  standalone: false,
  templateUrl: './organization-master-dialog.component.html',
  styleUrl: './organization-master-dialog.component.css'
})
export class OrganizationMasterDialogComponent {
  constructor( public dialogRef: MatDialogRef<OrganizationMasterDialogComponent>,@Inject(MAT_DIALOG_DATA) public data: any) {
  if (!this.data.organization) {
    this.data.organization = { organizationName: '', organizationCode: '' };
  }
}

  saveOrganization() {
    this.dialogRef.close({ action: 'add', organization: this.data.organization });
  }

  updateOrganization() {
    this.dialogRef.close({ action: 'edit', organization: this.data.organization });
  }

  deleteOrganization() {
    this.dialogRef.close({ action: 'delete', organization: this.data.organization });
  }
}
