import { Component, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '../../../interface/user.model';
import { AdminService } from '../../../service/admin.service';
import { ToasterService } from '../../../utilities/toaster.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UserMasterDialogComponent } from './user-master-dialog/user-master-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-user-master',
  standalone: false,
  templateUrl: './user-master.component.html',
  styleUrl: './user-master.component.css'
})
export class UserMasterComponent {
  displayedColumns: string[] = [
    'srNo',
    'organization',
    'office',
    'designation',
    'role',
    'name',
    'contactNumber',
    'emailId',
    'loginId',
    'status',
    'actions'
  ];

  users = new MatTableDataSource<User>();
  filterValue = '';
  totalUsers = 0;
  pageSize = 10;
  pageIndex = 0;
  statusFilter = 'all';
  allUsers: any[] = [];

  private adminService = inject(AdminService);
  private toastService = inject(ToasterService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.users.paginator = this.paginator;
  }

  private loadUsers(): void {
    this.adminService.getAllUsers(0, 10000, '').subscribe({
      next: (res: any) => {
        this.allUsers = res.content;
        this.applyStatusFilter();
      },
      error: () => this.toastService.error('Failed To Load Users')
    });
  }

  applyFilter(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue = filter.trim().toLowerCase();
    this.applyStatusFilter();
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter = value;
    this.applyStatusFilter();
  }

  private applyStatusFilter(): void {
    let filtered = [...this.allUsers];

    if (this.statusFilter === 'active') {
      filtered = filtered.filter(u => u.officeId != null);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(u => u.officeId == null);
    }

    if (this.filterValue) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(this.filterValue) ||
        u.organizationName?.toLowerCase().includes(this.filterValue) ||
        u.designationName?.toLowerCase().includes(this.filterValue) ||
        u.loginId?.toLowerCase().includes(this.filterValue)
      );
    }

    this.users.data = filtered;
    this.totalUsers = filtered.length;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserMasterDialogComponent, {
      width: '800px',
      data: { mode: 'add', user: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'add' && result.user) {
        const { officeType, division, role, ...rest } = result.user;
        const addUserData = { ...rest, roleIds: [role] };
        this.adminService.addUser(addUserData).subscribe({
          next: () => {
            this.loadUsers();
            this.toastService.success('User Added Successfully');
          },
          error: () => this.toastService.error('Failed To Add User')
        });
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserMasterDialogComponent, {
      width: '800px',
      data: { mode: 'edit', user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit' && user.id) {
        const { officeType, division, role, ...rest } = result.user;
        const editUserData = { ...rest, roleIds: [role] };
        this.adminService.updateUser(user.id, editUserData).subscribe({
          next: () => {
            this.loadUsers();
            this.toastService.success('User Updated Successfully');
          },
          error: () => this.toastService.error('Failed To Update User')
        });
      }
    });
  }

  openDeleteDialog(user: User): void {
    const dialogRef = this.dialog.open(UserMasterDialogComponent, {
      width: '350px',
      data: { mode: 'delete', user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'delete' && user.id) {
        this.adminService.deleteUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
            this.toastService.success('User Deleted Successfully');
          },
          error: () => this.toastService.error('Failed To Delete User')
        });
      }
    });
  }

  openChangePasswordDialog(user: User): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '450px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'changePassword' && user.id) {
        this.adminService.changePassword(user.id, result.newPassword).subscribe({
          next: () => {
            this.toastService.success('Password Changed Successfully');
          },
          error: () => this.toastService.error('Failed To Change Password')
        });
      }
    });
  }

  toggleUserLock(user: User): void {
    if (!user.id) return;

    const newLockStatus = !user.userLocked;
    const action = newLockStatus ? 'lock' : 'unlock';

    this.adminService.toggleUserLock(user.id, newLockStatus).subscribe({
      next: () => {
        user.userLocked = newLockStatus;
        const message = newLockStatus ? 'User Locked Successfully' : 'User Unlocked Successfully';
        this.toastService.success(message);
      },
      error: () => {
        const message = `Failed To ${action.charAt(0).toUpperCase() + action.slice(1)} User`;
        this.toastService.error(message);
      }
    });
  }
}
