import { AfterViewInit, Component, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
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
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ToastrService } from 'ngx-toastr';
import { PagedResponse } from '../../interface/paged-response.model';
Chart.register(...registerables);

export interface VipReference {
  referenceNo: string;
  subject: string;
  receivedDate: Date;
  priority: 'High' | 'Normal' | 'Low';
  currentQueue: string;
  status: string;
  initiatorOfficeType?: string; // MINISTRY or SECRETARY
}


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit {
  userDetails!:User;
  selectedMenu:string="User Dashboard";
  isMenuOpen = false;
  @ViewChild('myChart') myChart: ElementRef | undefined;  // Access canvas via ViewChild
  chart: any;
  private router=inject(Router);
  private dialog=inject(MatDialog);
  private userMgmtService = inject(UsermgmtService);
  private ngxService= inject(NgxUiLoaderService);
  private toastr= inject(ToastrService);


  public config: any;
  displayedColumns: string[] = [
    'referenceNo',
    'subject',
    'assignedAt',
    'priority',
    'currentQueue',
    // 'status',
    'actions'
  ];
  VipReferenceData = new MatTableDataSource<VipReference>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Server-side pagination properties
  totalElements: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  searchTerm: string = '';
  ngOnInit() {
    this.getUserDetails();
    this.getDashboardStats();
    this.getVipReferenceList();
  }
  ngAfterViewInit() {
    this.renderChart();
  }
  renderChart() {
    this.ngxService.start();
    setTimeout(() => {
      const canvas = this.myChart?.nativeElement;
      if (canvas) {
        this.chart = new Chart(canvas, this.config);
        this.ngxService.stop();
      }
    }, 1000);
  }

  getUserDetails(){
    const userData=sessionStorage.getItem("user");
    if(userData){
      this.userDetails=JSON.parse(userData);
    }
  }

  getDashboardStats(){
    this.ngxService.start();
    this.userMgmtService.getInitiatorDashboardStats(this.userDetails.loginId).subscribe({
      next:(res:any)=>{
        const response=res;
        this.config = {
          type: 'doughnut',
          data: {
            labels: response.chartData.labels,
            datasets: [
              {
                label: 'Messages',
                data: response.chartData.data,
                backgroundColor: ['rgba(0,123,255,0.5)', 'rgba(255,99,132,0.5)'],
                borderColor: ['rgba(0,123,255,1)', 'rgba(255,99,132,1)'],
                borderWidth: 1,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        };
        this.ngxService.stop();
      },
      error:(err:any)=>{
        this.toastr.error("No Dashboard Data found for this user");
        this.ngxService.stop();
      }
    })
  }

  getVipReferenceList(){
    this.ngxService.start()
    this.userMgmtService.getVipReferenceListPaginated(this.userDetails.loginId, this.pageIndex, this.pageSize, this.searchTerm).subscribe({
      next:(res: PagedResponse<VipReference>)=>{
        console.log(res);
        this.VipReferenceData.data = res.content;
        this.totalElements = res.totalElements;
        this.pageIndex = res.pageNumber;
        this.initiatePaginator();
      },
      error:(err)=>{
        this.toastr.error("No references found for this user");
        this.ngxService.stop();
      }
    })
  }

  initiatePaginator(){
    setTimeout(()=>{
      this.VipReferenceData.sort = this.sort;
      this.ngxService.stop();
    },500);
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
    const viewReferenceDialog=this.dialog.open(ViewReferenceComponent,{
      data:ref
    });
  }

  getPriorityClass(priority: string): string {
    return priority === 'High' ? 'high-priority' : 'normal-priority';
  }
}
