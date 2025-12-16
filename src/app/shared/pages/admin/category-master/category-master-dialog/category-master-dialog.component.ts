import { Component, Inject } from '@angular/core';
import { AdminService } from '../../../../service/admin.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-category-master-dialog',
  standalone: false,
  templateUrl: './category-master-dialog.component.html',
  styleUrl: './category-master-dialog.component.css'
})
export class CategoryMasterDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CategoryMasterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private adminService: AdminService
  ) {
    if (!this.data.category) {
      this.data.category = { categoryCode: '', categoryDescription: '' };
    }
  }

  saveCategory() {
    this.dialogRef.close({ action: 'add', category: this.data.category });
  }

  updateCategory() {
    this.dialogRef.close({ action: 'edit', category: this.data.category });
  }

  deleteCategory() {
    this.dialogRef.close({ action: 'delete', category: this.data.category });
  }
}
