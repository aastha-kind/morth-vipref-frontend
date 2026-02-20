import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  VipReferenceDetailsResponse,
  VipReferenceDocumentResponse,
} from '../../interface/reference-details-response.model';
import { UsermgmtService } from '../../service/usermgmt.service';
import { VipDesignationList } from '../../interface/vip-designation-list.model';
import { ToasterService } from '../../utilities/toaster.service';

@Component({
  selector: 'app-view-reference',
  standalone: false,
  templateUrl: './view-reference.component.html',
  styleUrl: './view-reference.component.css',
  providers: [DatePipe],
})
export class ViewReferenceComponent {
  viewReference!: FormGroup;
  referenceDetails: VipReferenceDetailsResponse;
  documents: VipReferenceDocumentResponse[] = [];
  displayedDocColumns: string[] = [
    'documentType',
    'fileName',
    'uploadedBy',
    'uploadedAt',
    'actions',
  ];

  isLoading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe,
    private userMgmtService: UsermgmtService,
    private toaster: ToasterService,
  ) {
    this.referenceDetails = data;
    this.documents = data.documents || [];
  }

  ngOnInit() {
    this.viewReference = new FormGroup({
      // Basic Reference Information
      referenceNo: new FormControl(),
      subject: new FormControl(),
      priority: new FormControl(),
      currentQueue: new FormControl(),
      initiatorOfficeType: new FormControl(),

      // Date Information
      receivedDate: new FormControl(),
      dateOfLetter: new FormControl(),
      dateOfEntry: new FormControl(),

      // VIP/Dignitary Information
      nameOfDignitary: new FormControl(),
      designation: new FormControl(),
      designation_name: new FormControl(),
      emailId: new FormControl(),
      state: new FormControl(),
      constituency: new FormControl(),

      // Category Information
      categoryOfSubject: new FormControl(),
      subCategoryOfSubject: new FormControl(),

      // Assignment Information
      toLoginId: new FormControl(),
    });

    // If full details are missing, fetch them from backend
    if (
      this.data.referenceNo &&
      !this.data.receivedDate &&
      !this.data.nameOfDignitary
    ) {
      this.loadFullReferenceDetails(this.data.referenceNo);
    } else {
      this.setFormData();
    }
  }

  private stateCodeMap: { [key: string]: string } = {
  'AP': 'Andhra Pradesh',
  'AR': 'Arunachal Pradesh',
  'AS': 'Assam',
  'BR': 'Bihar',
  'CG': 'Chhattisgarh',
  'GA': 'Goa',
  'GJ': 'Gujarat',
  'HR': 'Haryana',
  'HP': 'Himachal Pradesh',
  'JH': 'Jharkhand',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'MP': 'Madhya Pradesh',
  'MH': 'Maharashtra',
  'MN': 'Manipur',
  'ML': 'Meghalaya',
  'MZ': 'Mizoram',
  'NL': 'Nagaland',
  'OD': 'Odisha',
  'PB': 'Punjab',
  'RJ': 'Rajasthan',
  'SK': 'Sikkim',
  'TN': 'Tamil Nadu',
  'TS': 'Telangana',
  'TR': 'Tripura',
  'UK': 'Uttarakhand',
  'UP': 'Uttar Pradesh',
  'WB': 'West Bengal',
  'DL': 'Delhi',
  'PY': 'Puducherry',
  'CH': 'Chandigarh',
  'JK': 'Jammu and Kashmir',
  'LA': 'Ladakh',
  'AN': 'Andaman and Nicobar Islands',
  'DN': 'Dadra and Nagar Haveli and Daman and Diu'
};


