import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Role, User } from '../../../../interface/user.model';
import { AdminService } from '../../../../service/admin.service';
import { UsermgmtService } from '../../../../service/usermgmt.service';

@Component({
  selector: 'app-user-master-dialog',
  standalone: false,
  templateUrl: './user-master-dialog.component.html',
  styleUrl: './user-master-dialog.component.css'
})
export class UserMasterDialogComponent {
  userForm!: FormGroup;

  // Cascade dropdown data
  organizations: any[] = [];
  officeTypes: any[]  = [];
  offices: any[]      = [];
  divisions: any[]    = [];
  designations: any[] = [];
  roles: any[]        = [];

  private fb           = inject(FormBuilder);
  private adminService = inject(AdminService);
  private userMgmtService = inject(UsermgmtService);

  constructor(
    public dialogRef: MatDialogRef<UserMasterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (!this.data.user) {
      this.data.user = {
        organization: '', role: '', office: '',
        designation: '', name: '', contactNumber: '', emailId: '', loginId: ''
      };
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadRoles();
    this.loadOrganizations();
  }

  /** Initialize reactive form */
  initializeForm() {
    const isEdit = this.data.mode === 'edit';
    const u = this.data.user;

    this.userForm = this.fb.group({
      organization: [isEdit ? u.organizationId  : '', Validators.required],
      officeType:   [isEdit ? ''                : '', Validators.required],
      office:       [isEdit ? u.officeId        : '', Validators.required],
      division:     [isEdit ? ''                : '', Validators.required],
      designation:  [isEdit ? u.designationId   : '', Validators.required],
      role:         [isEdit ? u.roles?.[0]?.roleId : '', Validators.required],
      name:         [isEdit ? u.name            : '', Validators.required],
      contactNumber:[isEdit ? u.contactNumber   : '', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      emailId:      [isEdit ? u.emailId         : '', [Validators.required, Validators.email]],
      loginId:      [isEdit ? u.loginId         : '', Validators.required]
    });
  }

  /** Load organization list then trigger cascade pre-fill for edit */
  loadOrganizations() {
    this.adminService.getOrganizationMaster().subscribe({
      next: (res: any) => {
        this.organizations = res;
        if (this.data.mode === 'edit' && this.data.user.organizationId) {
          this.prefillCascadeForEdit();
        }
      },
      error: (err: Error) => console.error('Failed to load organizations', err)
    });
  }

  loadRoles(): void {
    this.adminService.getRoleMaster().subscribe({
      next: (res: Role[]) => {
        this.roles = res.filter(r => r.roleName !== 'VIP_Admin');
      },
      error: (err) => console.error(err)
    });
  }

  // ─── CASCADE CHANGE HANDLERS ───────────────────────────────────────────────

  onOrganizationChange(orgId: number): void {
    // Reset all downstream
    this.officeTypes  = [];
    this.offices      = [];
    this.divisions    = [];
    this.designations = [];
    this.userForm.patchValue({ officeType: '', office: '', division: '', designation: '' });

    if (!orgId) return;
    this.userMgmtService.getOfficeTypesByOrg(orgId).subscribe({
      next: (res: any[]) => { this.officeTypes = res; },
      error: err => console.error(err)
    });
  }

  onOfficeTypeChange(officeTypeId: number): void {
    this.offices      = [];
    this.divisions    = [];
    this.designations = [];
    this.userForm.patchValue({ office: '', division: '', designation: '' });

    if (!officeTypeId) return;
    this.userMgmtService.getOfficesByOfficeType(officeTypeId).subscribe({
      next: (res: any[]) => { this.offices = res; },
      error: err => console.error(err)
    });
  }

  onOfficeChange(officeId: number): void {
    this.divisions    = [];
    this.designations = [];
    this.userForm.patchValue({ division: '', designation: '' });

    if (!officeId) return;
    this.userMgmtService.getDivisionsByOffice(officeId).subscribe({
      next: (res: any[]) => { this.divisions = res; },
      error: err => console.error(err)
    });
  }

  onDivisionChange(divisionId: number): void {
    this.designations = [];
    this.userForm.patchValue({ designation: '' });

    if (!divisionId) return;
    this.userMgmtService.getDesignationsByDivision(divisionId).subscribe({
      next: (res: any[]) => { this.designations = res; },
      error: err => console.error(err)
    });
  }

  // ─── EDIT MODE: PRE-FILL CASCADE ──────────────────────────────────────────
  // Chain: load office types → find matching type for user's office →
  //        load offices → load divisions → find matching division for
  //        user's designation → load designations.

  private prefillCascadeForEdit(): void {
    const orgId       = this.data.user.organizationId;
    const officeId    = this.data.user.officeId;
    const designationId = this.data.user.designationId;

    // Step 1: load office types for this org
    this.userMgmtService.getOfficeTypesByOrg(orgId).subscribe({
      next: (types: any[]) => {
        this.officeTypes = types;

        // Step 2: find which office type the user's office belongs to
        // We iterate over types and load offices for each until we find ours
        this.findOfficeTypeForOffice(types, officeId, (matchedTypeId: number) => {
          this.userForm.patchValue({ officeType: matchedTypeId });

          // Step 3: load offices for that type
          this.userMgmtService.getOfficesByOfficeType(matchedTypeId).subscribe({
            next: (officeList: any[]) => {
              this.offices = officeList;
              this.userForm.patchValue({ office: officeId });

              // Step 4: load divisions for the office
              this.userMgmtService.getDivisionsByOffice(officeId).subscribe({
                next: (divList: any[]) => {
                  this.divisions = divList;

                  // Step 5: find which division the designation belongs to
                  this.findDivisionForDesignation(divList, designationId, (matchedDivId: number) => {
                    this.userForm.patchValue({ division: matchedDivId });

                    // Step 6: load designations for that division
                    this.userMgmtService.getDesignationsByDivision(matchedDivId).subscribe({
                      next: (desigList: any[]) => {
                        this.designations = desigList;
                        this.userForm.patchValue({ designation: designationId });
                      },
                      error: err => console.error(err)
                    });
                  });
                },
                error: err => console.error(err)
              });
            },
            error: err => console.error(err)
          });
        });
      },
      error: err => console.error(err)
    });
  }

  /** Try each office type to find which one contains the given officeId */
  private findOfficeTypeForOffice(types: any[], officeId: number, callback: (typeId: number) => void): void {
    let found = false;
    let checked = 0;

    for (const type of types) {
      this.userMgmtService.getOfficesByOfficeType(type.officeTypeId ?? type.typeId ?? type.id).subscribe({
        next: (officeList: any[]) => {
          checked++;
          if (!found && officeList.some((o: any) => o.officeId === officeId)) {
            found = true;
            callback(type.officeTypeId ?? type.typeId ?? type.id);
          }
        },
        error: () => { checked++; }
      });
    }
  }

  /** Try each division to find which one contains the given designationId */
  private findDivisionForDesignation(divisions: any[], designationId: number, callback: (divId: number) => void): void {
    let found = false;
    let checked = 0;

    for (const div of divisions) {
      this.userMgmtService.getDesignationsByDivision(div.divisionId).subscribe({
        next: (desigList: any[]) => {
          checked++;
          if (!found && desigList.some((d: any) => d.designationId === designationId)) {
            found = true;
            callback(div.divisionId);
          }
        },
        error: () => { checked++; }
      });
    }
  }

  // ─── FORM ACTIONS ──────────────────────────────────────────────────────────

  saveUser() {
    if (this.userForm.valid) {
      this.dialogRef.close({ action: 'add', user: this.userForm.value });
    }
  }

  updateUser() {
    if (this.userForm.valid) {
      this.dialogRef.close({ action: 'edit', user: this.userForm.value });
    }
  }

  deleteUser() {
    this.dialogRef.close({ action: 'delete', user: this.data.user });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
