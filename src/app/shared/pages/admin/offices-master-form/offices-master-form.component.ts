import { Component, inject, ViewChild } from '@angular/core';
import { AdminService } from '../../../service/admin.service';
import { ToasterService } from '../../../utilities/toaster.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { OfficesMasterDialogComponent } from './offices-master-dialog/offices-master-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { OfficeType } from '../office-type-master-form/office-type-master-form.component';
interface Office {
  officeId?: number;
  officeName: string;
  officeCode: string;
  organization?: Organization;
  officeType?: OfficeType;
}
interface Organization {
  organizationId: number;
  organizationName: string;
  organizationCode: string;
}
@Component({
  selector: 'app-offices-master-form',
  standalone: false,
  templateUrl: './offices-master-form.component.html',
  styleUrl: './offices-master-form.component.css'
})
export class OfficesMasterFormComponent {
  displayedColumns: string[] = ['srNo', 'officeName', 'officeType', 'organizationName', 'actions'];
  offices = new MatTableDataSource<Office>();
  filterValue = '';

  private adminService = inject(AdminService);
  private toastService = inject(ToasterService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadOffices();
  }

  ngAfterViewInit(): void {
    this.offices.paginator = this.paginator;
  }

  private loadOffices(): void {
    this.adminService.getOfficeMaster().subscribe({
      next: (res: Office[]) => {
        this.offices.data = res;
        this.offices.filterPredicate = (data: Office, filter: string): boolean => {
          const search = filter.trim().toLowerCase();
          const officeName = data.officeName?.toLowerCase() || '';
          const orgCode = data.organization?.organizationCode?.toLowerCase() || '';
          const orgName = data.organization?.organizationName?.toLowerCase() || '';
          return officeName.includes(search) || orgCode.includes(search) || orgName.includes(search);
        };
      },
      error: err => console.error(err),
    });
  }

  applyFilter(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue = filter;
    this.offices.filter = filter.trim().toLowerCase();
    if (this.offices.paginator) this.offices.paginator.firstPage();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(OfficesMasterDialogComponent, {
      width: '400px',
      data: { mode: 'add', office: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'add' && result.office) {
        this.adminService.addOffice(result.office).subscribe({
          next: () => {
            this.loadOffices();
            this.toastService.success('Office Added Successfully');
          },
          error: () => this.toastService.error('Failed To Add Office')
        });
      }
    });
  }

  openEditDialog(office: Office): void {
    const dialogRef = this.dialog.open(OfficesMasterDialogComponent, {
      width: '400px',
      data: { mode: 'edit', office: { ...office } }
    });

    dialogRef.afterClosed().subscribe(result => {
      const updateOfficeData: any = {
        officeName: result.office.officeName,
        organization: { organizationId: result.office.organization.organizationId },
        officeTypeId: { officeTypeId: result.office.officeTypeId.officeTypeId }
      };
      if (result?.action === 'edit' && updateOfficeData && office.officeId) {
        this.adminService.updateOffice(office.officeId, updateOfficeData).subscribe({
          next: () => {
            this.loadOffices();
            this.toastService.success('Office Updated Successfully');
          },
          error: () => this.toastService.error('Failed To Update Office')
        });
      }
    });
  }

  openDeleteDialog(office: Office): void {
    const dialogRef = this.dialog.open(OfficesMasterDialogComponent, {
      width: '350px',
      data: { mode: 'delete', office }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'delete' && office.officeId) {
        this.adminService.deleteOffice(office.officeId).subscribe({
          next: () => {
            this.loadOffices();
            this.toastService.success('Office Deleted Successfully');
          },
          error: () => this.toastService.error('Failed To Delete Office')
        });
      }
    });
  }
}
