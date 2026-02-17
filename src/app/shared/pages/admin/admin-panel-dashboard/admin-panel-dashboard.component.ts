import { Component, OnInit, inject } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AdminService } from '../../../service/admin.service';
import { UsermgmtService } from '../../../service/usermgmt.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-panel-dashboard',
  standalone: false,
  templateUrl: './admin-panel-dashboard.component.html',
  styleUrl: './admin-panel-dashboard.component.css'
})
export class AdminPanelDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private userMgmtService = inject(UsermgmtService);
  private ngxService = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);

  // Summary stats
  totalReferences: number = 0;
  totalUsers: number = 0;
  totalOrganizations: number = 0;
  totalCategories: number = 0;

  // Organization-wise data
  organizations: any[] = [];
  orgWiseReferences: any[] = [];
  orgWiseUsers: any[] = [];

  // Organization-wise References Bar Chart
  public orgReferencesChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Total References',
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  public orgReferencesChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  // Organization-wise Users Pie Chart
  public orgUsersChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  public orgUsersChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right' }
    }
  };

  // Reference Status Doughnut Chart
  public referenceStatusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Active', 'Closed', 'Discarded'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  public referenceStatusChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };

  // Monthly References Line Chart
  public monthlyReferencesChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [],
        label: 'References',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)'
      }
    ]
  };

  public monthlyReferencesChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.ngxService.start();

    forkJoin({
      organizations: this.adminService.getOrganizationMaster(),
      users: this.adminService.getAllUsers(0, 1000),
      categories: this.adminService.getCategoryMaster(),
      dashboardStats: this.adminService.getAdminDashboardStats()
    }).subscribe({
      next: (results: any) => {
        // Process organizations
        this.organizations = results.organizations || [];
        this.totalOrganizations = this.organizations.length;

        // Process users
        const usersData = results.users?.content || results.users || [];
        this.totalUsers = results.users?.totalElements || usersData.length;

        // Process categories
        this.totalCategories = (results.categories || []).length;

        // Process dashboard stats from API
        if (results.dashboardStats) {
          this.processDashboardStats(results.dashboardStats);
        } else {
          // Fallback: Calculate organization-wise users from user list
          this.calculateOrgWiseUsers(usersData);
        }

        this.ngxService.stop();
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.toastr.error('Error loading dashboard data');
        this.ngxService.stop();

        // Fallback: Load data individually
        this.loadDataIndividually();
      }
    });
  }

  loadDataIndividually() {
    // Load organizations
    this.adminService.getOrganizationMaster().subscribe({
      next: (res: any) => {
        this.organizations = res || [];
        this.totalOrganizations = this.organizations.length;
        this.updateOrgReferencesChart();
      },
      error: () => this.toastr.error('Error loading organizations')
    });

    // Load users
    this.adminService.getAllUsers(0, 1000).subscribe({
      next: (res: any) => {
        const usersData = res?.content || res || [];
        this.totalUsers = res?.totalElements || usersData.length;
        this.calculateOrgWiseUsers(usersData);
      },
      error: () => this.toastr.error('Error loading users')
    });

    // Load categories
    this.adminService.getCategoryMaster().subscribe({
      next: (res: any) => {
        this.totalCategories = (res || []).length;
      },
      error: () => this.toastr.error('Error loading categories')
    });
  }

  processDashboardStats(stats: any) {
    // Total references
    this.totalReferences = stats.totalReferences || 0;

    // Organization-wise references
    if (stats.orgWiseReferences) {
      this.orgWiseReferences = stats.orgWiseReferences;
      const labels = this.orgWiseReferences.map((item: any) => item.organizationName || item.name);
      const data = this.orgWiseReferences.map((item: any) => item.count || item.totalReferences || 0);
      this.orgReferencesChartData = {
        ...this.orgReferencesChartData,
        labels: labels,
        datasets: [{
          ...this.orgReferencesChartData.datasets[0],
          data: data
        }]
      };
    }

    // Organization-wise users
    if (stats.orgWiseUsers) {
      this.orgWiseUsers = stats.orgWiseUsers;
      const labels = this.orgWiseUsers.map((item: any) => item.organizationName || item.name);
      const data = this.orgWiseUsers.map((item: any) => item.count || item.totalUsers || 0);
      this.orgUsersChartData = {
        ...this.orgUsersChartData,
        labels: labels,
        datasets: [{
          ...this.orgUsersChartData.datasets[0],
          data: data
        }]
      };
    }

    // Reference status breakdown
    if (stats.referenceStatusBreakdown) {
      const statusData = stats.referenceStatusBreakdown;
      this.referenceStatusChartData = {
        ...this.referenceStatusChartData,
        labels: Object.keys(statusData),
        datasets: [{
          ...this.referenceStatusChartData.datasets[0],
          data: Object.values(statusData) as number[]
        }]
      };
    }

    // Monthly references trend
    if (stats.monthlyReferences) {
      this.monthlyReferencesChartData = {
        ...this.monthlyReferencesChartData,
        datasets: [{
          ...this.monthlyReferencesChartData.datasets[0],
          data: stats.monthlyReferences
        }]
      };
    }
  }

  calculateOrgWiseUsers(users: any[]) {
    const orgUserCount: { [key: string]: number } = {};

    users.forEach((user: any) => {
      const orgName = user.organization || 'Unknown';
      orgUserCount[orgName] = (orgUserCount[orgName] || 0) + 1;
    });

    const labels = Object.keys(orgUserCount);
    const data = Object.values(orgUserCount);

    this.orgUsersChartData = {
      ...this.orgUsersChartData,
      labels: labels,
      datasets: [{
        ...this.orgUsersChartData.datasets[0],
        data: data
      }]
    };
  }

  updateOrgReferencesChart() {
    if (this.organizations.length > 0) {
      const labels = this.organizations.map((org: any) => org.organizationName || org.name);
      this.orgReferencesChartData = {
        ...this.orgReferencesChartData,
        labels: labels
      };
    }
  }

  getOrgReferenceCount(orgName: string): number {
    const org = this.orgWiseReferences.find(
      (item: any) => (item.organizationName || item.name) === orgName
    );
    return org ? (org.count || org.totalReferences || 0) : 0;
  }

  getOrgUserCount(orgName: string): number {
    const org = this.orgWiseUsers.find(
      (item: any) => (item.organizationName || item.name) === orgName
    );
    return org ? (org.count || org.totalUsers || 0) : 0;
  }
}
