import { Component, inject, Input, ViewChild } from '@angular/core';
import { VipReference } from '../dashboard/dashboard.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UsermgmtService } from '../../service/usermgmt.service';
import { Router } from '@angular/router';
import { User } from '../../interface/user.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-vip-final-reply',
  standalone: false,
  templateUrl: './vip-final-reply.component.html',
  styleUrl: './vip-final-reply.component.css'
})
export class VipFinalReplyComponent {
  userDetails!: User;
  @Input() selectedQueueData: string = "";
  searchTerm: string = ''; // Add search term variable

  // Pagination variables
  pageIndex: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;

  private router = inject(Router);
  private userMgmtService = inject(UsermgmtService);
  private ngxService = inject(NgxUiLoaderService);
  private toasterService = inject(ToastrService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'referenceNo',
    'subject',
    'assignedAt',
    'status',
    'currentQueue',
    'actions'
  ];
  queueReferencesData = new MatTableDataSource<VipReference>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.getUserDetails();
    this.getQueueReferences();
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
      queue: 'VIP_final_reply',
      status: "INBOX",
      search: this.searchTerm, // Include search parameter
      page: this.pageIndex, // Include page number
      size: this.pageSize // Include page size
    }
    this.userMgmtService.getQueueReferencesListPaginated(queueData).subscribe({
      next: (res) => {
        this.queueReferencesData.data = res.content;
        this.totalElements = res.totalElements;
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
      state: { previousRoute: '/dashboard/vip-final-reply' }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.searchTerm = filterValue;
    this.pageIndex = 0; // Reset to first page on new search
    this.getQueueReferences(); // Fetch from server with search term
  }

  navigateToDetails(ref: VipReference) {
    this.userMgmtService.setReferenceDetails(ref);
    this.router.navigate([`/dashboard/add-reference`], {
      state: { previousRoute: '/dashboard/vip-final-reply' }
    });
  }

}
