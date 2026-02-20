import { Component, inject, Inject } from '@angular/core';
import { AdminService } from '../../../../service/admin.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-offices-master-dialog',
  standalone: false,
  templateUrl: './offices-master-dialog.component.html',
  styleUrl: './offices-master-dialog.component.css'
})
export class OfficesMasterDialogComponent {
  organizations: any[] = [];
  officeType:any[]=[];
  private adminService = inject(AdminService)

  constructor(
    public dialogRef: MatDialogRef<OfficesMasterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (!this.data.office) {
      this.data.office = { officeName: '', organization: { organizationId: null } };
    }

    // Ensure organization object exists even if office exists but organization doesn’t
    if (!this.data.office.organization) {
      this.data.office.organization = { organizationId: null };
    }
    if (!this.data.office.officeTypeId) {
      this.data.office.officeTypeId = { officeTypeId: null };
    }
  }

  ngOnInit() {
    this.loadOrganizations();
    this.getOfficeTypeMaster();
  }

  // Fetch organizations for dropdown
  loadOrganizations() {
    this.adminService.getOrganizationMaster().subscribe({
      next: (res: any) => {
        this.organizations = res;
      },
      error: (err: Error) => console.error('Failed to load organizations', err),
    });
  }

  getOfficeTypeMaster(){
    this.adminService.getOfficeTypeMaster().subscribe({
      next: (res: any) => {
        this.officeType = res;
      },
      error: (err: Error) => console.error('Failed to load organizations', err),
    });
  }

  saveOffice() {
    this.dialogRef.close({ action: 'add', office: this.data.office });
  }

  updateOffice() {
    this.dialogRef.close({ action: 'edit', office: this.data.office });
  }

  deleteOffice() {
    this.dialogRef.close({ action: 'delete', office: this.data.office });
  }
}
