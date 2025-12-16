import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Role, User } from '../../../../interface/user.model';
import { AdminService } from '../../../../service/admin.service';

@Component({
  selector: 'app-user-master-dialog',
  standalone: false,
  templateUrl: './user-master-dialog.component.html',
  styleUrl: './user-master-dialog.component.css'
})
export class UserMasterDialogComponent {
  userForm!: FormGroup;
  organizations: any[] = [];
  offices: any[] = [];
  designations: any[] = [];
  roles: any[] = [];

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  constructor(
    public dialogRef: MatDialogRef<UserMasterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // ✅ Initialize user object if missing
    if (!this.data.user) {
      this.data.user = {
        organization: '',
        role: '',
        office: '',
        designation: '',
        name: '',
        contactNumber: '',
        emailId: ''
      };
    }
  }

  ngOnInit(): void {

    this.loadOrganizations();
    this.loadOffices();
    this.loadDesignation();
    this.loadRoles();
    this.initializeForm();
  }

  /** 🔹 Initialize reactive form */
  initializeForm() {
    if (this.data.mode == 'add') {
      this.userForm = this.fb.group({
        organization: ['', Validators.required],
        office: ['', Validators.required],
        designation: ['', Validators.required],
        name: ['', Validators.required],
        role: ['', Validators.required],
        contactNumber: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{10}$/)]
        ],
        emailId: ['', [Validators.required, Validators.email]]
      });
    }
    else{
      this.userForm = this.fb.group({
        organization: [this.data.user.organizationId, Validators.required],
        office: [this.data.user.officeId, Validators.required],
        designation: [this.data.user.designationId, Validators.required],
        name: [this.data.user.name, Validators.required],
        role: [this.data.user.roles[0]?.roleId, Validators.required],
        contactNumber: [
          this.data.user.contactNumber,
          [Validators.required, Validators.pattern(/^[0-9]{10}$/)]
        ],
        emailId: [this.data.user.emailId, [Validators.required, Validators.email]]
      });
    }

  }

  /** 🔹 Load organization list */
  loadOrganizations() {
    this.adminService.getOrganizationMaster().subscribe({
      next: (res: any) => {
        this.organizations = res;
      },
      error: (err: Error) => console.error('Failed to load organizations', err)
    });
  }

  private loadOffices(): void {
    this.adminService.getOfficeMaster().subscribe({
      next: (res: any[]) => {
        this.offices = res;
        res.map((data: any) => {
          return {
            ...data,
            officeId: JSON.stringify(data.officeId)
          }
        });
      },
      error: err => console.error(err),
    });
  }

  private loadDesignation(): void {
    this.adminService.getUserDesignations().subscribe({
      next: (res: any) => {
        this.designations = res;
      },
      error: (err) => console.error(err)
    });
  }

  loadRoles(): void {
    this.adminService.getRoleMaster().subscribe({
      next: (res: Role[]) => {
        this.roles = res.filter((data) => data.roleName !== 'VIP_Admin');
      },
      error: (err) => console.error(err),
    });
  }

  /** 🔹 Add user action */
  saveUser() {
    if (this.userForm.valid) {
      this.dialogRef.close({ action: 'add', user: this.userForm.value });
    }
  }

  /** 🔹 Edit user action */
  updateUser() {
    if (this.userForm.valid) {
      this.dialogRef.close({ action: 'edit', user: this.userForm.value });
    }
  }

  /** 🔹 Delete user action */
  deleteUser() {
    this.dialogRef.close({ action: 'delete', user: this.data.user });
  }

  /** 🔹 Cancel/close dialog */
  closeDialog() {
    this.dialogRef.close();
  }
}
