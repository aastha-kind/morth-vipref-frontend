import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizationMasterDialogComponent } from './organization-master-dialog/organization-master-dialog.component';
import { AdminService } from '../../../service/admin.service';
import { error } from 'console';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToasterService } from '../../../utilities/toaster.service';

@Component({
  selector: 'app-organization-master-form',
  standalone: false,
  templateUrl: './organization-master-form.component.html',
  styleUrl: './organization-master-form.component.css'
})
export class OrganizationMasterFormComponent {
  displayedColumns: string[] = ['srNo', 'organizationName', 'organizationCode', 'actions'];
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private toastService = inject(ToasterService)
  organizations = new MatTableDataSource<any>();

  constructor(private dialog: MatDialog) { }
  ngOnInit() {
    this.getOrganizationMaster();
  }


  openAddDialog() {
    const dialogRef = this.dialog.open(OrganizationMasterDialogComponent, {
      width: '400px',
      data: { mode: 'add', organization: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'add') {
        const organizationData = result?.organization;
        if (organizationData) {
          this.adminService.addOrganization(organizationData).subscribe({
            next: (response: any) => {
              this.getOrganizationMaster();
              if (response.organizationId !== null && response.organizationId !== undefined) {
                this.toastService.success('Organization Added Successfully');
              }
            },
            error: (err: any) => {
              const message = err?.error?.message || 'Failed To Add Organization';
              this.toastService.error(message);
            }
          })
        }
      }
    });
  }

  openEditDialog(org: any) {
    const dialogRef = this.dialog.open(OrganizationMasterDialogComponent, {
      width: '400px',
      data: { mode: 'edit', organization: { ...org } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit') {
        const organizationData = result?.organization;
        const organizationId = org.organizationId;
        if (organizationData && organizationId) {
          this.adminService.updateOrganization(organizationId, organizationData).subscribe({
            next: (response: any) => {
              this.getOrganizationMaster();
              if (response.organizationId !== null && response.organizationId !== undefined) {
                this.toastService.success('Organization Updated Successfully');
              }
            },
            error: (err: Error) => {
              this.toastService.error('Failed To Update Organization');
            }
          })
        }
      }
    });
  }

  openDeleteDialog(org: any) {
    const dialogRef = this.dialog.open(OrganizationMasterDialogComponent, {
      width: '350px',
      data: { mode: 'delete', organization: org }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'delete') {
        const organizationId = org.organizationId;
        if (organizationId) {
          this.adminService.deleteOrganization(organizationId).subscribe({
            next: (response: any) => {
              this.getOrganizationMaster();
              this.toastService.success('Organization Deleted Successfully');
            },
            error: (err: Error) => {
              this.toastService.error('Failed To Delete Organization');
            }
          })
        }
      }
    });
  }
  getOrganizationMaster() {
    this.adminService.getOrganizationMaster().subscribe({
      next: (res: any) => {
        this.organizations.data = res;
      },
      error: (err: Error) => {
        console.log(err)
      }
    })
  }
}
