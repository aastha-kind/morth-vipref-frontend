import { AfterViewInit, Component, inject, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { VipReference } from '../dashboard/dashboard.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { UsermgmtService } from '../../service/usermgmt.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../interface/user.model';
import { MatDialog } from '@angular/material/dialog';
import { ViewReferenceComponent } from '../view-reference/view-reference.component';

@Component({
  selector: 'app-vip-assigner',
  standalone: false,
  templateUrl: './vip-assigner.component.html',
  styleUrl: './vip-assigner.component.css'
})
export class VipAssignerComponent implements AfterViewInit {

  userDetails!: User;
  @Input() selectedQueueData: string = "";
  searchTerm: string = '';
  officeTypeFilter: string | null = null;

  // Pagination variables
  pageIndex: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  sortColumn: string = 'assignedAt';
  sortDirection: string = 'desc';

  private router = inject(Router);
  private userMgmtService = inject(UsermgmtService);
  private ngxService = inject(NgxUiLoaderService);
  private toasterService = inject(ToastrService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'referenceNo',
    'office',
    'subject',
    'assignedAt',
    // 'status',
    // 'currentQueue',
    'actions'
  ];
  queueReferencesData = new MatTableDataSource<VipReference>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.getUserDetails();
    this.getQueueReferences();
  }

  ngAfterViewInit() {
    this.initializeSort();
  }

  initializeSort() {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        this.sortColumn = this.sort.active;
        this.sortDirection = this.sort.direction || 'asc';
        this.pageIndex = 0;
        this.getQueueReferences();
      });
    }
  }

  getUserDetails() {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      this.userDetails = JSON.parse(userData);
    }
  }

  getQueueReferences() {
    this.ngxService.start();
    const queueData = {
      loginId: this.userDetails.loginId,
      queue: 'VIP_Assigner',
      status: "INBOX",
      search: this.searchTerm,
      page: this.pageIndex,
      size: this.pageSize,
      sortBy: this.sortColumn,
      sortDir: this.sortDirection
    }
    this.userMgmtService.getQueueReferencesListPaginated(queueData).subscribe({
      next: (res) => {
        let data = res.content;

        // Apply client-side office type filter if set
        if (this.officeTypeFilter) {
          data = data.filter((item: VipReference) => item.initiatorOfficeType === this.officeTypeFilter);
          this.totalElements = data.length;
        } else {
          this.totalElements = res.totalElements;
        }

        this.queueReferencesData.data = data;
        this.ngxService.stop();
      },
      error: (err) => {
        this.ngxService.stop();
        this.toasterService.error('Failed to load references');
      }
    })
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getQueueReferences();
  }


  addSelectedReference(ref: VipReference) {

  }

  viewReference(ref: VipReference) {
    this.userMgmtService.setReferenceDetails(ref);
    this.router.navigate([`/dashboard/add-reference`], {
      state: { previousRoute: '/dashboard/vip-assigner' }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchTerm = '';
    this.officeTypeFilter = null;
    this.pageIndex = 0; // Reset to first page on new search

    // Check if searching for office type
    if (filterValue.includes('minister') || filterValue.includes('ministry')) {
      this.officeTypeFilter = 'MINISTRY';
    } else if (filterValue.includes('secretary')) {
      this.officeTypeFilter = 'SECRETARY';
    } else {
      // Regular reference number search
      this.searchTerm = filterValue;
    }

    this.getQueueReferences(); // Fetch from server with search term
  }

  navigateToDetails(ref: VipReference) {
    this.userMgmtService.setReferenceDetails(ref);
    this.router.navigate([`/dashboard/add-reference`], {
      state: { previousRoute: '/dashboard/vip-assigner' }
    });
  }

}
