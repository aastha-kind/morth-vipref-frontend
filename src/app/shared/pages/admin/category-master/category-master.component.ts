import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ToasterService } from '../../../utilities/toaster.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from '../../../service/admin.service';
import { Category } from '../../../interface/category.model';
import { CategoryMasterDialogComponent } from './category-master-dialog/category-master-dialog.component';

@Component({
  selector: 'app-category-master',
  standalone: false,
  templateUrl: './category-master.component.html',
  styleUrl: './category-master.component.css'
})
export class CategoryMasterComponent {

  displayedColumns: string[] = ['srNo', 'categoryCode', 'categoryDescription', 'actions'];
  categoryMasterData = new MatTableDataSource<Category>();
  filterValue = '';

  private adminService = inject(AdminService);
  private toastService = inject(ToasterService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadCategoryMaster();
  }

  ngAfterViewInit(): void {
    this.categoryMasterData.paginator = this.paginator;
  }

  private loadCategoryMaster(): void {
    this.adminService.getCategoryMaster().subscribe({
      next: (res: Category[]) => {
        this.categoryMasterData.data = res;
        this.categoryMasterData.filterPredicate = (data: Category, filter: string): boolean => {
          const search = filter.trim().toLowerCase();
          const categoryCode = data.categoryCode?.toLowerCase() || '';
          const categoryDescription = data.categoryDescription?.toLowerCase() || '';
          return categoryCode.includes(search) || categoryDescription.includes(search) 
        };
      },
      error: err => console.error(err),
    });
  }

  applyFilter(event: Event): void {
    const filter = (event.target as HTMLInputElement).value;
    this.filterValue = filter;
    this.categoryMasterData.filter = filter.trim().toLowerCase();
    if (this.categoryMasterData.paginator) this.categoryMasterData.paginator.firstPage();
  }

openAddDialog(): void {
  const dialogRef = this.dialog.open(CategoryMasterDialogComponent, {
    width: '400px',
    data: { mode: 'add', category: {} }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.action === 'add' && result.category) {
      this.adminService.addCategory(result.category).subscribe({
        next: () => {
          this.loadCategoryMaster();
          this.toastService.success('Category Added Successfully');
        },
        error: () => this.toastService.error('Failed To Add Category')
      });
    }
  });
}

openEditDialog(category: any): void {
  const dialogRef = this.dialog.open(CategoryMasterDialogComponent, {
    width: '400px',
    data: { mode: 'edit', category: { ...category } }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.action === 'edit' && category.categoryId) {
      this.adminService.updateCategory(category.categoryId, result.category).subscribe({
        next: () => {
          this.loadCategoryMaster();
          this.toastService.success('Category Updated Successfully');
        },
        error: () => this.toastService.error('Failed To Update Category')
      });
    }
  });
}

openDeleteDialog(category: any): void {
  const dialogRef = this.dialog.open(CategoryMasterDialogComponent, {
    width: '350px',
    data: { mode: 'delete', category }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.action === 'delete' && category.categoryId) {
      this.adminService.deleteCategory(category.categoryId).subscribe({
        next: () => {
          this.loadCategoryMaster();
          this.toastService.success('Category Deleted Successfully');
        },
        error: () => this.toastService.error('Failed To Delete Category')
      });
    }
  });
}
}
