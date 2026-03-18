import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../service/report.service';
import { AdminService } from '../../service/admin.service';
import { UsermgmtService } from '../../service/usermgmt.service';
import { ToasterService } from '../../utilities/toaster.service';
import { getStateFullName } from '../../utilities/state-codes';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-user-reports',
  standalone: false,
  templateUrl: './user-reports.component.html',
  styleUrl: './user-reports.component.css'
})
export class UserReportsComponent implements OnInit {
  loading = false;

  vipCustomizeFilters = {
    category: '',
    state: '',
    designation: '',
    priority: '',
    requestNumber: '',
    subCategory: '',
    dignitaryName: '',
    receivingFromDate: '',
    receivingToDate: '',
    subject: ''
  };
  vipCustomizeData: any[] = [];
  vipCustomizeResponse: any = null;
  vipCustomizeSortColumn: string = 'receivingDate';
  vipCustomizeSortDirection: 'asc' | 'desc' = 'desc';

  categoryList: any[] = [];
  subCategoryList: any[] = [];
  stateList: any[] = [];
  vipDesignationList: any[] = [];
  priorities: string[] = ['Priority', 'Normal'];

  constructor(
    private reportService: ReportService,
    private adminService: AdminService,
    private usermgmtService: UsermgmtService,
    private toaster: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadMasterData();
  }

  loadMasterData(): void {
    this.adminService.getAllCategories().subscribe({
      next: (res: any) => { this.categoryList = res || []; },
      error: () => {}
    });
    this.usermgmtService.getStateList().subscribe({
      next: (res: any) => { this.stateList = res || []; },
      error: () => {}
    });
    this.usermgmtService.getVipDesignationList().subscribe({
      next: (res: any) => { this.vipDesignationList = res || []; },
      error: () => {}
    });
  }

  onCategoryChange(event: any): void {
    const selectedCategoryId = event.target.value;
    this.vipCustomizeFilters.subCategory = '';
    this.subCategoryList = [];
    if (selectedCategoryId) {
      this.adminService.getSubCategoriesByCategoryId(Number(selectedCategoryId)).subscribe({
        next: (res: any) => { this.subCategoryList = res || []; },
        error: () => { this.toaster.error('Failed to load subcategories'); }
      });
    }
  }

