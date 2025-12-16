import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from '../../../service/admin.service';
import { ToastrService } from 'ngx-toastr';
import { RoleMasterDialogComponent } from './role-master-dialog/role-master-dialog.component';
import { Role } from '../../../interface/user.model';
import { ToasterService } from '../../../utilities/toaster.service';

@Component({
  selector: 'app-role-master',
  standalone: false,
  templateUrl: './role-master.component.html',
  styleUrl: './role-master.component.css'
})
export class RoleMasterComponent {
  displayedColumns: string[] = ['srNo', 'roleName', 'roleDescription', 'actions'];
  roles = new MatTableDataSource<Role>();
  filterValue = '';

  private adminService = inject(AdminService);
  private toastService = inject(ToasterService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  ngAfterViewInit(): void {
    this.roles.paginator = this.paginator;
  }

  private loadRoles(): void {
    this.adminService.getRoleMaster().subscribe({
      next: (res: Role[]) => {
        this.roles.data = res;
        this.roles.filterPredicate = (data: Role, filter: string): boolean => {
          const search = filter.trim().toLowerCase();
          const roleName = data.roleName?.toLowerCase() || '';
          const roleDesc = data.roleDescription?.toLowerCase() || '';
          return roleName.includes(search) || roleDesc.includes(search);
        };
      },
      error: () => this.toastService.error('Failed To Load Roles'),
    });
  }

  applyFilter(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue = filter;
    this.roles.filter = filter.trim().toLowerCase();
    if (this.roles.paginator) this.roles.paginator.firstPage();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(RoleMasterDialogComponent, {
      width: '400px',
      data: { mode: 'add', role: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'add' && result.role) {
        this.adminService.addRole(result.role).subscribe({
          next: () => {
            this.loadRoles();
            this.toastService.success('Role Added Successfully');
          },
          error: () => this.toastService.error('Failed To Add Role')
        });
      }
    });
  }

  openEditDialog(role: Role): void {
    const dialogRef = this.dialog.open(RoleMasterDialogComponent, {
      width: '400px',
      data: { mode: 'edit', role: { ...role } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit' && role.roleId) {
        const updateData: any = {
          roleName: result.role.roleName,
          roleDescription: result.role.roleDescription
        };
        this.adminService.updateRole(role.roleId, updateData).subscribe({
          next: () => {
            this.loadRoles();
            this.toastService.success('Role Updated Successfully');
          },
          error: () => this.toastService.error('Failed To Update Role')
        });
      }
    });
  }

  openDeleteDialog(role: Role): void {
    const dialogRef = this.dialog.open(RoleMasterDialogComponent, {
      width: '350px',
      data: { mode: 'delete', role }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'delete' && role.roleId) {
        this.adminService.deleteRole(role.roleId).subscribe({
          next: () => {
            this.loadRoles();
            this.toastService.success('Role Deleted Successfully');
          },
          error: () => this.toastService.error('Failed To Delete Role')
        });
      }
    });
  }
}
