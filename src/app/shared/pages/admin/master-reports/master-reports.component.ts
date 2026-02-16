import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../../service/report.service';
import { AdminService } from '../../../service/admin.service';
import { UsermgmtService } from '../../../service/usermgmt.service';
import { ToasterService } from '../../../utilities/toaster.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-master-reports',
  standalone: false,
  templateUrl: './master-reports.component.html',
  styleUrl: './master-reports.component.css'
})
export class MasterReportsComponent implements OnInit {
  selectedTabIndex = 0;
  loading = false;

  // VIP Customize Report
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

  // VIP Pendency Report
  vipPendencyFilters = {
    pendencyType: ''
  };
  vipPendencyData: any[] = [];
  vipPendencyResponse: any = null;
  vipPendencySortColumn: string = 'pendingDays';
  vipPendencySortDirection: 'asc' | 'desc' = 'desc';

  // MIS Report
  misData: any[] = [];
  misResponse: any = null;
  misSortColumn: string = 'state';
  misSortDirection: 'asc' | 'desc' = 'asc';

  // NHAI MIS Report
  nhaiMisData: any[] = [];
  nhaiMisResponse: any = null;
  nhaiMisSortColumn: string = 'state';
  nhaiMisSortDirection: 'asc' | 'desc' = 'asc';

  // State-Org Report
  stateOrgFilters = {
    organisation: '',
    fromDate: '',
    toDate: ''
  };
  stateOrgData: any[] = [];
  stateOrgResponse: any = null;
  stateOrgSortColumn: string = 'state';
  stateOrgSortDirection: 'asc' | 'desc' = 'asc';

  // Officer-Wise Report
  officerWiseFilters = {
    organisation: ''
  };
  officerWiseData: any[] = [];
  officerWiseResponse: any = null;
  officerWiseSortColumn: string = 'office';
  officerWiseSortDirection: 'asc' | 'desc' = 'asc';

  // User Login Report
  userLoginData: any[] = [];
  userLoginResponse: any = null;
  userLoginSortColumn: string = 'organisation';
  userLoginSortDirection: 'asc' | 'desc' = 'asc';

  // Master Data for dropdowns
  categoryList: any[] = [];
  subCategoryList: any[] = [];
  stateList: any[] = [];
  vipDesignationList: any[] = [];
  priorities: string[] = ['Priority', 'Normal'];
  organisations: string[] = ['All', 'MoRTH', 'NHAI', 'NHIDCL'];

  // Reference Detail Modal
  showReferenceDetailModal = false;
  referenceDetailLoading = false;
  referenceDetail: any = null;

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
    // Load categories
    this.adminService.getAllCategories().subscribe({
      next: (res: any) => {
        this.categoryList = res || [];
      },
      error: (err: any) => console.error('Error loading categories', err)
    });

    // Don't load subcategories on init - they will load when category is selected

    // Load states
    this.usermgmtService.getStateList().subscribe({
      next: (res: any) => {
        this.stateList = res || [];
      },
      error: (err: any) => console.error('Error loading states', err)
    });