  loadVipCustomizeReport(): void {
    if (!this.vipCustomizeFilters.receivingFromDate || !this.vipCustomizeFilters.receivingToDate) {
      this.toaster.error('Please select both From Date and To Date to generate the report');
      return;
    }
    const fromDate = new Date(this.vipCustomizeFilters.receivingFromDate);
    const toDate = new Date(this.vipCustomizeFilters.receivingToDate);
    if (fromDate > toDate) {
      this.toaster.error('From Date cannot be greater than To Date');
      return;
    }
    const diffDays = Math.ceil(Math.abs(toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      this.toaster.error('Date range cannot exceed 1 year.');
      return;
    }
    this.loading = true;
    this.reportService.getVipCustomizeReport(this.vipCustomizeFilters).subscribe({
      next: (response) => {
        this.vipCustomizeResponse = response;
        this.vipCustomizeData = response.reportData || [];
        this.sortVipCustomizeData(this.vipCustomizeSortColumn, this.vipCustomizeSortDirection);
        this.loading = false;
        if (this.vipCustomizeData.length === 0) {
          this.toaster.info('No records found');
        }
      },
      error: () => {
        this.toaster.error('Failed to load report');
        this.loading = false;
      }
    });
  }

  sortVipCustomizeTable(column: string): void {
    if (this.vipCustomizeSortColumn === column) {
      this.vipCustomizeSortDirection = this.vipCustomizeSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.vipCustomizeSortColumn = column;
      this.vipCustomizeSortDirection = 'asc';
    }
    this.sortVipCustomizeData(column, this.vipCustomizeSortDirection);
  }

  sortVipCustomizeData(column: string, direction: 'asc' | 'desc'): void {
    this.vipCustomizeData.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];
      if (column === 'receivingDate' || column === 'letterDate') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (column === 'pendingWith') {
        aVal = aVal && aVal !== '-' ? parseInt(aVal, 10) : -1;
        bVal = bVal && bVal !== '-' ? parseInt(bVal, 10) : -1;
      } else {
        aVal = aVal ? aVal.toString().toLowerCase() : '';
        bVal = bVal ? bVal.toString().toLowerCase() : '';
      }
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  resetVipCustomizeFilters(): void {
    this.vipCustomizeFilters = {
      category: '',
      state: '',
      designation: '',
      priority: '',
      requestNumber: '',
      subCategory: '',
      dignitaryName: '',
      receivingFromDate: '',
      receivingToDate: '',
      subject: ''
    };
    this.vipCustomizeData = [];
    this.vipCustomizeResponse = null;
    this.subCategoryList = [];
  }

  exportVipCustomizeToPDF(): void {
    if (!this.vipCustomizeData || this.vipCustomizeData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('VIP Common Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Status As On: ${this.vipCustomizeResponse?.generatedAt || ''}`, 14, 22);
    doc.text(`Report Generated By: ${this.vipCustomizeResponse?.generatedBy || ''}`, 14, 27);
    doc.text(`Total Records: ${this.vipCustomizeResponse?.totalRecords || 0}`, 14, 32);
    const headers = [['S.No.', 'Request Number', 'Letter Date', 'Receiving Date', 'Dignitary Name', 'Designation', 'State', 'Category', 'Sub Category', 'Priority', 'Status']];
    const data = this.vipCustomizeData.map((item, index) => [
      (index + 1).toString(),
      item.requestNumber || '-',
      this.formatDate(item.letterDate) || '-',
      this.formatDate(item.receivingDate) || '-',
      item.dignitaryName || '-',
      item.designation || '-',
      this.getStateFullName(item.state),
      item.category || '-',
      item.subCategory || '-',
      item.priority || '-',
      item.status || '-'
    ]);
    autoTable(doc, { head: headers, body: data, startY: 37, styles: { fontSize: 8 }, headStyles: { fillColor: [76, 175, 80] } });
    doc.save('VIP_Common_Report.pdf');
    this.toaster.success('Report exported to PDF');
  }

  exportVipCustomizeToCSV(): void {
    if (!this.vipCustomizeData || this.vipCustomizeData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }
    const headers = ['S.No.', 'Request Number', 'Letter Date', 'Receiving Date', 'Dignitary Name', 'Designation', 'State', 'Category', 'Sub Category', 'Subject', 'Priority', 'Pending With', 'Status'];
    const csvData = this.vipCustomizeData.map((item, index) => [
      (index + 1).toString(),
      item.requestNumber || '-',
      this.formatDate(item.letterDate) || '-',
      this.formatDate(item.receivingDate) || '-',
      item.dignitaryName || '-',
      item.designation || '-',
      this.getStateFullName(item.state),
      item.category || '-',
      item.subCategory || '-',
      item.subject || '-',
      item.priority || '-',
      item.pendingWith || '-',
      item.status || '-'
    ]);
    let csv = headers.join(',') + '\n';
    csvData.forEach(row => { csv += row.map((cell: string) => `"${cell}"`).join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_Common_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to CSV');
  }

  exportVipCustomizeToExcel(): void {
    if (!this.vipCustomizeData || this.vipCustomizeData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }
    const headers = ['S.No.', 'Request Number', 'Letter Date', 'Receiving Date', 'Dignitary Name', 'Designation', 'State', 'Category', 'Sub Category', 'Subject', 'Priority', 'Pending With', 'Status'];
    const rows = this.vipCustomizeData.map((item, index) => [
      index + 1,
      item.requestNumber || '-',
      this.formatDate(item.letterDate) || '-',
      this.formatDate(item.receivingDate) || '-',
      item.dignitaryName || '-',
      item.designation || '-',
      this.getStateFullName(item.state),
      item.category || '-',
      item.subCategory || '-',
      item.subject || '-',
      item.priority || '-',
      item.pendingWith || '-',
      item.status || '-'
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VIP Common Report');
    XLSX.writeFile(wb, 'VIP_Common_Report.xlsx');
    this.toaster.success('Report exported to Excel');
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  }

  getStateFullName(code: string): string {
    return getStateFullName(code);
  }
}