private getFullStateName(stateCode: string): string {
  if (!stateCode) return '';
  return this.stateCodeMap[stateCode.toUpperCase()] || stateCode;
}


  private loadFullReferenceDetails(referenceNo: string) {
    this.isLoading = true;
    this.userMgmtService.getReferenceDetails(referenceNo).subscribe({
      next: (details: VipReferenceDetailsResponse) => {
        this.referenceDetails = details;
        this.documents = details.documents || [];
        this.setFormData();
        this.isLoading = false;
      },
      error: (err) => {
        // Fallback to basic data if fetch fails
        this.setFormData();
        this.isLoading = false;
      },
    });
  }

  setFormData() {
    // Format dates
    const formattedReceivedDate = this.formatDate(
      this.referenceDetails.receivedDate,
    );
    const formattedDateOfLetter = this.formatDate(
      this.referenceDetails.dateOfLetter,
    );
    const formattedDateOfEntry = this.formatDate(
      this.referenceDetails.dateOfEntry,
    );

    // Basic Reference Information
    this.setFieldValue('referenceNo', this.referenceDetails.referenceNo);
    this.setFieldValue('subject', this.referenceDetails.subject);
    this.setFieldValue('priority', this.referenceDetails.priority || 'Not Set');
    this.setFieldValue(
      'currentQueue',
      this.formatQueueName(this.referenceDetails.currentQueue),
    );
    this.setFieldValue(
      'initiatorOfficeType',
      this.formatOfficeType(this.referenceDetails.initiatorOfficeType),
    );

    // Date Information
    this.setFieldValue('receivedDate', formattedReceivedDate);
    this.setFieldValue('dateOfLetter', formattedDateOfLetter);
    this.setFieldValue('dateOfEntry', formattedDateOfEntry);

    // VIP/Dignitary Information
    this.setFieldValue(
      'nameOfDignitary',
      this.referenceDetails.nameOfDignitary,
    );
    this.setFieldValue('designation', this.referenceDetails.designation);
    this.loadDesignationName();
    this.setFieldValue('emailId', this.referenceDetails.emailId);
    //this.setFieldValue('state', this.referenceDetails.state);
    const fullStateName = this.getFullStateName(this.referenceDetails.state);
    this.setFieldValue('state', fullStateName);
    this.setFieldValue('constituency', this.referenceDetails.constituency);

    // Category Information
    this.setFieldValue(
      'categoryOfSubject',
      this.referenceDetails.categoryOfSubject,
    );
    this.setFieldValue(
      'subCategoryOfSubject',
      this.referenceDetails.subCategoryOfSubject,
    );

    // Assignment Information
    this.setFieldValue(
      'toLoginId',
      this.referenceDetails.toLoginId || 'Not Assigned',
    );
  }

  private loadDesignationName() {
    const designationCode = this.referenceDetails.designation;
    if (designationCode) {
      this.userMgmtService.getVipDesignationList().subscribe({
        next: (designations: VipDesignationList[]) => {
          const match = designations.find(
            (d) => d.designationCode === designationCode,
          );
          if (match) {
            this.setFieldValue('designation', match.designationName);
          }
        },
      });
    }
  }

  private setFieldValue(fieldName: string, value: any) {
    const control = this.viewReference.get(fieldName);
    if (control) {
      control.setValue(value || 'N/A');
      control.disable();
    }
  }

  private formatDate(dateValue: any): string {
    if (!dateValue) return 'N/A';
    return this.datePipe.transform(dateValue, 'dd MMM yyyy') || 'N/A';
  }

  private formatQueueName(queue: string): string {
    const status = this.referenceDetails?.referenceStatus;
    if (status === 'DISCARDED') return 'Discard References';
    if (status === 'CLOSED') return 'Closed References';
    if (!queue) return 'N/A';
    // Convert queue names like VIP_Assigner to "VIP Assigner"
    return queue.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  private formatOfficeType(officeType: string | undefined): string {
    if (!officeType) return 'N/A';
    if (officeType === 'MINISTRY') return 'Ministry Office';
    if (officeType === 'SECRETARY') return 'Secretary Office';
    return officeType;
  }

  formatDocumentDate(dateValue: any): string {
    if (!dateValue) return 'N/A';
    return this.datePipe.transform(dateValue, 'dd MMM yyyy') || 'N/A';
  }

  getPriorityClass(priority: string): string {
    if (!priority) return '';
    switch (priority.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'normal':
        return 'priority-normal';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  }

  getQueueStatusClass(queue: string): string {
    const status = this.referenceDetails?.referenceStatus;
    if (status === 'DISCARDED') return 'queue-discarded';
    if (status === 'CLOSED') return 'queue-closed';
    if (!queue) return '';
    const lowerQueue = queue.toLowerCase();
    if (lowerQueue.includes('initiator')) return 'queue-initiator';
    if (lowerQueue.includes('assigner')) return 'queue-assigner';
    if (lowerQueue.includes('assignee')) return 'queue-assignee';
    if (lowerQueue.includes('final')) return 'queue-final';
    return '';
  }

  private getUserId(): number {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || 0;
    }
    return 0;
  }

  viewDocument(doc: VipReferenceDocumentResponse) {
    const docId = doc.id || doc.dmsDocumentId;
    if (!docId) {
      this.toaster.error('Document ID not available');
      return;
    }

    this.toaster.info('Opening document...');
    this.userMgmtService
      .downloadDocumentById(docId, this.getUserId())
      .subscribe({
        next: (blob: Blob) => {
          if (blob.size === 0) {
            this.toaster.error('Document is empty or not found');
            return;
          }
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error: (err) => {
          console.error('Error viewing document:', err);
          this.toaster.error('Failed to open document. Please try again.');
        },
      });
  }

  downloadDocument(doc: VipReferenceDocumentResponse) {
    const docId = doc.id || doc.dmsDocumentId;
    if (!docId) {
      this.toaster.error('Document ID not available');
      return;
    }

    this.toaster.info('Downloading document...');
    this.userMgmtService
      .downloadDocumentById(docId, this.getUserId())
      .subscribe({
        next: (blob: Blob) => {
          if (blob.size === 0) {
            this.toaster.error('Document is empty or not found');
            return;
          }
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.fileOriginalName || doc.fileName || 'document';
          a.click();
          window.URL.revokeObjectURL(url);
          this.toaster.success('Document downloaded successfully');
        },
        error: (err) => {
          console.error('Error downloading document:', err);
          this.toaster.error('Failed to download document. Please try again.');
        },
      });
  }
}
