import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-role-master-dialog',
  standalone: false,
  templateUrl: './role-master-dialog.component.html',
  styleUrl: './role-master-dialog.component.css'
})
export class RoleMasterDialogComponent {
constructor(
    public dialogRef: MatDialogRef<RoleMasterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  saveRole(): void {
    this.dialogRef.close({ action: 'add', role: this.data.role });
  }

  updateRole(): void {
    this.dialogRef.close({ action: 'edit', role: this.data.role });
  }

  deleteRole(): void {
    this.dialogRef.close({ action: 'delete', role: this.data.role });
  }
}
