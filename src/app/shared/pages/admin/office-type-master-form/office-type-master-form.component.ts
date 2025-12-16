import { Component, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from '../../../service/admin.service';
import { ToasterService } from '../../../utilities/toaster.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { OfficeTypeMasterDialogComponent } from './office-type-master-dialog/office-type-master-dialog.component';

export interface OfficeType {
  officeTypeId?: number;         // Primary key (optional for new records)
  officeTypeName: string;        // Name of the office type (e.g., PIU, RO, etc.)
  officeTypeCode: string;        // Short code for the office type (e.g., PIU1, RO2)
  createdAt?: string | Date;     // (optional) timestamp for when created
  updatedAt?: string | Date;     // (optional) timestamp for when last updated
}

@Component({
  selector: 'app-office-type-master-form',
  standalone: false,
  templateUrl: './office-type-master-form.component.html',
  styleUrl: './office-type-master-form.component.css'
})

export class OfficeTypeMasterFormComponent {

  displayedColumns: string[] = ['srNo', 'officeTypeName', 'officeTypeCode', 'actions'];
  officeTypes = new MatTableDataSource<OfficeType>();
  filterValue = '';

  private adminService = inject(AdminService);
  private toastService = inject(ToasterService);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadOfficeTypes();
  }

  ngAfterViewInit(): void {
    this.officeTypes.paginator = this.paginator;
  }

  /** Load Office Type Master Data */
  private loadOfficeTypes(): void {
    this.adminService.getOfficeTypeMaster().subscribe({
      next: (res: OfficeType[]) => {
        this.officeTypes.data = res;
        this.officeTypes.filterPredicate = (data: OfficeType, filter: string): boolean => {
          const search = filter.trim().toLowerCase();
          const name = data.officeTypeName?.toLowerCase() || '';
          const code = data.officeTypeCode?.toLowerCase() || '';
          return name.includes(search) || code.includes(search);
        };
      },
      error: (err:Error) => console.error(err),
    });
  }

  applyFilter(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue = filter;
    this.officeTypes.filter = filter.trim().toLowerCase();
    if (this.officeTypes.paginator) this.officeTypes.paginator.firstPage();
  }

  /** Add Office Type */
  openAddDialog(): void {
    const dialogRef = this.dialog.open(OfficeTypeMasterDialogComponent, {
      width: '400px',
      data: { mode: 'add', officeType: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'add' && result.officeType) {
        this.adminService.addOfficeType(result.officeType).subscribe({
          next: () => {
            this.loadOfficeTypes();
            this.toastService.success('Office Type Added Successfully');
          },
          error: () => this.toastService.error('Failed To Add Office Type'),
        });
      }
    });
  }

  /** Edit Office Type */
  openEditDialog(type: OfficeType): void {
    const dialogRef = this.dialog.open(OfficeTypeMasterDialogComponent, {
      width: '400px',
      data: { mode: 'edit', officeType: { ...type } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit' && result.officeType && type.officeTypeId) {
        this.adminService.updateOfficeType(type.officeTypeId, result.officeType).subscribe({
          next: () => {
            this.loadOfficeTypes();
            this.toastService.success('Office Type Updated Successfully');
          },
          error: () => this.toastService.error('Failed To Update Office Type'),
        });
      }
    });
  }

  /** Delete Office Type */
  openDeleteDialog(type: OfficeType): void {
    const dialogRef = this.dialog.open(OfficeTypeMasterDialogComponent, {
      width: '350px',
      data: { mode: 'delete', officeType: type }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'delete' && type.officeTypeId) {
        this.adminService.deleteOfficeType(type.officeTypeId).subscribe({
          next: () => {
            this.loadOfficeTypes();
            this.toastService.success('Office Type Deleted Successfully');
          },
          error: () => this.toastService.error('Failed To Delete Office Type'),
        });
      }
    });
  }
}
