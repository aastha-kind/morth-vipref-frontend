import { Component, inject, ViewChild } from '@angular/core';
import { UserDesignationMasterDialogComponent } from './user-designation-master-dialog/user-designation-master-dialog.component';
import { AdminService } from '../../../service/admin.service';
import { ToasterService } from '../../../utilities/toaster.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-user-designation-master',
  standalone: false,
  templateUrl: './user-designation-master.component.html',
  styleUrl: './user-designation-master.component.css'
})
export class UserDesignationMasterComponent {
 displayedColumns: string[] = ['srNo', 'designationCode', 'designationDescription', 'organizationName', 'actions'];
  designations = new MatTableDataSource<any>();
  filterValue = '';

  private adminService = inject(AdminService);
  private toastService = inject(ToasterService);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadDesignations();
  }

  ngAfterViewInit(): void {
    this.designations.paginator = this.paginator;
  }

  // 🔹 Load Designations
  private loadDesignations(): void {
    this.adminService.getUserDesignations().subscribe({
      next: (res: any) => {
        this.designations.data = res;
        this.designations.filterPredicate = (data:any, filter:any) => {
          const search = filter.trim().toLowerCase();
          return (
            data.designationCode?.toLowerCase().includes(search) ||
            data.designationDescription?.toLowerCase().includes(search) ||
            data.organization?.organizationName?.toLowerCase().includes(search)
          );
        };
      },
      error: (err) => console.error(err)
    });
  }

  // 🔹 Search Filter
  applyFilter(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue = filter;
    this.designations.filter = filter.trim().toLowerCase();
    if (this.designations.paginator) this.designations.paginator.firstPage();
  }

  // 🔹 Add
  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserDesignationMasterDialogComponent, {
      width: '400px',
      data: { mode: 'add', designation: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'add' && result.designation) {
        this.adminService.addUserDesignation(result.designation).subscribe({
          next: () => {
            this.loadDesignations();
            this.toastService.success('Designation Added Successfully');
          },
          error: () => this.toastService.error('Failed To Add Designation')
        });
      }
    });
  }

  // 🔹 Edit
  openEditDialog(designation: any): void {
    const dialogRef = this.dialog.open(UserDesignationMasterDialogComponent, {
      width: '400px',
      data: { mode: 'edit', designation: { ...designation } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit' && result.designation && designation.designationId) {
        const updateData = {
          designationCode: result.designation.designationCode,
          designationDescription: result.designation.designationDescription,
          organization: { organizationId: result.designation.organization.organizationId }
        };
        this.adminService.updateUserDesignation(designation.designationId, updateData).subscribe({
          next: () => {
            this.loadDesignations();
            this.toastService.success('Designation Updated Successfully');
          },
          error: () => this.toastService.error('Failed To Update Designation')
        });
      }
    });
  }

  // 🔹 Delete
  openDeleteDialog(designation: any): void {
    const dialogRef = this.dialog.open(UserDesignationMasterDialogComponent, {
      width: '350px',
      data: { mode: 'delete', designation }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'delete' && designation.designationId) {
        this.adminService.deleteUserDesignation(designation.designationId).subscribe({
          next: () => {
            this.loadDesignations();
            this.toastService.success('Designation Deleted Successfully');
          },
          error: () => this.toastService.error('Failed To Delete Designation')
        });
      }
    });
  }
}
