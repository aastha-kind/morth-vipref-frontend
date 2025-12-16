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

  private adminService = inject(AdminService);
  private toastService = inject(ToasterService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    // Listen to paginator events
    if (this.paginator) {
      this.paginator.page.subscribe(() => {
        this.pageIndex = this.paginator.pageIndex;
        this.pageSize = this.paginator.pageSize;
        this.loadUsers();
      });
    }
  }

  private loadUsers(): void {
    this.adminService.getAllUsers(this.pageIndex, this.pageSize, this.filterValue).subscribe({
      next: (res: any) => {
        this.users.data = res.content;
        this.totalUsers = res.totalElements;
      },
      error: () => this.toastService.error('Failed To Load Users')
    });
  }

  applyFilter(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue = filter.trim();
    this.pageIndex = 0; // Reset to first page on search
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadUsers();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserMasterDialogComponent, {
      width: '700px',
      data: { mode: 'add', user: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'add' && result.user) {
        const addUserData={
          ...result.user,
          roleIds:[result.user?.role]
        }
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
      width: '700px',
      data: { mode: 'edit', user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit' && user.id) {
        const editUserData={
          ...result.user,
          roleIds:[result.user?.role]
        }
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