    // Load designations
    this.usermgmtService.getVipDesignationList().subscribe({
      next: (res: any) => {
        this.vipDesignationList = res || [];
      },
      error: (err: any) => console.error('Error loading designations', err)
    });
  }

  // Handle category change event
  onCategoryChange(event: any): void {
    const selectedCategoryId = event.target.value;

    // Clear subcategory selection and list
    this.vipCustomizeFilters.subCategory = '';
    this.subCategoryList = [];

    // Load subcategories for selected category
    if (selectedCategoryId !== null && selectedCategoryId !== undefined && selectedCategoryId !== '') {
      this.loadSubCategoriesByCategory(Number(selectedCategoryId));
    }
  }

  // Load subcategories by category ID
  loadSubCategoriesByCategory(categoryId: number): void {
    this.adminService.getSubCategoriesByCategoryId(categoryId).subscribe({
      next: (res: any) => {
        this.subCategoryList = res || [];
      },
      error: (err: any) => {
        console.error('Error loading subcategories', err);
        this.toaster.error('Failed to load subcategories');
      }
    });
  }

  // VIP Customize Report Methods
  loadVipCustomizeReport(): void {
    // Validate date range is selected
    if (!this.vipCustomizeFilters.receivingFromDate || !this.vipCustomizeFilters.receivingToDate) {
      this.toaster.error('Please select both From Date and To Date to generate the report');
      return;
    }

    // Validate date range does not exceed 1 year
    const fromDate = new Date(this.vipCustomizeFilters.receivingFromDate);
    const toDate = new Date(this.vipCustomizeFilters.receivingToDate);

    // Check if from date is before to date
    if (fromDate > toDate) {
      this.toaster.error('From Date cannot be greater than To Date');
      return;
    }

    // Calculate difference in days
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 365 days = 1 year (366 for leap year consideration)
    if (diffDays > 365) {
      this.toaster.error('Date range cannot exceed 1 year. Please select a date range within 1 year to avoid data load issues.');
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
      error: (err) => {
        console.error('Error loading VIP Customize Report', err);
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
        // Numeric sorting for pending days
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
  }

  exportVipCustomizeToPDF(): void {
    if (!this.vipCustomizeData || this.vipCustomizeData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');

    // Title
    doc.setFontSize(16);
    doc.text('VIP Common Report', 14, 15);

    // Metadata
    doc.setFontSize(10);
    doc.text(`Status As On: ${this.vipCustomizeResponse?.generatedAt || ''}`, 14, 22);
    doc.text(`Report Generated By: ${this.vipCustomizeResponse?.generatedBy || ''}`, 14, 27);
    doc.text(`Total Records: ${this.vipCustomizeResponse?.totalRecords || 0}`, 14, 32);

    // Table
    const headers = [['S.No.', 'Request Number', 'Letter Date', 'Receiving Date', 'Dignitary Name', 'Designation', 'State', 'Category', 'Sub Category', 'Priority', 'Status']];
    const data = this.vipCustomizeData.map((item, index) => [
      (index + 1).toString(),
      item.requestNumber || '-',
      this.formatDate(item.letterDate) || '-',
      this.formatDate(item.receivingDate) || '-',
      item.dignitaryName || '-',
      item.designation || '-',
      item.state || '-',
      item.category || '-',
      item.subCategory || '-',
      item.priority || '-',
      item.status || '-'
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 37,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [76, 175, 80] }
    });

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
      item.state || '-',
      item.category || '-',
      item.subCategory || '-',
      item.subject || '-',
      item.priority || '-',
      item.pendingWith || '-',
      item.status || '-'
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

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

    // For Excel, we'll use CSV format with .xlsx extension
    // For proper Excel support, you would need a library like xlsx or exceljs
    const headers = ['S.No.', 'Request Number', 'Letter Date', 'Receiving Date', 'Dignitary Name', 'Designation', 'State', 'Category', 'Sub Category', 'Subject', 'Priority', 'Pending With', 'Status'];
    const csvData = this.vipCustomizeData.map((item, index) => [
      (index + 1).toString(),
      item.requestNumber || '-',
      this.formatDate(item.letterDate) || '-',
      this.formatDate(item.receivingDate) || '-',
      item.dignitaryName || '-',
      item.designation || '-',
      item.state || '-',
      item.category || '-',
      item.subCategory || '-',
      item.subject || '-',
      item.priority || '-',
      item.pendingWith || '-',
      item.status || '-'
    ]);

    let csv = headers.join('\t') + '\n';
    csvData.forEach(row => {
      csv += row.join('\t') + '\n';
    });

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_Common_Report.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to Excel');
  }

  // VIP Pendency Report Methods
  loadVipPendencyReport(): void {
    // Validate pendency type is selected
    if (!this.vipPendencyFilters.pendencyType) {
      this.toaster.error('Please select Pendency Type from dropdown to generate the report');
      return;
    }

    this.loading = true;
    this.reportService.getVipPendencyReport(this.vipPendencyFilters).subscribe({
      next: (response) => {
        this.vipPendencyResponse = response;
        this.vipPendencyData = response.pendencyData || [];
        this.sortVipPendencyData(this.vipPendencySortColumn, this.vipPendencySortDirection);
        this.loading = false;
        if (this.vipPendencyData.length === 0) {
          this.toaster.info('No records found');
        }
      },
      error: (err) => {
        console.error('Error loading VIP Pendency Report', err);
        this.toaster.error('Failed to load report');
        this.loading = false;
      }
    });
  }

  sortVipPendencyTable(column: string): void {
    if (this.vipPendencySortColumn === column) {
      this.vipPendencySortDirection = this.vipPendencySortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.vipPendencySortColumn = column;
      this.vipPendencySortDirection = 'asc';
    }
    this.sortVipPendencyData(column, this.vipPendencySortDirection);
  }

  sortVipPendencyData(column: string, direction: 'asc' | 'desc'): void {
    this.vipPendencyData.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle numeric columns
      if (column === 'pendingDays' || column === 'sNo') {
        aVal = aVal !== null && aVal !== undefined ? parseInt(aVal) : 0;
        bVal = bVal !== null && bVal !== undefined ? parseInt(bVal) : 0;
      } else if (column === 'assignedAt') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else {
        aVal = aVal ? aVal.toString().toLowerCase() : '';
        bVal = bVal ? bVal.toString().toLowerCase() : '';
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  resetVipPendencyFilters(): void {
    this.vipPendencyFilters = { pendencyType: '' };
    this.vipPendencyData = [];
    this.vipPendencyResponse = null;
  }

  exportVipPendencyToPDF(): void {
    if (!this.vipPendencyData || this.vipPendencyData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('VIP Pendency Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Status As On: ${this.formatDateTime(this.vipPendencyResponse?.statusAsOn) || ''}`, 14, 22);
    doc.text(`Pendency Type: ${this.vipPendencyResponse?.criteriaPendencyType || ''}`, 14, 27);
    doc.text(`Total Records: ${this.vipPendencyResponse?.totalRecords || 0}`, 14, 32);

    const headers = [['S.No.', 'Reference No', 'Dignitary Name', 'Subject', 'State', 'Assignee Name', 'Login ID', 'Designation', 'Organisation', 'Office', 'Pending Days', 'Status']];
    const data = this.vipPendencyData.map((item) => [
      item.sNo?.toString() || '-',
      item.referenceNo || '-',
      item.dignitaryName || '-',
      item.subject || '-',
      item.state || '-',
      item.assigneeName || '-',
      item.assigneeLoginId || '-',
      item.designation || '-',
      item.organisation || '-',
      item.office || '-',
      item.pendingDays?.toString() || '0',
      item.status || '-'
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 37,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [76, 175, 80] }
    });

    doc.save('VIP_Pendency_Report.pdf');
    this.toaster.success('Report exported to PDF');
  }

  exportVipPendencyToCSV(): void {
    if (!this.vipPendencyData || this.vipPendencyData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const headers = ['S.No.', 'Reference No', 'Dignitary Name', 'Subject', 'State', 'Assignee Name', 'Login ID', 'Designation', 'Organisation', 'Office', 'Pending Days', 'Status'];
    const csvData = this.vipPendencyData.map((item) => [
      item.sNo?.toString() || '-',
      item.referenceNo || '-',
      item.dignitaryName || '-',
      item.subject || '-',
      item.state || '-',
      item.assigneeName || '-',
      item.assigneeLoginId || '-',
      item.designation || '-',
      item.organisation || '-',
      item.office || '-',
      item.pendingDays?.toString() || '0',
      item.status || '-'
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_Pendency_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to CSV');
  }

  exportVipPendencyToExcel(): void {
    if (!this.vipPendencyData || this.vipPendencyData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const headers = ['S.No.', 'Reference No', 'Dignitary Name', 'Subject', 'State', 'Assignee Name', 'Login ID', 'Designation', 'Organisation', 'Office', 'Pending Days', 'Status'];
    const csvData = this.vipPendencyData.map((item) => [
      item.sNo?.toString() || '-',
      item.referenceNo || '-',
      item.dignitaryName || '-',
      item.subject || '-',
      item.state || '-',
      item.assigneeName || '-',
      item.assigneeLoginId || '-',
      item.designation || '-',
      item.organisation || '-',
      item.office || '-',
      item.pendingDays?.toString() || '0',
      item.status || '-'
    ]);

    let csv = headers.join('\t') + '\n';
    csvData.forEach(row => {
      csv += row.join('\t') + '\n';
    });

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_Pendency_Report.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to Excel');
  }

  // MIS Report Methods
  loadMISReport(): void {
    this.loading = true;
    this.reportService.getMISReport().subscribe({
      next: (response) => {
        this.misResponse = response;
        this.misData = response.stateWiseData || [];
        this.sortMISData(this.misSortColumn, this.misSortDirection);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading MIS Report', err);
        this.toaster.error('Failed to load report');
        this.loading = false;
      }
    });
  }

  sortMISTable(column: string): void {
    if (this.misSortColumn === column) {
      this.misSortDirection = this.misSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.misSortColumn = column;
      this.misSortDirection = 'asc';
    }
    this.sortMISData(column, this.misSortDirection);
  }

  sortMISData(column: string, direction: 'asc' | 'desc'): void {
    this.misData.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle numeric columns
      if (column === 'total' || column === 'sNo') {
        aVal = aVal ? parseInt(aVal) : 0;
        bVal = bVal ? parseInt(bVal) : 0;
      } else {
        aVal = aVal ? aVal.toString().toLowerCase() : '';
        bVal = bVal ? bVal.toString().toLowerCase() : '';
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  exportMISToPDF(): void {
    if (!this.misData || this.misData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('VIP MIS MoRTH Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Grand Total: ${this.misResponse?.grandTotal || 0}`, 14, 22);

    const designations = Object.keys(this.misData[0].designationWiseCount || {});
    const headers = [['S.No.', 'State', 'Total', ...designations]];
    const data = this.misData.map((item) => [
      item.sNo?.toString() || '-',
      item.state || '-',
      item.total?.toString() || '0',
      ...designations.map(d => item.designationWiseCount[d]?.toString() || '0')
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 27,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [76, 175, 80] }
    });

    doc.save('VIP_MIS_MoRTH_Report.pdf');
    this.toaster.success('Report exported to PDF');
  }

  exportMISToCSV(): void {
    if (!this.misData || this.misData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const designations = Object.keys(this.misData[0].designationWiseCount || {});
    const headers = ['S.No.', 'State', 'Total', ...designations];
    const csvData = this.misData.map((item) => [
      item.sNo?.toString() || '-',
      item.state || '-',
      item.total?.toString() || '0',
      ...designations.map(d => item.designationWiseCount[d]?.toString() || '0')
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_MIS_MoRTH_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to CSV');
  }

  exportMISToExcel(): void {
    if (!this.misData || this.misData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const designations = Object.keys(this.misData[0].designationWiseCount || {});
    const headers = ['S.No.', 'State', 'Total', ...designations];
    const csvData = this.misData.map((item) => [
      item.sNo?.toString() || '-',
      item.state || '-',
      item.total?.toString() || '0',
      ...designations.map(d => item.designationWiseCount[d]?.toString() || '0')
    ]);

    let csv = headers.join('\t') + '\n';
    csvData.forEach(row => {
      csv += row.join('\t') + '\n';
    });

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_MIS_MoRTH_Report.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to Excel');
  }

  // NHAI MIS Report Methods
  loadNHAIMISReport(): void {
    this.loading = true;
    this.reportService.getNHAIMISReport().subscribe({
      next: (response) => {
        this.nhaiMisResponse = response;
        this.nhaiMisData = response.stateWiseData || [];
        this.sortNHAIMISData(this.nhaiMisSortColumn, this.nhaiMisSortDirection);
        this.loading = false;
        if (this.nhaiMisData.length === 0) {
          this.toaster.info('No NHAI records found');
        }
      },
      error: (err) => {
        console.error('Error loading NHAI MIS Report', err);
        this.toaster.error('Failed to load report');
        this.loading = false;
      }
    });
  }

  sortNHAIMISTable(column: string): void {
    if (this.nhaiMisSortColumn === column) {
      this.nhaiMisSortDirection = this.nhaiMisSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.nhaiMisSortColumn = column;
      this.nhaiMisSortDirection = 'asc';
    }
    this.sortNHAIMISData(column, this.nhaiMisSortDirection);
  }

  sortNHAIMISData(column: string, direction: 'asc' | 'desc'): void {
    this.nhaiMisData.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle numeric columns
      if (column === 'total' || column === 'sNo') {
        aVal = aVal ? parseInt(aVal) : 0;
        bVal = bVal ? parseInt(bVal) : 0;
      } else {
        aVal = aVal ? aVal.toString().toLowerCase() : '';
        bVal = bVal ? bVal.toString().toLowerCase() : '';
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  exportNHAIMISToPDF(): void {
    if (!this.nhaiMisData || this.nhaiMisData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('VIP MIS NHAI Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Grand Total: ${this.nhaiMisResponse?.grandTotal || 0}`, 14, 22);

    const designations = Object.keys(this.nhaiMisData[0].designationWiseCount || {});
    const headers = [['S.No.', 'State', 'Total', ...designations]];
    const data = this.nhaiMisData.map((item) => [
      item.sNo?.toString() || '-',
      item.state || '-',
      item.total?.toString() || '0',
      ...designations.map(d => item.designationWiseCount[d]?.toString() || '0')
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 27,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [76, 175, 80] }
    });

    doc.save('VIP_MIS_NHAI_Report.pdf');
    this.toaster.success('Report exported to PDF');
  }

  exportNHAIMISToCSV(): void {
    if (!this.nhaiMisData || this.nhaiMisData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const designations = Object.keys(this.nhaiMisData[0].designationWiseCount || {});
    const headers = ['S.No.', 'State', 'Total', ...designations];
    const csvData = this.nhaiMisData.map((item) => [
      item.sNo?.toString() || '-',
      item.state || '-',
      item.total?.toString() || '0',
      ...designations.map(d => item.designationWiseCount[d]?.toString() || '0')
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_MIS_NHAI_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to CSV');
  }

  exportNHAIMISToExcel(): void {
    if (!this.nhaiMisData || this.nhaiMisData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const designations = Object.keys(this.nhaiMisData[0].designationWiseCount || {});
    const headers = ['S.No.', 'State', 'Total', ...designations];
    const csvData = this.nhaiMisData.map((item) => [
      item.sNo?.toString() || '-',
      item.state || '-',
      item.total?.toString() || '0',
      ...designations.map(d => item.designationWiseCount[d]?.toString() || '0')
    ]);

    let csv = headers.join('\t') + '\n';
    csvData.forEach(row => {
      csv += row.join('\t') + '\n';
    });

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_MIS_NHAI_Report.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to Excel');
  }

  // State-Org Report Methods
  loadStateOrgReport(): void {
    // Validate organisation is selected
    if (!this.stateOrgFilters.organisation) {
      this.toaster.error('Please select Organisation from dropdown to generate the report');
      return;
    }

    // Validate date range is selected
    if (!this.stateOrgFilters.fromDate || !this.stateOrgFilters.toDate) {
      this.toaster.error('Please select both From Date and To Date to generate the report');
      return;
    }

    // Validate date range does not exceed 1 year
    const fromDate = new Date(this.stateOrgFilters.fromDate);
    const toDate = new Date(this.stateOrgFilters.toDate);

    // Check if from date is before to date
    if (fromDate > toDate) {
      this.toaster.error('From Date cannot be greater than To Date');
      return;
    }

    // Calculate difference in days
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 365 days = 1 year
    if (diffDays > 365) {
      this.toaster.error('Date range cannot exceed 1 year. Please select a date range within 1 year to avoid data load issues.');
      return;
    }

    this.loading = true;
    this.reportService.getStateOrgReport(this.stateOrgFilters).subscribe({
      next: (response) => {
        this.stateOrgResponse = response;
        this.stateOrgData = response.stateWiseData || [];
        this.sortStateOrgData(this.stateOrgSortColumn, this.stateOrgSortDirection);
        this.loading = false;
        if (this.stateOrgData.length === 0) {
          this.toaster.info('No records found');
        }
      },
      error: (err) => {
        console.error('Error loading State-Org Report', err);
        this.toaster.error('Failed to load report');
        this.loading = false;
      }
    });
  }

  sortStateOrgTable(column: string): void {
    if (this.stateOrgSortColumn === column) {
      this.stateOrgSortDirection = this.stateOrgSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.stateOrgSortColumn = column;
      this.stateOrgSortDirection = 'asc';
    }
    this.sortStateOrgData(column, this.stateOrgSortDirection);
  }

  sortStateOrgData(column: string, direction: 'asc' | 'desc'): void {
    this.stateOrgData.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle numeric columns
      if (column === 'totalReference' || column === 'toBeAssigned' || column === 'inProgress' ||
          column === 'closed' || column === 'discard' || column === 'sNo') {
        aVal = aVal ? parseInt(aVal) : 0;
        bVal = bVal ? parseInt(bVal) : 0;
      } else {
        aVal = aVal ? aVal.toString().toLowerCase() : '';
        bVal = bVal ? bVal.toString().toLowerCase() : '';
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  resetStateOrgFilters(): void {
    this.stateOrgFilters = { organisation: '', fromDate: '', toDate: '' };
    this.stateOrgData = [];
    this.stateOrgResponse = null;
  }

  exportStateOrgToPDF(): void {
    if (!this.stateOrgData || this.stateOrgData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('VIP State-Org Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Total References: ${this.stateOrgResponse?.totalReferences || 0}`, 14, 22);

    const headers = [['S.No.', 'State', 'Organisation', 'Total', 'To Be Assigned', 'In Progress', 'Closed', 'Discarded']];
    const data = this.stateOrgData.map((item) => [
      item.sNo?.toString() || '-',
      item.state || '-',
      item.organisation || '-',
      item.totalReference?.toString() || '0',
      item.toBeAssigned?.toString() || '0',
      item.inProgress?.toString() || '0',
      item.closed?.toString() || '0',
      item.discard?.toString() || '0'
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 27,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [76, 175, 80] }
    });

    doc.save('VIP_State_Org_Report.pdf');
    this.toaster.success('Report exported to PDF');
  }

  exportStateOrgToCSV(): void {
    if (!this.stateOrgData || this.stateOrgData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const headers = ['S.No.', 'State', 'Organisation', 'Total Reference', 'To Be Assigned', 'In Progress', 'Closed', 'Discarded'];
    const csvData = this.stateOrgData.map((item) => [
      item.sNo?.toString() || '-',
      item.state || '-',
      item.organisation || '-',
      item.totalReference?.toString() || '0',
      item.toBeAssigned?.toString() || '0',
      item.inProgress?.toString() || '0',
      item.closed?.toString() || '0',
      item.discard?.toString() || '0'
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_State_Org_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to CSV');
  }

  exportStateOrgToExcel(): void {
    if (!this.stateOrgData || this.stateOrgData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const headers = ['S.No.', 'State', 'Organisation', 'Total Reference', 'To Be Assigned', 'In Progress', 'Closed', 'Discarded'];
    const csvData = this.stateOrgData.map((item) => [
      item.sNo?.toString() || '-',
      item.state || '-',
      item.organisation || '-',
      item.totalReference?.toString() || '0',
      item.toBeAssigned?.toString() || '0',
      item.inProgress?.toString() || '0',
      item.closed?.toString() || '0',
      item.discard?.toString() || '0'
    ]);

    let csv = headers.join('\t') + '\n';
    csvData.forEach(row => {
      csv += row.join('\t') + '\n';
    });

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_State_Org_Report.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to Excel');
  }

  // Officer-Wise Report Methods
  loadOfficerWiseReport(): void {
    // Validate organisation is selected
    if (!this.officerWiseFilters.organisation) {
      this.toaster.error('Please select Organisation from dropdown to generate the report');
      return;
    }

    this.loading = true;
    this.reportService.getOfficerWiseReport(this.officerWiseFilters).subscribe({
      next: (response) => {
        this.officerWiseResponse = response;
        this.officerWiseData = response.officerWiseData || [];
        this.sortOfficerWiseData(this.officerWiseSortColumn, this.officerWiseSortDirection);
        this.loading = false;
        if (this.officerWiseData.length === 0) {
          this.toaster.info('No records found');
        }
      },
      error: (err) => {
        console.error('Error loading Officer-Wise Report', err);
        this.toaster.error('Failed to load report');
        this.loading = false;
      }
    });
  }

  sortOfficerWiseTable(column: string): void {
    if (this.officerWiseSortColumn === column) {
      this.officerWiseSortDirection = this.officerWiseSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.officerWiseSortColumn = column;
      this.officerWiseSortDirection = 'asc';
    }
    this.sortOfficerWiseData(column, this.officerWiseSortDirection);
  }

  sortOfficerWiseData(column: string, direction: 'asc' | 'desc'): void {
    this.officerWiseData.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle numeric columns
      if (column === 'total' || column === 'sNo') {
        aVal = aVal ? parseInt(aVal) : 0;
        bVal = bVal ? parseInt(bVal) : 0;
      } else {
        aVal = aVal ? aVal.toString().toLowerCase() : '';
        bVal = bVal ? bVal.toString().toLowerCase() : '';
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  resetOfficerWiseFilters(): void {
    this.officerWiseFilters = { organisation: '' };
    this.officerWiseData = [];
    this.officerWiseResponse = null;
  }

  exportOfficerWiseToPDF(): void {
    if (!this.officerWiseData || this.officerWiseData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('VIP Officer-Wise Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Grand Total: ${this.officerWiseResponse?.grandTotal || 0}`, 14, 22);

    const headers = [['S.No.', 'Office', 'Designation', 'Employee Name', 'Total']];
    const data = this.officerWiseData.map((item) => [
      item.sNo?.toString() || '-',
      item.office || '-',
      item.designation || '-',
      item.employeeName || '-',
      item.total?.toString() || '0'
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 27,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [76, 175, 80] }
    });

    doc.save('VIP_Officer_Wise_Report.pdf');
    this.toaster.success('Report exported to PDF');
  }

  exportOfficerWiseToCSV(): void {
    if (!this.officerWiseData || this.officerWiseData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const headers = ['S.No.', 'Office', 'Designation', 'Employee Name', 'Total'];
    const csvData = this.officerWiseData.map((item) => [
      item.sNo?.toString() || '-',
      item.office || '-',
      item.designation || '-',
      item.employeeName || '-',
      item.total?.toString() || '0'
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_Officer_Wise_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to CSV');
  }

  exportOfficerWiseToExcel(): void {
    if (!this.officerWiseData || this.officerWiseData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const headers = ['S.No.', 'Office', 'Designation', 'Employee Name', 'Total'];
    const csvData = this.officerWiseData.map((item) => [
      item.sNo?.toString() || '-',
      item.office || '-',
      item.designation || '-',
      item.employeeName || '-',
      item.total?.toString() || '0'
    ]);

    let csv = headers.join('\t') + '\n';
    csvData.forEach(row => {
      csv += row.join('\t') + '\n';
    });

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_Officer_Wise_Report.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to Excel');
  }

  // User Login Report Methods
  loadUserLoginReport(): void {
    this.loading = true;
    this.reportService.getUserLoginReport().subscribe({
      next: (response) => {
        this.userLoginResponse = response;
        this.userLoginData = response.userLoginData || [];
        this.sortUserLoginData(this.userLoginSortColumn, this.userLoginSortDirection);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading User Login Report', err);
        this.toaster.error('Failed to load report');
        this.loading = false;
      }
    });
  }

  sortUserLoginTable(column: string): void {
    if (this.userLoginSortColumn === column) {
      this.userLoginSortDirection = this.userLoginSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.userLoginSortColumn = column;
      this.userLoginSortDirection = 'asc';
    }
    this.sortUserLoginData(column, this.userLoginSortDirection);
  }

  sortUserLoginData(column: string, direction: 'asc' | 'desc'): void {
    this.userLoginData.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle numeric columns
      if (column === 'failureAttemptCount' || column === 'sNo') {
        aVal = aVal ? parseInt(aVal) : 0;
        bVal = bVal ? parseInt(bVal) : 0;
      } else if (column === 'lastLoginTime') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else {
        aVal = aVal ? aVal.toString().toLowerCase() : '';
        bVal = bVal ? bVal.toString().toLowerCase() : '';
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  exportUserLoginToPDF(): void {
    if (!this.userLoginData || this.userLoginData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('VIP User Login Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Total Users: ${this.userLoginResponse?.totalUsers || 0}`, 14, 22);

    const headers = [['S.No.', 'Organisation', 'Office', 'Designation', 'Name', 'Login ID', 'Contact', 'Email', 'Has Login', 'Last Login', 'Locked', 'Failed Attempts']];
    const data = this.userLoginData.map((item) => [
      item.sNo?.toString() || '-',
      item.organisation || '-',
      item.office || '-',
      item.designation || '-',
      item.name || '-',
      item.loginId || '-',
      item.contactNumber || '-',
      item.emailId || '-',
      item.hasLoginBefore || 'N',
      this.formatDate(item.lastLoginTime) || '-',
      item.userLocked || 'N',
      item.failureAttemptCount?.toString() || '0'
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 27,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [76, 175, 80] }
    });

    doc.save('VIP_User_Login_Report.pdf');
    this.toaster.success('Report exported to PDF');
  }

  exportUserLoginToCSV(): void {
    if (!this.userLoginData || this.userLoginData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const headers = ['S.No.', 'Organisation', 'Office', 'Designation', 'Name', 'Login ID', 'Contact Number', 'Email ID', 'Has Login Before', 'Last Login Time', 'User Locked', 'Failure Attempt Count'];
    const csvData = this.userLoginData.map((item) => [
      item.sNo?.toString() || '-',
      item.organisation || '-',
      item.office || '-',
      item.designation || '-',
      item.name || '-',
      item.loginId || '-',
      item.contactNumber || '-',
      item.emailId || '-',
      item.hasLoginBefore || 'N',
      this.formatDate(item.lastLoginTime) || '-',
      item.userLocked || 'N',
      item.failureAttemptCount?.toString() || '0'
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_User_Login_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to CSV');
  }

  exportUserLoginToExcel(): void {
    if (!this.userLoginData || this.userLoginData.length === 0) {
      this.toaster.warning('No data to export');
      return;
    }

    const headers = ['S.No.', 'Organisation', 'Office', 'Designation', 'Name', 'Login ID', 'Contact Number', 'Email ID', 'Has Login Before', 'Last Login Time', 'User Locked', 'Failure Attempt Count'];
    const csvData = this.userLoginData.map((item) => [
      item.sNo?.toString() || '-',
      item.organisation || '-',
      item.office || '-',
      item.designation || '-',
      item.name || '-',
      item.loginId || '-',
      item.contactNumber || '-',
      item.emailId || '-',
      item.hasLoginBefore || 'N',
      this.formatDate(item.lastLoginTime) || '-',
      item.userLocked || 'N',
      item.failureAttemptCount?.toString() || '0'
    ]);

    let csv = headers.join('\t') + '\n';
    csvData.forEach(row => {
      csv += row.join('\t') + '\n';
    });

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIP_User_Login_Report.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toaster.success('Report exported to Excel');
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  // Reference Detail Modal Methods
  openReferenceDetail(referenceNo: string): void {
    if (!referenceNo || referenceNo === '-') {
      this.toaster.warning('Invalid reference number');
      return;
    }

    this.showReferenceDetailModal = true;
    this.referenceDetailLoading = true;
    this.referenceDetail = null;

    this.reportService.getReferenceDetail(referenceNo).subscribe({
      next: (response) => {
        this.referenceDetail = response;
        this.referenceDetailLoading = false;
      },
      error: (err) => {
        console.error('Error loading reference detail', err);
        this.toaster.error('Failed to load reference details');
        this.referenceDetailLoading = false;
        this.showReferenceDetailModal = false;
      }
    });
  }

  closeReferenceDetailModal(): void {
    this.showReferenceDetailModal = false;
    this.referenceDetail = null;
  }

  formatDateTime(date: any): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
}
