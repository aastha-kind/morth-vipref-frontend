import { Component, inject, ViewChild } from '@angular/core';
import { SubCategoryMasterDialogComponent } from './sub-category-master-dialog/sub-category-master-dialog.component';
import { SubCategory } from '../../../interface/sub-category.model';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { AdminService } from '../../../service/admin.service';
import { ToasterService } from '../../../utilities/toaster.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-sub-category-master',
  standalone: false,
  templateUrl: './sub-category-master.component.html',
  styleUrl: './sub-category-master.component.css'
})
export class SubCategoryMasterComponent {
  displayedColumns: string[] = ['srNo', 'subCategoryDescription', 'categoryName', 'actions'];
  subCategories = new MatTableDataSource<SubCategory>();
  filterValue = '';

  private adminService = inject(AdminService);
  private toastService = inject(ToasterService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadSubCategories();
  }

  ngAfterViewInit(): void {
    this.subCategories.paginator = this.paginator;
  }

  private loadSubCategories(): void {
    this.adminService.getSubCategoryMaster().subscribe({
      next: (res: SubCategory[]) => {
        this.subCategories.data = res;
        this.subCategories.filterPredicate = (data: SubCategory, filter: string): boolean => {
          const search = filter.trim().toLowerCase();
          const subCatName = data.subCatName?.toLowerCase() || '';
          const catDesc = data.category?.categoryDescription?.toLowerCase() || '';
          return subCatName.includes(search) || catDesc.includes(search);
        };
      },
      error: (err: Error) => this.toastService.error('Failed To load Sub-Category'),
    });
  }

  applyFilter(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue = filter;
    this.subCategories.filter = filter.trim().toLowerCase();
    if (this.subCategories.paginator) this.subCategories.paginator.firstPage();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(SubCategoryMasterDialogComponent, {
      width: '400px',
      data: { mode: 'add', subCategory: {} }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'add' && result.subCategory) {
        this.adminService.addSubCategory(result.subCategory).subscribe({
          next: () => {
            this.loadSubCategories();
            this.toastService.success('Sub-Category Added Successfully');
          },
          error: () => this.toastService.error('Failed To Add Sub-Category')
        });
      }
    });
  }

  openEditDialog(subCategory: SubCategory): void {
    const dialogRef = this.dialog.open(SubCategoryMasterDialogComponent, {
      width: '400px',
      data: { mode: 'edit', subCategory: { ...subCategory } }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit' && subCategory.subCatId) {
        const updateData: any = {
          subCatName: result.subCategory.subCatName,
          category: { categoryId: result.subCategory.category.categoryId }
        };
        this.adminService.updateSubCategory(subCategory.subCatId, updateData).subscribe({
          next: () => {
            this.loadSubCategories();
            this.toastService.success('Sub-Category Updated Successfully');
          },
          error: () => this.toastService.error('Failed To Update Sub-Category')
        });
      }
    });
  }

  openDeleteDialog(subCategory: SubCategory): void {
    const dialogRef = this.dialog.open(SubCategoryMasterDialogComponent, {
      width: '350px',
      data: { mode: 'delete', subCategory }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'delete' && subCategory.subCatId) {
        this.adminService.deleteSubCategory(subCategory.subCatId).subscribe({
          next: () => {
            this.loadSubCategories();
            this.toastService.success('Sub-Category Deleted Successfully');
          },
          error: () => this.toastService.error('Failed To Delete Sub-Category')
        });
      }
    });
  }
}
