import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ChangeDetectorRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { User } from '../../interface/user.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ViewReferenceComponent } from '../view-reference/view-reference.component';
import { UsermgmtService } from '../../service/usermgmt.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { PagedResponse } from '../../interface/paged-response.model';
Chart.register(...registerables);

export interface VipReference {
  referenceId?: number;
  referenceNo: string;
  subject: string;
  receivedDate: Date;
  priority: 'High' | 'Normal' | 'Low';
  currentQueue: string;
  status: string;
  initiatorOfficeType?: string; // MINISTRY or SECRETARY
  nameOfDignitary?: string;
  designation?: string;
  state?: string;
  categoryOfSubject?: string;
  assignedAt?: Date;
  dateOfEntry?: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements AfterViewInit {
  userDetails!: User;
  selectedMenu: string = 'User Dashboard';
  isMenuOpen = false;
  @ViewChild('myChart') myChart: ElementRef | undefined; // Access canvas via ViewChild
  chart: any;
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private userMgmtService = inject(UsermgmtService);
  private ngxService = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);

  public config: any;
  displayedColumns: string[] = [
    'referenceNo',
    'subject',
    'assignedAt',
    'priority',
    'currentQueue',
    // 'status',
    'actions',
  ];
  VipReferenceData = new MatTableDataSource<VipReference>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Server-side pagination properties
  totalElements: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  searchTerm: string = '';
  sortColumn: string = 'assignedAt';
  sortDirection: string = 'desc';

  // Dashboard total for chart
  dashboardTotal: number = 0;

  // Date and Queue filters (for Assigner/Assignee only)
  selectedDateFilter: string = 'all';
  selectedQueueFilter: string = 'ALL';

  dateFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'current_week', label: 'Current Week' },
    { value: 'last_week', label: 'Last One Week' },
    { value: 'last_month', label: 'Last One Month' },
  ];

  queueFilterOptions = [
    { value: 'ALL', label: 'All Queues' },
    { value: 'VIP_Assigner', label: 'VIP Assigner Queue' },
    { value: 'VIP_final_reply', label: 'Final Reply Queue' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  // Priority filter
  selectedPriorityFilter: string = 'ALL';
  priorityFilterOptions = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'Priority', label: 'Priority' },
    { value: 'Normal', label: 'Normal' },
  ];

  ngOnInit() {
    this.getUserDetails();
    this.getDashboardStats();
    this.getVipReferenceList();
  }
  ngAfterViewInit() {
    // Chart rendering is now handled after data loads in getDashboardStats
    this.initializeSort();
  }

  initializeSort() {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        this.sortColumn = this.sort.active;
        this.sortDirection = this.sort.direction || 'asc';
        this.pageIndex = 0;
        this.getVipReferenceList();
      });
    }
  }
  renderChart() {
    // Chart will be rendered after data is loaded in getDashboardStats
    // This method is kept for backward compatibility but rendering is now done in renderChartAfterDataLoad
    if (this.config) {
      const canvas = this.myChart?.nativeElement;
      if (canvas) {
        if (this.chart) {
          this.chart.destroy();
        }
        this.chart = new Chart(canvas, this.config);
      }
    }
  }

  getUserDetails() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.userDetails = JSON.parse(userData);
    }
  }

  isAssignerOrAssignee(): boolean {
    return (
      this.userDetails?.roles?.some((role) => {
        const roleName = role.roleName?.toLowerCase() || '';
        return roleName.includes('assigner') || roleName.includes('assignee');
      }) || false
    );
  }

  // Check if user is Assigner (has queue filter)
  isAssigner(): boolean {
    return (
      this.userDetails?.roles?.some((role) => {
        const roleName = role.roleName?.toLowerCase() || '';
        return roleName.includes('assigner') && !roleName.includes('assignee');
      }) || false
    );
  }

  // Check if user is Assignee (no queue filter)
  isAssignee(): boolean {
    return (
      this.userDetails?.roles?.some((role) => {
        const roleName = role.roleName?.toLowerCase() || '';
        return roleName.includes('assignee');
      }) || false
    );
  }

  // Handle date filter change
  onDateFilterChange() {
    this.pageIndex = 0;
    this.getVipReferenceList();
  }

  // Handle queue filter change
  onQueueFilterChange() {
    this.pageIndex = 0;
    this.getVipReferenceList();
  }

  // Handle priority filter change
  onPriorityFilterChange() {
    this.pageIndex = 0;
    this.getVipReferenceList();
  }

  // Calculate date range based on filter
  getDateRange(): { startDate: string | null; endDate: string | null } {
    // If 'all' is selected, return null values immediately
    if (this.selectedDateFilter === 'all') {
      return { startDate: null, endDate: null };
    }

    const today = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (this.selectedDateFilter) {
      case 'current_week':
        // Current week (Sunday to today)
        const dayOfWeek = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_week':
        // Last 7 days
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_month':
        // Last 30 days
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        // Unknown filter - no date filter
        return { startDate: null, endDate: null };
    }

    return {
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null,
    };
  }

  getDashboardStats() {
    this.ngxService.start();

    // Use different API based on user role
    const dashboardApi = this.isAssignerOrAssignee()
      ? this.userMgmtService.getDashboardStats(this.userDetails.loginId)
      : this.userMgmtService.getInitiatorDashboardStats(
          this.userDetails.loginId,
        );

    dashboardApi.subscribe({
      next: (res: any) => {
        const response = res;
        console.log('Dashboard stats response:', response);

        // Calculate dashboard total from chart data
        this.dashboardTotal = response.chartData.data.reduce(
          (sum: number, val: number) => sum + val,
          0,
        );

        // Dynamic colors based on number of labels
        const colors = this.getChartColors(response.chartData.labels.length);

        this.config = {
          type: 'doughnut',
          data: {
            labels: response.chartData.labels,
            datasets: [
              {
                label: 'Messages',
                data: response.chartData.data,
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
            },
          },
        };
        // Render chart after data is loaded
        this.renderChartAfterDataLoad();
        this.ngxService.stop();
      },
      error: (err: any) => {
        this.toastr.error('No Dashboard Data found for this user');
        this.ngxService.stop();
      },
    });
  }

  getChartColors(count: number): { background: string[]; border: string[] } {
    // Color palette for different categories
    // For Assigner: VIP Assigner Queue, Final Reply Queue, Closed, Other
    // For Initiator: Sent, In Progress
    const allColors = [
      { bg: 'rgba(0,123,255,0.5)', border: 'rgba(0,123,255,1)' }, // Blue - VIP Assigner Queue / Sent
      { bg: 'rgba(75,192,192,0.5)', border: 'rgba(75,192,192,1)' }, // Teal - Final Reply Queue / In Progress
      { bg: 'rgba(153,102,255,0.5)', border: 'rgba(153,102,255,1)' }, // Purple - Closed
      { bg: 'rgba(255,159,64,0.5)', border: 'rgba(255,159,64,1)' }, // Orange - Other
    ];

    const background = allColors.slice(0, count).map((c) => c.bg);
    const border = allColors.slice(0, count).map((c) => c.border);

    return { background, border };
  }

  renderChartAfterDataLoad() {
    setTimeout(() => {
      const canvas = this.myChart?.nativeElement;
      if (canvas && this.config) {
        // Destroy existing chart if any
        if (this.chart) {
          this.chart.destroy();
        }
        this.chart = new Chart(canvas, this.config);
      }
    }, 100);
  }

  getVipReferenceList() {
    const dateRange = this.getDateRange();
    console.log('Dashboard - Fetching references with filters:', {
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
      page: this.pageIndex,
      size: this.pageSize,
      isAssignerOrAssignee: this.isAssignerOrAssignee(),
      isAssigner: this.isAssigner(),
      dateFilter: this.selectedDateFilter,
      queueFilter: this.selectedQueueFilter,
      priorityFilter: this.selectedPriorityFilter,
      dateRange: dateRange,
      loginId: this.userDetails?.loginId,
    });
    this.ngxService.start();

    // For Assigner/Assignee, fetch from inbox queue; for Initiator, fetch from sent references
    if (this.isAssignerOrAssignee()) {
      // Fetch inbox references for assigner/assignee with filters
      const queueData: any = {
        loginId: this.userDetails.loginId,
        queue: this.isAssigner() ? this.selectedQueueFilter : 'ALL', // Queue filter only for Assigner
        status: 'INBOX',
        search: this.searchTerm,
        page: this.pageIndex,
        size: this.pageSize,
        sortBy: this.sortColumn,
        sortDir: this.sortDirection,
      };

      // Add date filters if selected
      if (dateRange.startDate) {
        queueData.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        queueData.endDate = dateRange.endDate;
      }

      // Add priority filter if selected
      if (
        this.selectedPriorityFilter &&
        this.selectedPriorityFilter !== 'ALL'
      ) {
        queueData.priority = this.selectedPriorityFilter;
      }

      console.log('Dashboard - Final queueData being sent:', queueData);
      this.userMgmtService
        .getQueueReferencesListPaginated(queueData)
        .subscribe({
          next: (res: any) => {
            console.log('Received assigner response:', res);
            this.VipReferenceData.data = res.content;
            this.totalElements = res.totalElements;
            this.pageIndex = res.pageNumber || 0;
            this.ngxService.stop();
          },
          error: (err) => {
            console.error('Error fetching references:', err);
            this.toastr.error('No references found for this user');
            this.ngxService.stop();
          },
        });
    } else {
      // Initiator - fetch sent references (no filters)
      this.userMgmtService
        .getVipReferenceListPaginated(
          this.userDetails.loginId,
          this.pageIndex,
          this.pageSize,
          this.searchTerm,
          this.sortColumn,
          this.sortDirection,
        )
        .subscribe({
          next: (res: PagedResponse<VipReference>) => {
            console.log('Received initiator response:', res);
            this.VipReferenceData.data = res.content;
            this.totalElements = res.totalElements;
            this.pageIndex = res.pageNumber;
            this.ngxService.stop();
          },
          error: (err) => {
            console.error('Error fetching references:', err);
            this.toastr.error('No references found for this user');
            this.ngxService.stop();
          },
        });
    }
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getVipReferenceList();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.searchTerm = filterValue;
    this.pageIndex = 0; // Reset to first page on search
    this.getVipReferenceList();
  }

  viewReference(ref: VipReference) {
    this.ngxService.start();
    // Fetch detailed reference information from API
    this.userMgmtService.getReferenceDetails(ref.referenceNo).subscribe({
      next: (detailedRef: any) => {
        this.ngxService.stop();
        const viewReferenceDialog = this.dialog.open(ViewReferenceComponent, {
          data: detailedRef,
          width: '900px',
          maxHeight: '90vh',
        });
      },
      error: (err) => {
        this.ngxService.stop();
        // Fallback to basic data if API fails
        this.toastr.warning(
          'Could not fetch complete details, showing basic information',
        );
        const viewReferenceDialog = this.dialog.open(ViewReferenceComponent, {
          data: ref,
          width: '900px',
          maxHeight: '90vh',
        });
      },
    });
  }

  getPriorityClass(priority: string): string {
    return priority === 'High' ? 'high-priority' : 'normal-priority';
  }
}
