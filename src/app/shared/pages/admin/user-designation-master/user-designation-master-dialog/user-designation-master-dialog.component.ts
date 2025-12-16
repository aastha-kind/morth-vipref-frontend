import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../../../service/admin.service';

@Component({
  selector: 'app-user-designation-master-dialog',
  standalone: false,
  templateUrl: './user-designation-master-dialog.component.html',
  styleUrl: './user-designation-master-dialog.component.css'
})
export class UserDesignationMasterDialogComponent {
 organizations: any[] = [];
  private adminService = inject(AdminService);

  constructor(
    public dialogRef: MatDialogRef<UserDesignationMasterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (!this.data.designation) {
      this.data.designation = { designationCode: '', designationDescription: '', organization: { organizationId: null } };
    }
    if (!this.data.designation.organization) {
      this.data.designation.organization = { organizationId: null };
    }
  }

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.adminService.getOrganizationMaster().subscribe({
      next: (res: any) => (this.organizations = res),
      error: (err:Error) => console.error('Failed to load organizations', err)
    });
  }

  saveDesignation() {
    this.dialogRef.close({ action: 'add', designation: this.data.designation });
  }

  updateDesignation() {
    this.dialogRef.close({ action: 'edit', designation: this.data.designation });
  }

  deleteDesignation() {
    this.dialogRef.close({ action: 'delete', designation: this.data.designation });
  }
}
