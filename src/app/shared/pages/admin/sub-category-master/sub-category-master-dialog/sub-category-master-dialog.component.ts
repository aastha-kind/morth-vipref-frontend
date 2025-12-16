import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../../../service/admin.service';
import { ToasterService } from '../../../../utilities/toaster.service';

@Component({
  selector: 'app-sub-category-master-dialog',
  standalone: false,
  templateUrl: './sub-category-master-dialog.component.html',
  styleUrl: './sub-category-master-dialog.component.css'
})
export class SubCategoryMasterDialogComponent {
categories: any[] = [];

  private adminService = inject(AdminService);
  private toastService=inject(ToasterService);

  constructor(
    public dialogRef: MatDialogRef<SubCategoryMasterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (!this.data.subCategory) {
      this.data.subCategory = {  subCatName: '', category: { categoryId: null } };
    }
    if (!this.data.subCategory.category) {
      this.data.subCategory.category = { categoryId: null };
    }
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.adminService.getCategoryMaster().subscribe({
      next: (res: any) => (this.categories = res),
      error: (err: Error) => this.toastService.error('Failed To Load Sub-Category'),
    });
  }

  saveSubCategory(): void {
    this.dialogRef.close({ action: 'add', subCategory: this.data.subCategory });
  }

  updateSubCategory(): void {
    this.dialogRef.close({ action: 'edit', subCategory: this.data.subCategory });
  }

  deleteSubCategory(): void {
    this.dialogRef.close({ action: 'delete', subCategory: this.data.subCategory });
  }
}
