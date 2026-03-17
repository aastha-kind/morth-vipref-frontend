import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UploadInitiatorDocsComponent } from '../upload-initiator-docs/upload-initiator-docs.component';
import { ScrollModeType } from 'ngx-extended-pdf-viewer';
import { UsermgmtService } from '../../service/usermgmt.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ReferenceAssignment } from '../../interface/reference-assignement.model';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../interface/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { VipReferenceDetailsResponse } from '../../interface/reference-details-response.model';

import { EditorComponent } from '@tinymce/tinymce-angular';
import { ReplyEditorComponent } from '../reply-editor/reply-editor.component';
import { OrganizationList } from '../../interface/organization-list.model';
import { OfficeList } from '../../interface/offices-list.model';
import { OfficeTypeList } from '../../interface/office-type-list.model';
import { DivisionList } from '../../interface/division-list.model';
import { DesignationList } from '../../interface/designation-list.model';
import { UserList } from '../../interface/user-list.model';
import { VipDesignationList } from '../../interface/vip-designation-list.model';
import { State } from '../../interface/state.model';
import {
  Action,
  ROLE_BASED_ACTION_OPTIONS,
} from '../../interface/action.model';
import { VipReference } from '../dashboard/dashboard.component';
import { forkJoin, take } from 'rxjs';
import { ActionType } from '../../interface/action-type.model';
import { AdminService } from '../../service/admin.service';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewEditorComponent } from '../view-editor/view-editor.component';
import { API_ENDPOINTS } from '../../utilities/api_endpoints';

@Component({
  selector: 'app-initiator-form',
  standalone: false,
  templateUrl: './initiator-form.component.html',
  styleUrl: './initiator-form.component.css',
})
export class InitiatorFormComponent {
  selectedTabIndex = 0;
  showReferencNo: boolean = false;
  isForwardReference: boolean = false;
  userDetails!: User;
  public ScrollModeType = ScrollModeType;
  public scrollMode: ScrollModeType = ScrollModeType.vertical;
  pdfSrc: string | ArrayBuffer | Blob | Uint8Array | undefined;
  maxDate: Date = new Date(); // Maximum date for date pickers (today)
  minDateOfReceiving: Date | null = null; // Minimum date for Date of Receiving (based on Date of Letter)
  private dialog = inject(MatDialog);
  private userMgmtService = inject(UsermgmtService);
  private ngxService = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);
  private activateRoute = inject(ActivatedRoute);
  private http = inject(HttpClient);
  addVipReferenceDetails!: FormGroup;
  forwardReferenceForm!: FormGroup;
  selectedReferenceDetails: any;
  refernceDetails: VipReferenceDetailsResponse =
    {} as VipReferenceDetailsResponse;
  draftReferenceId: number | null = null; // Track draft reference ID
  organizationsList: OrganizationList[] = [];
  officeTypeOptions: OfficeTypeList[] = [];
  officeTypeList: OfficeList[] = [];
  divisionList: DivisionList[] = [];
  designationList: DesignationList[] = [];
  userLists: UserList[] = [];
  vipDesignationList: VipDesignationList[] = [];
  stateList: State[] = [];
  categoryList: any[] = [];
  subCategoryList: any[] = [];
  activeAssignersList: any[] = []; // List of active assigners
  selectedAssigner: any = null; // Selected assigner
  allowedQueues: any[] = [];
  init: EditorComponent['init'] = {
    plugins: 'lists link image table code help wordcount',
  };
  allowedActions: any[] = [];
  actionTypeOptions: any[] = [];
  actionOptions: any[] = [];
  createdDate = new Date();
  selectedUser: UserList[] = [];
  private adminService = inject(AdminService);
  private router = inject(Router);
  showForwardBtn = false;
  showDiscardBtn = false;
  showFinalReplyBtn = false;
  previousRoute: string = '/dashboard'; // Default fallback route
  showAssignBack = false;
  showDraftReply = false;
  showCloseReference = false;
  actionHistoryData = new MatTableDataSource<any>();
  savedDraftReply = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(false, []); // false = single selection
  selectedDraftRecord: any = null;
  displayedColumns: string[] = [
    'performedByName',
    'actionType',
    'actionName',
    'comments',
    'targetUser',
    'targetUserName',
    'timestamp',
  ];
  savedDraftReplyCol: string[] = [
    'select',
    'id',
    'draftReplyId',
    'editedBy',
    'editedAt',
    'fileName',
    'versionNumber',
    'viewDraft',
  ];

  // Linked References properties
  linkedReferencesSearchForm!: FormGroup;
  searchResultsData = new MatTableDataSource<any>();
  linkedReferencesData = new MatTableDataSource<any>();
  searchResultsSelection = new SelectionModel<any>(true, []);
  linkedReferencesSelection = new SelectionModel<any>(true, []);
  searchResultsColumns: string[] = [
    'select',
    'referenceNo',
    'subject',
    'status',
  ];
  linkedReferencesColumns: string[] = [
    'select',
    'referenceNo',
    'subject',
    'status',
  ];

  documentList: any[] = [];
  selectedDocument: any;
  selectedDocumentDetails: any = null;
  showDocumentInfo: boolean = false;
  pendingDocuments: Array<{
    file: File;
    documentType: string;
    comments: string;
  }> = []; // For new references

  // Knowledge Base properties
  knowledgeBaseForm!: FormGroup;
  knowledgeBaseResults: VipReference[] = [];
  knowledgeBaseDataSource = new MatTableDataSource<VipReference>();
  selectedKBReferences: VipReference[] = [];
  knowledgeBaseSearched: boolean = false;
  knowledgeBaseColumns: string[] = [
    'select',
    'requestNumber',
    'nameOfDignitary',
    'designation',
    'state',
    'subjectCategory',
    'pending',
  ];

  ngOnInit() {
    this.getUserDetails();
    this.initiateReferenceForm();
    this.initiateLinkedReferencesSearchForm();
    this.initiateKnowledgeBaseForm();
    this.getOrganizationsList();
    this.getStateList();
    this.getVipDesignationList();
    this.getActiveAssigners();
    this.getCategoryList();

    // Capture the previous route from navigation state or query params
    // Use history.state since getCurrentNavigation() is null after navigation completes
    const state = history.state;

    if (state && state['previousRoute']) {
      this.previousRoute = state['previousRoute'];
    } else if (this.activateRoute.snapshot.queryParams['returnUrl']) {
      this.previousRoute = this.activateRoute.snapshot.queryParams['returnUrl'];
    }

    // Check if editing a draft from navigation state
    if (state && state['isDraft'] && state['draftReferenceId']) {
      this.draftReferenceId = state['draftReferenceId'];
      // Load draft data into form
      this.loadDraftData(state['draftReferenceId']);
    }

    // Check if referenceNo is provided in route params
    const referenceNo = this.activateRoute.snapshot.params['referenceNo'];
    if (referenceNo) {
      this.loadReferenceByNumber(referenceNo);
      this.loadLinkedReferences();
    }
  }

  loadDraftData(draftReferenceId: number) {
    this.ngxService.start();
    const apiUrl = `${API_ENDPOINTS.reference}/reference-details-by-id/${draftReferenceId}`;

    // Fetch draft details from API using reference ID
    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        this.ngxService.stop();
        if (res) {
          // Populate form with draft data
          const formValues = {
            dateOfLetter: this.parseLocalDate(res.dateOfLetter),
            dateOfReceiving: this.parseLocalDate(res.receivedDate),
            dateOfEntry: this.parseLocalDate(res.dateOfEntry) || new Date(),
            nameOfDiginitary: res.nameOfDignitary || '',
            emailId: res.emailId || '',
            designation: res.designation || '',
            state: res.state || '',
            constituency: res.constituency || '',
            priority: res.priority || '',
            catgOfSubject: res.categoryOfSubject || '',
            subCatgOfSubject: res.subCategoryOfSubject || '',
            subjectOrIssue: res.subject || '',
          };
          this.addVipReferenceDetails.patchValue(formValues);

          // Update minDateOfReceiving if dateOfLetter exists
          if (res.dateOfLetter) {
            this.minDateOfReceiving = this.parseLocalDate(res.dateOfLetter);
          }

          // Load subcategories if category is set
          if (res.categoryOfSubject) {
            this.getSubCategoryList(res.categoryOfSubject);
          }

          // Load documents if available
          if (res.documents && res.documents.length > 0) {
            this.documentList = res.documents;
            // Select the first document by default
            if (this.documentList.length > 0) {
              this.selectedDocument = this.documentList[0].fileName;
              this.selectedDocumentDetails = this.documentList[0];
              // Load PDF preview if it's a PDF
              if (
                this.documentList[0].filePath ||
                this.documentList[0].dmsDocumentId
              ) {
                this.loadDocumentPreview(this.documentList[0]);
              }
            }
          }

          this.toastr.info(
            'Draft loaded. Continue editing and submit when ready.',
          );
        }
      },
      error: (err) => {
        this.ngxService.stop();
        console.error('Error loading draft:', err);
        this.toastr.error('Failed to load draft data');
      },
    });
  }

  loadDocumentPreview(doc: any) {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // Check if document is stored in DMS
    if (doc.storageType === 'dms' && doc.dmsDocumentId) {
      const apiUrl = `${API_ENDPOINTS.referenceWorkFlow}/download-document-by-id`;
      const body = { documentId: doc.id, userId: 0 };
      this.http
        .post(apiUrl, body, { responseType: 'blob', headers: headers })
        .subscribe({
          next: (blob) => {
            this.pdfSrc = URL.createObjectURL(blob);
          },
          error: (err) => {
            console.error('Error loading DMS document preview:', err);
          },
        });
    } else {
      // Fallback: local file path
      const downloadUrl = `${API_ENDPOINTS.referenceWorkFlow}/download-document?filePath=${encodeURIComponent(doc.filePath)}`;
      this.http
        .get(downloadUrl, { responseType: 'blob', headers: headers })
        .subscribe({
          next: (blob) => {
            this.pdfSrc = URL.createObjectURL(blob);
          },
          error: (err) => {
            console.error('Error loading document preview:', err);
          },
        });
    }
  }

  disabledReferenceField() {
    // Safety check: only proceed if selectedReferenceDetails exists
    if (!this.selectedReferenceDetails) {
      return;
    }

    this.allowedQueues.map((queue) => {
      if (this.selectedReferenceDetails.currentQueue == 'VIP_Initiator') {
        this.showReferencNo = false;
        this.addVipReferenceDetails.get('referenceNo')?.disable();
      } else if (this.selectedReferenceDetails.currentQueue == 'VIP_Assigner') {
        this.initiateforwardReferenceForm();
        this.showReferencNo = true;
        this.addVipReferenceDetails.get('referenceNo')?.disable();
        this.addVipReferenceDetails.get('dateOfLetter')?.disable();
        this.addVipReferenceDetails.get('dateOfReceiving')?.disable();
      } else if (this.selectedReferenceDetails.currentQueue == 'VIP_Assignee') {
        this.initiateforwardReferenceForm();
        this.showReferencNo = true;
        this.addVipReferenceDetails.disable();
      } else if (
        this.selectedReferenceDetails.currentQueue == 'VIP_final_reply'
      ) {
        this.initiateforwardReferenceForm();
        this.showReferencNo = true;
        this.addVipReferenceDetails.disable();
      }
    });
  }

  getUserDetails() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.userDetails = JSON.parse(userData);
      if (
        this.userDetails.roles[0].roleId !== undefined &&
        this.userDetails.roles[0].roleId !== null
      ) {
        if (this.userDetails.roles[0].roleName !== 'Initiator') {
          this.userMgmtService.referenceDetails$.pipe(take(1)).subscribe({
            next: (res: any | null) => {
              if (res !== null && res !== undefined) {
                this.selectedReferenceDetails = res;
                this.getReferenceDetails();
                this.getActionAllowed(this.userDetails);
                this.getActionHistory(this.userDetails);
              }
            },
            error: (err: Error) => {
              this.toastr.error('please enter valid details');
              this.ngxService.stop();
            },
          });
        }
        this.getUserQueues(this.userDetails);
      }
    }
  }

  getActionAllowed(userDetails: any) {
    this.ngxService.start();
    const userData = {
      loginId: userDetails.loginId,
      referenceId: this.selectedReferenceDetails?.referenceId,
    };
    this.userMgmtService.getUserActionAllowed(userData).subscribe({
      next: (res) => {
        const actionTypes = res?.allowedActions;
        this.allowedActions = actionTypes;
        const uniqueActionConfigs = Array.from(
          new Map(
            actionTypes.map((item: any) => [item.actionType, item]),
          ).values(),
        );
        if (uniqueActionConfigs !== null && uniqueActionConfigs !== undefined) {
          this.actionTypeOptions = uniqueActionConfigs;
        }
        this.ngxService.stop();
      },
      error: (err: Error) => {
        this.toastr.error('Error in getting user actions');
        this.ngxService.stop();
      },
    });
  }

  getActionHistory(userDetails: any) {
    this.ngxService.start();
    const userData = {
      loginId: userDetails.loginId,
      referenceId: this.selectedReferenceDetails?.referenceId,
    };
    this.userMgmtService.getActionHistory(userData).subscribe({
      next: (res) => {
        this.actionHistoryData.data = res?.history ? res?.history : [];
        this.ngxService.stop();
      },
      error: (err: Error) => {
        this.toastr.error('Error in getting user actions');
        this.ngxService.stop();
      },
    });
  }

  getUserQueues(userDetails: User) {
    this.ngxService.start();
    this.userMgmtService.getUserQueueList(userDetails.loginId).subscribe({
      next: (res) => {
        const queues = res.queues;
        this.allowedQueues = [];
        queues.forEach((queue: string) => {
          switch (queue) {
            case 'Initiator':
              this.allowedQueues.push({
                name: 'VIP_Initiator',
                route: 'vip-initiator',
              });
              break;
            case 'Assigner':
              this.allowedQueues.push({
                name: 'VIP_Assigner',
                route: 'vip-assigner',
              });
              break;
            case 'Assignee':
              this.allowedQueues.push({
                name: 'VIP_Assignee',
                route: 'vip-assignee',
              });
              break;
            case 'Final_Reply':
              this.allowedQueues.push({
                name: 'VIP_Final_Reply',
                route: 'vip-final-reply',
              });
              break;
            default:
              break;
          }
        });
        this.disabledReferenceField();
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('No references found for this user');
        this.ngxService.stop();
      },
    });
  }

  initiateReferenceForm() {
    this.addVipReferenceDetails = new FormGroup({
      referenceNo: new FormControl(''),
      toLoginId: new FormControl(''),
      dateOfLetter: new FormControl('', [
        Validators.required,
        this.noFutureDateValidator.bind(this),
      ]),
      dateOfReceiving: new FormControl('', [
        Validators.required,
        this.noFutureDateValidator.bind(this),
      ]),
      dateOfEntry: new FormControl(
        { value: new Date(), disabled: true },
        Validators.required,
      ),
      nameOfDiginitary: new FormControl('', Validators.required),
      emailId: new FormControl(''),
      designation: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      constituency: new FormControl(''),
      priority: new FormControl(''),
      catgOfSubject: new FormControl('', Validators.required),
      subCatgOfSubject: new FormControl('', Validators.required),
      subjectOrIssue: new FormControl('', Validators.required),
      uploadDocument: new FormGroup({
        file: new FormControl(''),
        documentType: new FormControl(''),
        comments: new FormControl(''),
      }),
    });

    // Update minDateOfReceiving when dateOfLetter changes
    this.addVipReferenceDetails
      .get('dateOfLetter')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.minDateOfReceiving = new Date(value);
          // If current dateOfReceiving is before the new minDate, clear it
          const currentReceivingDate =
            this.addVipReferenceDetails.get('dateOfReceiving')?.value;
          if (currentReceivingDate) {
            const receivingDate = new Date(currentReceivingDate);
            if (receivingDate < this.minDateOfReceiving) {
              this.addVipReferenceDetails
                .get('dateOfReceiving')
                ?.setValue(null);
            }
          }
        } else {
          this.minDateOfReceiving = null;
        }
      });
  }

  initiateforwardReferenceForm() {
    this.forwardReferenceForm = new FormGroup({
      routingType: new FormControl(''),
      actionType: new FormControl('', Validators.required),
      action: new FormControl(
        { value: '', disabled: true },
        Validators.required,
      ),
      replyType: new FormControl({ value: '', disabled: true }),
      assigneeOrganization: new FormControl(
        { value: '', disabled: true },
        Validators.required,
      ),
      assigneeOfficeType: new FormControl(
        { value: '', disabled: true },
        Validators.required,
      ),
      assigneeOffice: new FormControl(
        { value: '', disabled: true },
        Validators.required,
      ),
      assigneeDivision: new FormControl(
        { value: '', disabled: true },
        Validators.required,
      ),
      assigneeDesignation: new FormControl(
        { value: '', disabled: true },
        Validators.required,
      ),
      assigneeName: new FormControl(
        { value: '', disabled: true },
        Validators.required,
      ),
      assignerComment: new FormControl({ value: '', disabled: true }),
      actionConfigId: new FormControl(null),
    });
  }

  onDocumentSelect(event: any) {
    const selectedValue = event.target.value;

    // Check if selecting from pending documents (for new references)
    if (selectedValue.startsWith('pending_')) {
      const index = parseInt(selectedValue.replace('pending_', ''));
      const pendingDoc = this.pendingDocuments[index];
      if (pendingDoc) {
        this.loadPendingDocument(pendingDoc, index);
      }
      return;
    }

    // Handle existing documents (for saved references)
    const selectedDoc = this.documentList.find(
      (doc) => doc.fileName === selectedValue,
    );

    if (selectedDoc && selectedDoc.filePath) {
      this.loadDocument(selectedDoc);
    } else {
      this.pdfSrc = undefined;
      this.toastr.error('Document path not found');
    }
  }

  loadPendingDocument(
    doc: { file: File; documentType: string; comments: string },
    index: number,
  ) {
    // Store selected pending document details
    this.selectedDocumentDetails = {
      fileOriginalName: doc.file.name,
      fileName: doc.file.name,
      documentType: doc.documentType,
      comments: doc.comments,
      createdBy: this.userDetails?.name || 'Current User',
      createdAt: new Date().toISOString(),
    };

    // Load the file for preview
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result !== null) {
        this.pdfSrc = reader.result;
        this.selectedDocument = `pending_${index}`;
      }
    };
    reader.readAsArrayBuffer(doc.file);
  }

  loadDocument(selectedDoc: any) {
    if (!selectedDoc || (!selectedDoc.filePath && !selectedDoc.dmsDocumentId)) {
      this.pdfSrc = undefined;
      this.selectedDocumentDetails = null;
      this.toastr.warning('Document path not available');
      return;
    }

    // Store selected document details
    this.selectedDocumentDetails = selectedDoc;

    const token = sessionStorage.getItem('token');

    if (!token) {
      this.pdfSrc = undefined;
      this.selectedDocumentDetails = null;
      this.toastr.error('Authentication token not found. Please login again.');
      return;
    }

    this.ngxService.start();

    // Create headers with JWT token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // Check if document is stored in DMS
    if (selectedDoc.storageType === 'dms' && selectedDoc.dmsDocumentId) {
      // Use DMS download endpoint (POST)
      const apiUrl = `${API_ENDPOINTS.referenceWorkFlow}/download-document-by-id`;
      const body = { documentId: selectedDoc.id, userId: 0 };
      this.http
        .post(apiUrl, body, { responseType: 'blob', headers: headers })
        .subscribe({
          next: (blob: Blob) => {
            if (blob && blob.size > 0) {
              this.pdfSrc = blob;
              this.selectedDocument = selectedDoc.fileName;
            } else {
              this.pdfSrc = undefined;
              this.selectedDocumentDetails = null;
              this.toastr.warning('Document is empty or invalid');
            }
            this.ngxService.stop();
          },
          error: (err) => {
            this.ngxService.stop();
            console.error('DMS Document load error:', err);
            this.pdfSrc = undefined;
            this.selectedDocumentDetails = null;
            this.toastr.error('Failed to load document from DMS');
          },
        });
      return;
    }

    // Fallback: Use local file path endpoint (GET)
    const apiUrl = `${API_ENDPOINTS.referenceWorkFlow}/download-document?filePath=${encodeURIComponent(selectedDoc.filePath)}`;
    // Fetch the document as a Blob with explicit headers
    this.http
      .get(apiUrl, { responseType: 'blob', headers: headers })
      .subscribe({
        next: (blob: Blob) => {
          if (blob && blob.size > 0) {
            this.pdfSrc = blob;
            this.selectedDocument = selectedDoc.fileName;
          } else {
            this.pdfSrc = undefined;
            this.selectedDocumentDetails = null;
            this.toastr.warning('Document is empty or invalid');
          }
          this.ngxService.stop();
        },
        error: (err) => {
          this.ngxService.stop();
          console.error('Document load error:', err);
          console.error('Failed to load document:', selectedDoc?.fileName);
          console.error('Document path:', selectedDoc?.filePath);
          this.pdfSrc = undefined;
          this.selectedDocumentDetails = null;

          if (err.status === 401) {
            this.toastr.error('Unauthorized. Please login again.');
          } else if (err.status === 404) {
            // Parse error message if available
            const errorMsg =
              err.error?.message ||
              err.message ||
              'Document not found on server';
            this.toastr.error(
              `Document not found: ${selectedDoc?.fileName || 'Unknown file'}`,
            );
            console.error('404 Error details:', errorMsg);
          } else if (err.status === 403) {
            this.toastr.error('Access denied to this document');
          } else {
            this.toastr.error('Error loading document. Please try again.');
          }
        },
      });
  }

  loadFirstDocument() {
    if (this.documentList && this.documentList.length > 0) {
      // Load the last document (most recently uploaded) instead of first
      const lastDoc = this.documentList[this.documentList.length - 1];
      this.loadDocument(lastDoc);
    }
  }

  toggleDocumentInfo() {
    this.showDocumentInfo = !this.showDocumentInfo;
  }

  openDialog() {
    const dialogRef = this.dialog.open(UploadInitiatorDocsComponent, {
      data: this.refernceDetails,
      disableClose: false,
      width: '800px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((formGroupDts) => {
      // Only proceed if dialog returned data
      if (!formGroupDts || !formGroupDts.selectFile) {
        return;
      }

      const uploadGroup = this.addVipReferenceDetails.get(
        'uploadDocument',
      ) as FormGroup;
      uploadGroup.get('file')?.setValue(formGroupDts.selectFile);
      uploadGroup.get('comments')?.setValue(formGroupDts.comments);
      uploadGroup.get('documentType')?.setValue(formGroupDts.documentType);

      // If reference exists, refresh the document list from backend
      if (
        this.refernceDetails.referenceId !== null &&
        this.refernceDetails.referenceId !== undefined
      ) {
        // Refresh reference details to get updated document list
        this.getReferenceDetails();

        // Show success message and option to upload more
        if (formGroupDts.uploaded) {
          setTimeout(() => {
            const uploadMore = confirm(
              'Document uploaded successfully! Do you want to upload another document?',
            );
            if (uploadMore) {
              this.openDialog(); // Reopen dialog for next upload
            }
          }, 500);
        }
      } else {
        // For new references (no referenceId yet), store files locally
        if (formGroupDts.selectFile) {
          // Add to pending documents list
          this.pendingDocuments.push({
            file: formGroupDts.selectFile,
            documentType: formGroupDts.documentType,
            comments: formGroupDts.comments,
          });

          const currentIndex = this.pendingDocuments.length - 1;

          // Set selected document details for info panel
          this.selectedDocumentDetails = {
            fileOriginalName: formGroupDts.selectFile.name,
            fileName: formGroupDts.selectFile.name,
            documentType: formGroupDts.documentType,
            comments: formGroupDts.comments,
            createdBy: this.userDetails?.name || 'Current User',
            createdAt: new Date().toISOString(),
          };

          // Set selected document for dropdown
          this.selectedDocument = `pending_${currentIndex}`;

          // Load the latest document for preview
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result !== null) {
              this.pdfSrc = reader.result;
            }
          };
          reader.readAsArrayBuffer(formGroupDts.selectFile);

          // Show success and option to add more
          setTimeout(() => {
            const message = `Document added (${this.pendingDocuments.length} total). Do you want to add another document?`;
            const uploadMore = confirm(message);
            if (uploadMore) {
              this.openDialog(); // Reopen dialog for next upload
            }
          }, 300);
        }
      }
    });
  }

  addVipReferencDetails() {
    const uploadGroup = this.addVipReferenceDetails.get(
      'uploadDocument',
    ) as FormGroup;
    const fileControl = uploadGroup.get('file');
    const file = fileControl?.value;

    // If editing draft and document already exists → remove required
    if (this.documentList?.length > 0) {
      fileControl?.clearValidators();
    } else {
      fileControl?.setValidators(Validators.required);
    }

    fileControl?.updateValueAndValidity();

    if (this.addVipReferenceDetails.invalid) {
      this.addVipReferenceDetails.markAllAsTouched();
      // Collect invalid fields
      const invalidFields: string[] = [];
      Object.keys(this.addVipReferenceDetails.controls).forEach((key) => {
        const control = this.addVipReferenceDetails.get(key);
        if (control && control.invalid) {
          invalidFields.push(key); // or map to friendly field names if needed
        }
      });
      this.ngxService.stop();
      const errorMessage = `Please enter valid details in: ${invalidFields.join(', ')}`;
      this.toastr.error(errorMessage);
      return;
    }

    // Validate assigner selection (only for new references, not when editing existing ones)
    const isEditingExistingReference =
      this.refernceDetails?.referenceId ||
      this.activateRoute.snapshot.params['referenceNo'];
    if (!this.selectedAssigner && !isEditingExistingReference) {
      this.toastr.error('Please select an Assigner');
      return;
    }

    const formData = new FormData();
    const vipReferenceDetails = this.addVipReferenceDetails.getRawValue();

    // Append normal fields
    formData.append('fromLoginId', this.userDetails.loginId);
    // Use selected assigner if available, otherwise use existing reference's toLoginId or form value
    const toLoginId =
      this.selectedAssigner?.loginId ||
      vipReferenceDetails.toLoginId ||
      this.refernceDetails?.toLoginId;
    formData.append('toLoginId', toLoginId);
    formData.append(
      'fromRoleId',
      JSON.stringify(this.userDetails.roles[0].roleId),
    );
    formData.append('toRoleId', '2');
    formData.append(
      'dateOfLetter',
      this.formatDateToIso(vipReferenceDetails.dateOfLetter),
    );
    formData.append(
      'dateOfReceiving',
      this.formatDateToIso(vipReferenceDetails.dateOfReceiving),
    );
    formData.append(
      'dateOfEntry',
      this.formatDateToIso(vipReferenceDetails.dateOfEntry),
    );
    formData.append('nameOfDignitary', vipReferenceDetails.nameOfDiginitary);
    formData.append('emailId', vipReferenceDetails.emailId);
    formData.append('designation', vipReferenceDetails.designation);
    formData.append('state', vipReferenceDetails.state);
    formData.append('constituency', vipReferenceDetails.constituency);
    formData.append('priority', vipReferenceDetails.priority);
    formData.append('categoryOfSubject', vipReferenceDetails.catgOfSubject);
    formData.append(
      'subCategoryOfSubject',
      vipReferenceDetails.subCatgOfSubject,
    );
    formData.append('subject', vipReferenceDetails.subjectOrIssue);
    formData.append('createdBy', this.userDetails.name);
    formData.append('createdAt', this.formatDateToIso(this.createdDate));
    formData.append('isDraft', 'false');
    formData.append('actionConfigId', '1');

    // If submitting an existing draft, include the reference ID
    if (this.draftReferenceId) {
      formData.append('vipReferenceId', this.draftReferenceId.toString());
    }

    // Append uploaded files - handle both pending documents and single file upload
    if (this.pendingDocuments.length > 0) {
      // Upload all pending documents for new references
      this.pendingDocuments.forEach((doc) => {
        formData.append('files', doc.file);
        formData.append('documentTypes', doc.documentType);
        formData.append('comments', doc.comments || '');
      });
    } else {
      // Fallback to single file from uploadDocument form group
      const uploadGroup = this.addVipReferenceDetails.get(
        'uploadDocument',
      ) as FormGroup;
      const file = uploadGroup.get('file')?.value;
      const documentType = uploadGroup.get('documentType')?.value;
      const comments = uploadGroup.get('comments')?.value;

      if (file) {
        formData.append('files', file); // Backend expects 'files' list
        formData.append('documentTypes', documentType);
        formData.append('comments', comments);
      }
    }

    this.userMgmtService.addVipReferenceDetails(formData).subscribe({
      next: (res: any) => {
        this.router.navigate(['/dashboard/vip-initiator']);
        const docCount = this.pendingDocuments.length || 1;
        this.toastr.success(
          `Reference ID ${res.referenceId} submitted successfully with documents!`,
        );
        this.resetAddReferenceForm();
        this.pendingDocuments = []; // Clear pending documents
        this.draftReferenceId = null; // Clear draft ID after successful submission
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('please enter valid details');
        this.ngxService.stop();
      },
    });
  }

  saveVipReferenceDetails() {
    const vipReferenceDetails = this.addVipReferenceDetails.getRawValue();
    const formData = new FormData();

    // Append normal fields
    formData.append('fromLoginId', this.userDetails.loginId);
    // Use selected assigner if available, otherwise use default
    formData.append(
      'toLoginId',
      this.selectedAssigner?.loginId || 'GauravPrasad',
    );
    formData.append(
      'fromRoleId',
      JSON.stringify(this.userDetails.roles[0].roleId),
    );
    formData.append('toRoleId', '2');
    formData.append(
      'dateOfLetter',
      this.formatDateToIso(vipReferenceDetails.dateOfLetter),
    );
    formData.append(
      'dateOfReceiving',
      this.formatDateToIso(vipReferenceDetails.dateOfReceiving),
    );
    formData.append(
      'dateOfEntry',
      this.formatDateToIso(vipReferenceDetails.dateOfEntry),
    );
    formData.append('nameOfDignitary', vipReferenceDetails.nameOfDiginitary);
    formData.append('emailId', vipReferenceDetails.emailId);
    formData.append('designation', vipReferenceDetails.designation);
    formData.append('state', vipReferenceDetails.state);
    formData.append('constituency', vipReferenceDetails.constituency);
    formData.append('priority', vipReferenceDetails.priority);
    formData.append('categoryOfSubject', vipReferenceDetails.catgOfSubject);
    formData.append(
      'subCategoryOfSubject',
      vipReferenceDetails.subCatgOfSubject,
    );
    formData.append('subject', vipReferenceDetails.subjectOrIssue);
    formData.append('createdBy', this.userDetails.name);
    formData.append('createdAt', this.formatDateToIso(this.createdDate));
    formData.append('isDraft', 'true');

    // If updating an existing draft, include the reference ID
    if (this.draftReferenceId) {
      formData.append('vipReferenceId', this.draftReferenceId.toString());
    }

    // Append pending documents for draft
    if (this.pendingDocuments.length > 0) {
      this.pendingDocuments.forEach((doc) => {
        formData.append('files', doc.file);
        formData.append('documentTypes', doc.documentType || '');
        formData.append('comments', doc.comments || '');
      });
    }

    this.userMgmtService.addVipReferenceDetails(formData).subscribe({
      next: (res: any) => {
        if (res && res.referenceId) {
          // Store the draft reference ID for future updates
          this.draftReferenceId = res.referenceId;
          this.toastr.success(
            `Draft Reference ID ${res.referenceId} saved successfully!`,
          );
        } else {
          this.toastr.success('Reference saved successfully');
        }
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('please enter valid details');
        this.ngxService.stop();
      },
    });
  }

  formatDateToIso(date: any): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }
    // Use local date components to avoid UTC timezone shift
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
  }

  // Parse date string as local date to avoid UTC timezone shift
  parseLocalDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    // Extract YYYY-MM-DD part and create date using local components
    const parts = dateStr.substring(0, 10).split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-based
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }

  resetAddReferenceForm() {
    this.addVipReferenceDetails.reset();
    this.pdfSrc = '';
  }

  getReferenceDetails() {
    this.ngxService.start();
    this.userMgmtService
      .getReferenceDetails(this.selectedReferenceDetails.referenceNo)
      .subscribe({
        next: (res: VipReferenceDetailsResponse) => {
          this.refernceDetails = res;
          this.documentList = res.documents ? res.documents : [];
          this.setReferenceDetails();
          this.loadFirstDocument();
          this.ngxService.stop();
        },
        error: (err) => {
          this.toastr.error('Error in getting reference details');
          this.ngxService.stop();
        },
      });
  }

  loadReferenceByNumber(referenceNo: string) {
    this.ngxService.start();
    this.userMgmtService.getReferenceDetails(referenceNo).subscribe({
      next: (res: VipReferenceDetailsResponse) => {
        this.refernceDetails = res;
        this.selectedReferenceDetails = res; //{ referenceNo: referenceNo };
        this.documentList = res.documents ? res.documents : [];
        // Populate selectedAssigner if toLoginId is available
        if (res.toLoginId && this.activeAssignersList.length > 0) {
          this.selectedAssigner = this.activeAssignersList.find(
            (assigner) => assigner.loginId === res.toLoginId,
          );
        }

        this.setReferenceDetails();
        this.disabledReferenceField();
        this.loadFirstDocument();
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('Error loading reference details');
        this.router.navigate(['/dashboard/vip-initiator']);
        this.ngxService.stop();
      },
    });
  }

  setReferenceDetails() {
    // Find category ID from name or use as-is if already an ID
    let categoryId = this.refernceDetails.categoryOfSubject;
    if (categoryId && this.categoryList.length > 0) {
      // Check if it's a name (not a number) and find the matching ID
      const isNumeric = !isNaN(Number(categoryId));
      if (!isNumeric) {
        const matchedCategory = this.categoryList.find(
          (cat) =>
            cat.categoryDescription === categoryId ||
            cat.categoryName === categoryId,
        );
        if (matchedCategory) {
          categoryId = matchedCategory.categoryId.toString();
        }
      }
    }

    this.addVipReferenceDetails.patchValue({
      referenceNo: this.refernceDetails.referenceNo,
      dateOfLetter: this.parseLocalDate(this.refernceDetails.dateOfLetter),
      dateOfReceiving: this.parseLocalDate(this.refernceDetails.receivedDate),
      dateOfEntry: this.parseLocalDate(this.refernceDetails.dateOfEntry),
      nameOfDiginitary: this.refernceDetails.nameOfDignitary,
      emailId: this.refernceDetails.emailId,
      designation: this.refernceDetails.designation,
      state: this.refernceDetails.state,
      constituency: this.refernceDetails.constituency,
      priority: this.refernceDetails.priority,
      catgOfSubject: categoryId?.toString(),
      subjectOrIssue: this.refernceDetails.subject,
    });

    // Load subcategories if category is already selected (only if it's a valid number)
    if (categoryId && !isNaN(Number(categoryId))) {
      this.getSubCategoryList(Number(categoryId));
    }

    // Populate the file and document details
    if (
      this.refernceDetails.documents &&
      this.refernceDetails.documents.length > 0
    ) {
      this.addVipReferenceDetails.get('uploadDocument')?.patchValue({
        file: this.refernceDetails.documents[0].fileName, // Assuming you're uploading only one file
        documentType: this.refernceDetails.documents[0].documentType,
        comments: this.refernceDetails.documents[0].comments,
      });

      // Document loading is handled by loadFirstDocument() method called after setReferenceDetails()
      // which properly loads the PDF via HTTP from backend
    }
  }

  getVipDesignationList() {
    this.ngxService.start();
    this.userMgmtService.getVipDesignationList().subscribe({
      next: (response) => {
        this.vipDesignationList = response;
        this.ngxService.stop();
      },
      error: (err) => {
        this.ngxService.stop();
      },
    });
  }

  getStateList() {
    this.ngxService.start();
    this.userMgmtService.getStateList().subscribe({
      next: (response: any) => {
        this.stateList = response;
        this.ngxService.stop();
      },
      error: (err) => {
        this.ngxService.stop();
      },
    });
  }

  getActiveAssigners() {
    this.ngxService.start();
    this.userMgmtService.getActiveAssigners().subscribe({
      next: (response: any) => {
        this.activeAssignersList = response;
        // Auto-select assigner based on user's office type
        this.autoSelectAssigner();
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('Error loading assigners');
        this.ngxService.stop();
      },
    });
  }

  /**
   * Auto-select assigner based on the logged-in user's office type.
   * Logic:
   * 1. If only one assigner exists, select that one
   * 2. If multiple assigners exist, try to match by office type
   * 3. If no match found by office type, don't auto-select (let user choose)
   */
  autoSelectAssigner() {
    if (!this.activeAssignersList || this.activeAssignersList.length === 0) {
      return;
    }

    // If already editing a reference with an assigned assigner, don't override
    if (this.selectedAssigner) {
      return;
    }

    const userOfficeType = this.userDetails?.officeType;

    // If only one assigner, auto-select it
    if (this.activeAssignersList.length === 1) {
      this.selectedAssigner = this.activeAssignersList[0];
      return;
    }

    // If user has an office type, try to find matching assigner
    if (userOfficeType) {
      const matchingAssigner = this.activeAssignersList.find(
        (assigner: any) => assigner.officeType === userOfficeType,
      );

      if (matchingAssigner) {
        this.selectedAssigner = matchingAssigner;
        return;
      }
    }

    // If no match by office type but all assigners have the same office type, select the first one
    const uniqueOfficeTypes = new Set(
      this.activeAssignersList
        .map((a: any) => a.officeType)
        .filter((t: any) => t),
    );
    if (uniqueOfficeTypes.size <= 1) {
      this.selectedAssigner = this.activeAssignersList[0];
    }
  }

  getCategoryList() {
    this.ngxService.start();
    this.adminService.getAllCategories().subscribe({
      next: (response: any) => {
        this.categoryList = response;

        // If reference details are already loaded, re-apply category value
        if (
          this.refernceDetails?.categoryOfSubject &&
          this.categoryList.length > 0
        ) {
          let categoryId = this.refernceDetails.categoryOfSubject;
          const isNumeric = !isNaN(Number(categoryId));
          if (!isNumeric) {
            const matchedCategory = this.categoryList.find(
              (cat: any) =>
                cat.categoryDescription === categoryId ||
                cat.categoryName === categoryId,
            );
            if (matchedCategory) {
              categoryId = matchedCategory.categoryId.toString();
              this.addVipReferenceDetails.patchValue({
                catgOfSubject: categoryId,
              });
              // Also load subcategories
              this.getSubCategoryList(Number(categoryId));
            }
          }
        }

        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('Error loading categories');
        this.ngxService.stop();
      },
    });
  }

  onCategoryChange(event: any) {
    const selectedCategoryId = event.target.value;

    // Clear subcategory selection and list
    this.addVipReferenceDetails.get('subCatgOfSubject')?.setValue('');
    this.subCategoryList = [];

    if (
      selectedCategoryId !== null &&
      selectedCategoryId !== undefined &&
      selectedCategoryId !== ''
    ) {
      this.getSubCategoryList(Number(selectedCategoryId));
    }
  }

  getSubCategoryList(categoryId: number) {
    this.ngxService.start();
    this.adminService.getSubCategoriesByCategoryId(categoryId).subscribe({
      next: (response: any) => {
        this.subCategoryList = response;

        // Auto-select subcategory if it has value "NA" (category has no subcategory)
        const naSubCategory = this.subCategoryList.find(
          (subCat: any) =>
            subCat.subCatName === 'NA' || subCat.subCategoryName === 'NA',
        );
        if (naSubCategory) {
          this.addVipReferenceDetails.patchValue({
            subCatgOfSubject: naSubCategory.subCatId.toString(),
          });
          this.ngxService.stop();
          return;
        }

        // After loading subcategories, set the subcategory value if available
        if (
          this.refernceDetails?.subCategoryOfSubject &&
          this.subCategoryList.length > 0
        ) {
          let subCategoryId = this.refernceDetails.subCategoryOfSubject;
          const isNumeric = !isNaN(Number(subCategoryId));
          if (!isNumeric) {
            // Find subcategory ID from name
            const matchedSubCategory = this.subCategoryList.find(
              (subCat: any) =>
                subCat.subCatName === subCategoryId ||
                subCat.subCategoryName === subCategoryId,
            );
            if (matchedSubCategory) {
              subCategoryId = matchedSubCategory.subCatId.toString();
            }
          }
          this.addVipReferenceDetails.patchValue({
            subCatgOfSubject: subCategoryId.toString(),
          });
        }

        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('Error loading subcategories');
        this.ngxService.stop();
      },
    });
  }

  openEditor() {
    const dialogRef = this.dialog.open(ReplyEditorComponent, {
      width: '80vw',
      maxWidth: '1000px',
      height: '80vh',
      maxHeight: '90vh',
      panelClass: 'reply-dialog',
      data: this.refernceDetails,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.data?.message == 'Draft saved successfully') {
        this.selectedTabIndex = 1;
        this.getAllDraftReply(this.refernceDetails?.referenceId);
        this.toastr.success('Draft reply saved successfully!');
      }
    });
  }

  previewDraft(element: any) {
    const dialogRef = this.dialog.open(ViewEditorComponent, {
      width: '80vw',
      maxWidth: '1000px',
      height: '65vh',
      maxHeight: '90vh',
      panelClass: 'reply-dialog',
      data: element,
    });
  }

  getOrganizationsList() {
    this.ngxService.start();
    this.userMgmtService.getOrganizationList().subscribe({
      next: (response) => {
        this.organizationsList = response;
        this.ngxService.stop();
      },
      error: (err) => {
        this.ngxService.stop();
      },
    });
  }

  onActionTypeChange() {
    this.forwardReferenceForm.get('action')?.setValue('');
    const referenceId = this.refernceDetails?.referenceId;
    const selectedActionType =
      this.forwardReferenceForm.get('actionType')?.value;

    if (!selectedActionType) {
      this.forwardReferenceForm.get('action')?.disable();
      this.toastr.error('Invalid Action Type Selected.');
      this.actionOptions = [];
      return;
    }

    this.actionOptions = this.allowedActions.filter(
      (action) =>
        action.actionType?.toLowerCase() === selectedActionType.toLowerCase(),
    );

    if (
      selectedActionType === 'Final Draft Reply' &&
      this.actionOptions.length > 0
    ) {
      this.resetForwardReferencForm('finalDraftReply');
      // Disable all non-required fields immediately so form is valid for Final Draft Reply
      ['action', 'assigneeOrganization', 'assigneeOfficeType', 'assigneeDivision',
       'assigneeOffice', 'assigneeDesignation', 'assigneeName', 'assignerComment'].forEach(f => {
        this.forwardReferenceForm.get(f)?.disable();
      });
      this.ReferenceAction('finalReply');
      this.getAllDraftReply(referenceId);
    } else if (
      selectedActionType === 'Draft Reply' &&
      this.actionOptions.length > 0
    ) {
      this.resetForwardReferencForm('forwardForReply');
      this.forwardReferenceForm.get('action')?.enable();
      this.forwardReferenceForm.get('assigneeOrganization')?.enable();
      this.getAllDraftReply(referenceId);
    } else {
      this.resetForwardReferencForm('forwardForReply');
      this.forwardReferenceForm.get('action')?.enable();
      this.forwardReferenceForm.get('assigneeOrganization')?.enable();
    }

    this.updateButtonsVisibility();
  }
  onActionChange() {
    const actionType = this.forwardReferenceForm.get('actionType')?.value;
    const actionName = this.forwardReferenceForm.get('action')?.value;

    if (!actionType || !actionName) {
      this.toastr.error('Action type or name not selected');
      this.forwardReferenceForm.get('replyType')?.disable();
      this.forwardReferenceForm.get('assigneeOrganization')?.disable();
      this.updateButtonsVisibility();
      return;
    }

    const selectedActionConfig = this.allowedActions.find(
      (res: any) =>
        res.actionType === actionType && res.actionName === actionName,
    );
    if (selectedActionConfig) {
      this.forwardReferenceForm
        .get('actionConfigId')
        ?.setValue(selectedActionConfig.actionConfigId);
    } else {
      this.toastr.error('No matching action config found');
    }

    if (actionName == 'Forward') {
      this.resetForwardReferencForm('forward');
      this.forwardReferenceForm.get('replyType')?.enable();
      this.forwardReferenceForm.get('assigneeOrganization')?.enable();
    } else if (actionName == 'Assign Back') {
      this.resetForwardReferencForm('forward');
      this.ReferenceAction('AssignBack');
    } else {
      this.resetForwardReferencForm('forward');
      this.ReferenceAction('Discard');
    }
    this.updateButtonsVisibility();
  }

  getAllDraftReply(referenceId: number) {
    this.ngxService.start();
    this.userMgmtService.getAllDraftReply(referenceId).subscribe({
      next: (res: any) => {
        this.savedDraftReply.data = res?.data;
        this.ngxService.stop();
      },
      error: (err: any) => {
        this.toastr.error('Error in getting draft reply list');
        this.ngxService.stop();
      },
    });
  }

  selectedRecord(row: any) {
    this.selection.clear();
    this.selection.select(row);
    this.selectedDraftRecord = row;
  }

  // Step 1: Organization selected → load Office Types
  // Step 1: Organization selected → load Office Types by orgId
  selectedOrganization(event: any) {
    const orgId: number = +event.target.value;
    if (orgId) {
      this.forwardReferenceForm.get('assigneeOfficeType')?.enable();
      this.forwardReferenceForm.get('assigneeOfficeType')?.setValue('');
      this.forwardReferenceForm.get('assigneeOffice')?.setValue('');
      this.forwardReferenceForm.get('assigneeOffice')?.disable();
      this.forwardReferenceForm.get('assigneeDivision')?.setValue('');
      this.forwardReferenceForm.get('assigneeDivision')?.disable();
      this.forwardReferenceForm.get('assigneeDesignation')?.setValue('');
      this.forwardReferenceForm.get('assigneeDesignation')?.disable();
      this.forwardReferenceForm.get('assigneeName')?.setValue('');
      this.forwardReferenceForm.get('assigneeName')?.disable();
      this.officeTypeOptions = [];
      this.officeTypeList = [];
      this.divisionList = [];
      this.designationList = [];
      this.userLists = [];
      this.loadOfficeTypesByOrg(orgId);
    }
  }

  loadOfficeTypesByOrg(orgId: number) {
    this.ngxService.start();
    this.userMgmtService.getOfficeTypesByOrg(orgId).subscribe({
      next: (response: OfficeTypeList[]) => {
        this.officeTypeOptions = response;
        this.ngxService.stop();
      },
      error: () => { this.ngxService.stop(); },
    });
  }

  // Step 2: Office Type selected → load Offices by officeTypeId only
  selectedOfficeType(event: any) {
    const officeTypeId: number = +event.target.value;
    if (officeTypeId) {
      this.forwardReferenceForm.get('assigneeOffice')?.enable();
      this.forwardReferenceForm.get('assigneeOffice')?.setValue('');
      this.forwardReferenceForm.get('assigneeDivision')?.setValue('');
      this.forwardReferenceForm.get('assigneeDivision')?.disable();
      this.forwardReferenceForm.get('assigneeDesignation')?.setValue('');
      this.forwardReferenceForm.get('assigneeDesignation')?.disable();
      this.forwardReferenceForm.get('assigneeName')?.setValue('');
      this.forwardReferenceForm.get('assigneeName')?.disable();
      this.officeTypeList = [];
      this.divisionList = [];
      this.designationList = [];
      this.userLists = [];
      this.loadOfficesByType(officeTypeId);
    }
  }

  loadOfficesByType(officeTypeId: number) {
    this.ngxService.start();
    this.userMgmtService.getOfficesByOfficeType(officeTypeId).subscribe({
      next: (response: OfficeList[]) => {
        this.officeTypeList = response;
        this.ngxService.stop();
      },
      error: () => { this.ngxService.stop(); },
    });
  }

  // Step 3: Office selected → load Divisions by officeId
  selectedOffice(event: any) {
    const officeId: number = +event.target.value;
    if (officeId) {
      this.forwardReferenceForm.get('assigneeDivision')?.enable();
      this.forwardReferenceForm.get('assigneeDivision')?.setValue('');
      this.forwardReferenceForm.get('assigneeDesignation')?.setValue('');
      this.forwardReferenceForm.get('assigneeDesignation')?.disable();
      this.forwardReferenceForm.get('assigneeName')?.setValue('');
      this.forwardReferenceForm.get('assigneeName')?.disable();
      this.divisionList = [];
      this.designationList = [];
      this.userLists = [];
      this.loadDivisionsByOffice(officeId);
    }
  }

  loadDivisionsByOffice(officeId: number) {
    this.ngxService.start();
    this.userMgmtService.getDivisionsByOffice(officeId).subscribe({
      next: (response: DivisionList[]) => {
        this.divisionList = response;
        this.ngxService.stop();
      },
      error: () => { this.ngxService.stop(); },
    });
  }

  // Step 4: Division selected → load Designations by divisionId
  selectedDivision(event: any) {
    const divisionId: number = +event.target.value;
    if (divisionId) {
      this.forwardReferenceForm.get('assigneeDesignation')?.enable();
      this.forwardReferenceForm.get('assigneeDesignation')?.setValue('');
      this.forwardReferenceForm.get('assigneeName')?.setValue('');
      this.forwardReferenceForm.get('assigneeName')?.disable();
      this.designationList = [];
      this.userLists = [];
      this.loadDesignationsByDivision(divisionId);
    }
  }

  loadDesignationsByDivision(divisionId: number) {
    this.ngxService.start();
    this.userMgmtService.getDesignationsByDivision(divisionId).subscribe({
      next: (response: DesignationList[]) => {
        this.designationList = response;
        this.ngxService.stop();
      },
      error: () => { this.ngxService.stop(); },
    });
  }

  getOfficeList(selectedOrganization: string) {
    this.ngxService.start();
    this.userMgmtService.getOfficeList(selectedOrganization).subscribe({
      next: (response: OfficeList[]) => {
        const uniqueOffices = response.filter(
          (office, index, self) =>
            index === self.findIndex((o) => o.officeName === office.officeName),
        );
        this.officeTypeList = uniqueOffices;
        this.ngxService.stop();
      },
    });
  }

  getFinalReplyDesignation(officeName: string) {
    this.ngxService.start();
    this.userMgmtService.getDesignationListByOfficeName(officeName).subscribe({
      next: (response) => {
        this.designationList = response;
        this.ngxService.stop();
      },
      error: (err) => {
        this.ngxService.stop();
      },
    });
  }

  selectedDesignation(event: any) {
    const selectedDesignation = event.target.value;
    if (selectedDesignation !== null && selectedDesignation !== undefined) {
      this.forwardReferenceForm.get('assigneeName')?.enable();
      this.forwardReferenceForm.get('assignerComment')?.enable();
      this.getUserList();
    }
  }

  getHeadOfOrganizationList(orgId: number | undefined) {
    if (orgId !== undefined && orgId !== null) {
      this.ngxService.start();
      this.userMgmtService.getHeadOfOrganization(orgId).subscribe({
        next: (response: any) => {
          this.userLists = response;
          this.ngxService.stop();
        },
        error: (err) => {
          this.toastr.error('Error in getting head of organizations');
          this.ngxService.stop();
        },
      });
    }
  }

  getUserList() {
    this.ngxService.start();
    const orgId: number = +this.forwardReferenceForm.get('assigneeOrganization')?.value;
    const officeId: number = +this.forwardReferenceForm.get('assigneeOffice')?.value;
    const designationId: number = +this.forwardReferenceForm.get('assigneeDesignation')?.value;

    const userInfo = {
      organization: orgId,
      office: officeId,
      designation: designationId,
    };

    this.userMgmtService.getUserList(userInfo).subscribe({
      next: (response: any) => {
        // Filter out the currently logged-in user to prevent self-forwarding
        this.userLists = response.filter((user: UserList) => {
          if (!user) return false;
          const hasRole2 = user.roles?.some((role) => role.roleId === 2);
          if (hasRole2) {
            return true;
          }
          return user.loginId !== this.userDetails.loginId;
        });
        this.ngxService.stop();
      },
      error: (err) => {
        this.ngxService.stop();
      },
    });
  }

  selectedUserDetails(event: any) {
    this.selectedUser = [];
    const userId = event.target.value;
    // Filter returns an array, but we only need the first matching user
    this.selectedUser = this.userLists.filter(
      (res: UserList) => res.id == userId,
    );

    // if (!this.selectedUser.length) return;

    // const user = this.selectedUser[0];
    // const designationValue = this.forwardReferenceForm.get('assigneeDesignation')?.value;
    // const officeValue = this.forwardReferenceForm.get('assigneeOffice')?.value;
    // const isEmpty = (val: any) => val === null || val === undefined || val === '';
    // const shouldAutoFill = isEmpty(designationValue) || isEmpty(officeValue);

    // if (shouldAutoFill) {
    //   const officeObj = this.officeTypeList.find(
    //     (o: any) => o.officeId === user.office
    //   );

    //   const designationObj = this.designationList.find(
    //     (d: any) => d.designationId === user.designation
    //   );

    //   this.forwardReferenceForm.patchValue({
    //     assigneeOffice: officeObj ? officeObj.officeName : '',
    //     assigneeDesignation: designationObj ? designationObj.designationCode : ''
    //   });
    // } else {
    //   this.forwardReferenceForm.patchValue({
    //     assigneeOffice: user.office,
    //     assigneeDesignation: user.designation
    //   });
    // }
  }

  updateVipReferenceDetails() {
    this.ngxService.start();

    // Resolve category ID to name for backend
    const categoryId = this.addVipReferenceDetails.get('catgOfSubject')?.value;
    const matchedCategory = this.categoryList.find(
      (cat: any) => cat.categoryId.toString() === categoryId?.toString(),
    );
    const categoryName = matchedCategory
      ? matchedCategory.categoryDescription || matchedCategory.categoryName
      : categoryId;

    // Resolve sub-category ID to name for backend
    const subCategoryId =
      this.addVipReferenceDetails.get('subCatgOfSubject')?.value;
    const matchedSubCategory = this.subCategoryList.find(
      (subCat: any) => subCat.subCatId.toString() === subCategoryId?.toString(),
    );
    const subCategoryName = matchedSubCategory
      ? matchedSubCategory.subCatName || matchedSubCategory.subCategoryName
      : subCategoryId;

    const updatedData = {
      nameOfDignitary:
        this.addVipReferenceDetails.get('nameOfDiginitary')?.value,
      emailId: this.addVipReferenceDetails.get('emailId')?.value,
      designation: this.addVipReferenceDetails.get('designation')?.value,
      state: this.addVipReferenceDetails.get('state')?.value,
      constituency: this.addVipReferenceDetails.get('constituency')?.value,
      priority: this.addVipReferenceDetails.get('priority')?.value,
      categoryOfSubject: categoryName,
      subCategoryOfSubject: subCategoryName,
      subject: this.addVipReferenceDetails.get('subjectOrIssue')?.value,
      vipReferenceId: this.refernceDetails.referenceId,
      updatedBy: this.userDetails.name,
      updatedAt: this.formatDateToIso(this.createdDate),
    };

    this.userMgmtService.updateReference(updatedData).subscribe({
      next: (res) => {
        this.toastr.success('Reference updated successfully');
        // Update local reference details with the new values
        this.refernceDetails.categoryOfSubject = categoryName;
        this.refernceDetails.subCategoryOfSubject = subCategoryName;
        this.refernceDetails.nameOfDignitary =
          this.addVipReferenceDetails.get('nameOfDiginitary')?.value;
        this.refernceDetails.subject =
          this.addVipReferenceDetails.get('subjectOrIssue')?.value;
        this.refernceDetails.priority =
          this.addVipReferenceDetails.get('priority')?.value;
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('please enter valid details');
        this.ngxService.stop();
      },
    });
  }

  forwardVipReference() {
    this.ngxService.start();
    const priorityControl = this.addVipReferenceDetails.get('priority');

    if (!priorityControl || !priorityControl.value) {
      this.ngxService.stop();
      this.toastr.warning(
        'Please update the Reference Priority before submitting.',
      );
      priorityControl?.markAsTouched();
      return;
    }

    if (this.forwardReferenceForm.invalid) {
      this.forwardReferenceForm.markAllAsTouched();
      // Collect invalid fields
      const invalidFields: string[] = [];
      Object.keys(this.forwardReferenceForm.controls).forEach((key) => {
        const control = this.forwardReferenceForm.get(key);
        if (control && control.invalid) {
          invalidFields.push(key); // or map to friendly field names if needed
        }
      });

      this.ngxService.stop();

      const errorMessage = `Please enter valid details in: ${invalidFields.join(', ')}`;
      this.toastr.error(errorMessage);

      return;
    }

    const forwardReferenceDetails = this.forwardReferenceForm.getRawValue();
    const forwardReferenceData = {
      referenceId: this.refernceDetails.referenceId,
      loginId: this.userDetails.loginId,
      actionConfigId: forwardReferenceDetails.actionConfigId,
      targetLoginId: this.selectedUser[0].loginId,
      assigneeOrganization: forwardReferenceDetails.assigneeOrganization,
      assigneeOffice: forwardReferenceDetails.assigneeOffice,
      assigneeDesignation: forwardReferenceDetails.assigneeDesignation,
      assigneeName: forwardReferenceDetails.assigneeName,
      comments: forwardReferenceDetails.assignerComment,
    };

    this.userMgmtService.forwardReference(forwardReferenceData).subscribe({
      next: (res) => {
        this.router.navigate([this.previousRoute]);
        this.toastr.success('Reference updated successfully');
        this.getReferenceDetails();
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('please enter valid details');
        this.ngxService.stop();
      },
    });
    // if (this.forwardReferenceForm.get("actionType")?.value == "final_draft_reply") {
    //   const forwardReferenceDetails = this.forwardReferenceForm.getRawValue();
    //   const forwardReferenceData = {
    //     "fromLogin": this.userDetails.loginId,
    //     "toLogin": this.selectedUser[0].loginId,
    //     "vipReferenceId": this.refernceDetails.referenceId,
    //     "fromRoleId": this.userDetails?.roles[0]?.roleId,
    //     "toRoleId": 4,
    //     "assignedAt": this.formatDateToIso(this.createdDate),
    //     "routingType": forwardReferenceDetails.routingType,
    //     "actionType": forwardReferenceDetails.actionType,
    //     "action": forwardReferenceDetails.action,
    //     "replyType": forwardReferenceDetails.replyType,
    //     "assigneeOrganization": forwardReferenceDetails.assigneeOrganization,
    //     "assigneeOffice": forwardReferenceDetails.assigneeOffice,
    //     "assigneeDesignation": forwardReferenceDetails.assigneeDesignation,
    //     "assigneeName": forwardReferenceDetails.assigneeName,
    //     "assignerComment": forwardReferenceDetails.assignerComment
    //   }
    //   this.userMgmtService.forwardReference(forwardReferenceData).subscribe({
    //     next: (res) => {
    //       this.toastr.success("Reference updated successfully");
    //       this.getReferenceDetails();
    //       this.ngxService.stop();
    //     },
    //     error: (err) => {
    //       this.toastr.error("please enter valid details");
    //       this.ngxService.stop();
    //     }
    //   })

    // }
    // else if (this.forwardReferenceForm.get("actionType")?.value == "draft_reply") {
    //   const forwardReferenceData = {
    //     "fromLogin": this.userDetails.loginId,
    //     "toLogin": this.selectedUser[0].loginId,
    //     "vipReferenceId": this.refernceDetails.referenceId,
    //     "fromRoleId": this.userDetails?.roles[0]?.roleId,
    //     "toRoleId": 3,
    //     "assignedAt": this.formatDateToIso(this.createdDate),
    //     "routingType": this.forwardReferenceForm.get("routingType")?.value,
    //     "actionType": this.forwardReferenceForm.get("actionType")?.value,
    //     "action": this.forwardReferenceForm.get("action")?.value,
    //     "replyType": this.forwardReferenceForm.get("replyType")?.value,
    //     "assigneeOrganization": this.forwardReferenceForm.get("assigneeOrganization")?.value,
    //     "assigneeOffice": this.forwardReferenceForm.get("assigneeOffice")?.value,
    //     "assigneeDesignation": this.forwardReferenceForm.get("assigneeDesignation")?.value,
    //     "assigneeName": this.forwardReferenceForm.get("assigneeName")?.value,
    //     "assignerComment": this.forwardReferenceForm.get("assignerComment")?.value
    //   }

    // }
    //   else {
    // const forwardReferenceData = {
    //   "fromLogin": this.userDetails.loginId,
    //   "toLogin": this.selectedUser[0].loginId,
    //   "vipReferenceId": this.refernceDetails.referenceId,
    //   "fromRoleId": this.userDetails?.roles[0]?.roleId,
    //   "toRoleId": this.selectedUser[0].roles[0].roleId,
    //   "assignedAt": this.formatDateToIso(this.createdDate),
    //   "routingType": this.forwardReferenceForm.get("routingType")?.value,
    //   "actionType": this.forwardReferenceForm.get("actionType")?.value,
    //   "action": this.forwardReferenceForm.get("action")?.value,
    //   "replyType": this.forwardReferenceForm.get("replyType")?.value,
    //   "assigneeOrganization": this.forwardReferenceForm.get("assigneeOrganization")?.value,
    //   "assigneeOffice": this.forwardReferenceForm.get("assigneeOffice")?.value,
    //   "assigneeDesignation": this.forwardReferenceForm.get("assigneeDesignation")?.value,
    //   "assigneeName": this.forwardReferenceForm.get("assigneeName")?.value,
    //   "assignerComment": this.forwardReferenceForm.get("assignerComment")?.value
    // }
    // }
  }

  discardVipReference() {
    this.ngxService.start();
    if (this.forwardReferenceForm.invalid) {
      this.forwardReferenceForm.markAllAsTouched();
      // Collect invalid fields
      const invalidFields: string[] = [];
      Object.keys(this.forwardReferenceForm.controls).forEach((key) => {
        const control = this.forwardReferenceForm.get(key);
        if (control && control.invalid) {
          invalidFields.push(key); // or map to friendly field names if needed
        }
      });

      this.ngxService.stop();

      const errorMessage = `Please enter valid details in: ${invalidFields.join(', ')}`;
      this.toastr.error(errorMessage);

      return;
    }
    const forwardReferenceDetails = this.forwardReferenceForm.getRawValue();
    const forwardReferenceData = {
      referenceId: this.refernceDetails.referenceId,
      loginId: this.userDetails.loginId,
      actionConfigId: forwardReferenceDetails.actionConfigId,
      targetLoginId: 'GauravPrasad',
      assigneeOrganization: forwardReferenceDetails.assigneeOrganization,
      assigneeOffice: forwardReferenceDetails.assigneeOffice,
      assigneeDesignation: forwardReferenceDetails.assigneeDesignation,
      assigneeName: forwardReferenceDetails.assigneeName,
      comments: forwardReferenceDetails.assignerComment,
    };

    this.userMgmtService.forwardReference(forwardReferenceData).subscribe({
      next: (res) => {
        this.router.navigate([this.previousRoute]);
        this.toastr.success('Reference updated successfully');
        this.getReferenceDetails();
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('please enter valid details');
        this.ngxService.stop();
      },
    });
  }

  assignBack() {
    this.ngxService.start();
    if (this.forwardReferenceForm.invalid) {
      this.forwardReferenceForm.markAllAsTouched();
      // Collect invalid fields
      const invalidFields: string[] = [];
      Object.keys(this.forwardReferenceForm.controls).forEach((key) => {
        const control = this.forwardReferenceForm.get(key);
        if (control && control.invalid) {
          invalidFields.push(key); // or map to friendly field names if needed
        }
      });

      this.ngxService.stop();

      const errorMessage = `Please enter valid details in: ${invalidFields.join(', ')}`;
      this.toastr.error(errorMessage);

      return;
    }
    const forwardReferenceDetails = this.forwardReferenceForm.getRawValue();
    const forwardReferenceData = {
      referenceId: this.refernceDetails.referenceId,
      loginId: this.userDetails.loginId,
      actionConfigId: forwardReferenceDetails.actionConfigId,
      targetLoginId: 'GauravPrasad',
      assigneeOrganization: forwardReferenceDetails.assigneeOrganization,
      assigneeOffice: forwardReferenceDetails.assigneeOffice,
      assigneeDesignation: forwardReferenceDetails.assigneeDesignation,
      assigneeName: forwardReferenceDetails.assigneeName,
      comments: forwardReferenceDetails.assignerComment,
    };

    this.userMgmtService.forwardReference(forwardReferenceData).subscribe({
      next: (res) => {
        this.router.navigate([this.previousRoute]);
        this.toastr.success('Reference Assign Back successfully');
        this.getReferenceDetails();
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('please enter valid details');
        this.ngxService.stop();
      },
    });
  }

  senDraftReply() {
    this.ngxService.start();
    if (this.forwardReferenceForm.invalid) {
      this.forwardReferenceForm.markAllAsTouched();
      // Collect invalid fields
      const invalidFields: string[] = [];
      Object.keys(this.forwardReferenceForm.controls).forEach((key) => {
        const control = this.forwardReferenceForm.get(key);
        if (control && control.invalid) {
          invalidFields.push(key); // or map to friendly field names if needed
        }
      });

      this.ngxService.stop();

      const errorMessage = `Please enter valid details in: ${invalidFields.join(', ')}`;
      this.toastr.error(errorMessage);

      return;
    }

    const draftReplyId = this.selectedDraftRecord?.draftReplyId;
    const forwardReferenceDetails = this.forwardReferenceForm.getRawValue();
    const forwardReferenceData = {
      referenceId: this.refernceDetails.referenceId,
      loginId: this.userDetails.loginId,
      actionConfigId: forwardReferenceDetails.actionConfigId,
      targetLoginId: this.selectedUser[0].loginId,
      assigneeOrganization: forwardReferenceDetails.assigneeOrganization,
      assigneeOffice: forwardReferenceDetails.assigneeOffice,
      assigneeDesignation: forwardReferenceDetails.assigneeDesignation,
      assigneeName: forwardReferenceDetails.assigneeName,
      comments: forwardReferenceDetails.assignerComment,
    };

    forkJoin({
      forward: this.userMgmtService.forwardReference(forwardReferenceData),
      update: this.userMgmtService.uploadDraftReply(draftReplyId),
    }).subscribe({
      next: (res) => {
        this.router.navigate([this.previousRoute]);
        this.toastr.success('Draft Reply Sent Successfully');
        this.getReferenceDetails();
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('Something went wrong');
        this.ngxService.stop();
      },
    });
  }

  finalReplyQueue() {
    if (this.forwardReferenceForm.invalid) {
      this.forwardReferenceForm.markAllAsTouched();
      // Collect invalid fields
      const invalidFields: string[] = [];
      Object.keys(this.forwardReferenceForm.controls).forEach((key) => {
        const control = this.forwardReferenceForm.get(key);
        if (control && control.invalid) {
          invalidFields.push(key); // or map to friendly field names if needed
        }
      });

      this.ngxService.stop();

      const errorMessage = `Please enter valid details in: ${invalidFields.join(', ')}`;
      this.toastr.error(errorMessage);

      return;
    }

    const forwardReferenceDetails = this.forwardReferenceForm.getRawValue();
    const forwardReferenceData = {
      referenceId: this.refernceDetails.referenceId,
      loginId: this.userDetails.loginId,
      actionConfigId: forwardReferenceDetails.actionConfigId,
      targetLoginId: 'GauravPrasad',
      assigneeOrganization: forwardReferenceDetails.assigneeOrganization,
      assigneeOffice: forwardReferenceDetails.assigneeOffice,
      assigneeDesignation: forwardReferenceDetails.assigneeDesignation,
      assigneeName: forwardReferenceDetails.assigneeName,
      comments: forwardReferenceDetails.assignerComment,
    };

    this.userMgmtService.forwardReference(forwardReferenceData).subscribe({
      next: (res) => {
        this.router.navigate([this.previousRoute]);
        this.toastr.success('Reference Move To Final Reply Queue successfully');
        this.getReferenceDetails();
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('please enter valid details');
        this.ngxService.stop();
      },
    });
  }

  closeReference() {
    this.ngxService.start();
    if (this.forwardReferenceForm.invalid) {
      this.forwardReferenceForm.markAllAsTouched();
      // Collect invalid fields
      const invalidFields: string[] = [];
      Object.keys(this.forwardReferenceForm.controls).forEach((key) => {
        const control = this.forwardReferenceForm.get(key);
        if (control && control.invalid) {
          invalidFields.push(key); // or map to friendly field names if needed
        }
      });

      this.ngxService.stop();

      const errorMessage = `Please enter valid details in: ${invalidFields.join(', ')}`;
      this.toastr.error(errorMessage);

      return;
    }
    const forwardReferenceDetails = this.forwardReferenceForm.getRawValue();
    const forwardReferenceData = {
      referenceId: this.refernceDetails.referenceId,
      loginId: this.userDetails.loginId,
      actionConfigId: forwardReferenceDetails.actionConfigId,
      targetLoginId: 'GauravPrasad',
      assigneeOrganization: forwardReferenceDetails.assigneeOrganization,
      assigneeOffice: forwardReferenceDetails.assigneeOffice,
      assigneeDesignation: forwardReferenceDetails.assigneeDesignation,
      assigneeName: forwardReferenceDetails.assigneeName,
      comments: forwardReferenceDetails.assignerComment,
    };

    this.userMgmtService.forwardReference(forwardReferenceData).subscribe({
      next: (res) => {
        this.router.navigate([this.previousRoute]);
        this.toastr.success('Reference Closed successfully');
        this.getReferenceDetails();
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('please enter valid details');
        this.ngxService.stop();
      },
    });
  }

  getFinalAssigneeList() {
    this.userMgmtService.getFinalAssigneeList().subscribe({
      next: (res) => {
        this.userLists = res;
        this.setFinalAssigneeDetails();
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('please enter valid details');
        this.ngxService.stop();
      },
    });
  }

  setFinalAssigneeDetails() {
    (this.forwardReferenceForm.get('action')?.setValue('forward'),
      this.forwardReferenceForm
        .get('assigneeOrganization')
        ?.setValue(this.userLists[0].organization, { emitEvent: true }));
    // this.getOfficeList();
    // this.getDesignationList();

    setTimeout(() => {
      this.forwardReferenceForm
        .get('assigneeOffice')
        ?.setValue(this.userLists[0].office);
      this.forwardReferenceForm
        .get('assigneeDesignation')
        ?.setValue(this.userLists[0].designation);
    }, 100);
  }

  private ReferenceAction(actionName: string) {
    if (actionName == 'finalReply') {
      this.getOfficeList('MORTH');
      this.adminService.getUserListByRoleId('2').subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            const user = res[0];
            const officeForDesignation = this.officeTypeList.find(
              (o: any) => o.officeId === user.office,
            );
            this.getFinalReplyDesignation(
              officeForDesignation ? officeForDesignation.officeName : '',
            );
            // Wait for all lists to load
            setTimeout(() => {
              const organizationObj = this.organizationsList.find(
                (o: any) => o.organizationId === user.organization,
              );
              const designationObj = this.designationList.find(
                (d: any) => d.designationId === user.designation,
              );
              const officeObj = this.officeTypeList.find(
                (o: any) => o.officeId === user.office,
              );
              // ✅ Patch only after lists are available
              this.forwardReferenceForm.patchValue({
                action: 'Forward',
                assigneeOrganization: organizationObj
                  ? organizationObj.organizationCode
                  : '',
                assigneeOffice: officeObj ? officeObj.officeName : '',
                assigneeDesignation: designationObj
                  ? designationObj.designationCode
                  : '',
              });

              // Now load user dropdown and enable comment field
              this.getUserList();
              // const assigneeObj = this.userLists.find(
              //   (o: any) => o.id === user.id
              // );

              const selectedActionConfig = this.allowedActions.find(
                (res: any) =>
                  res.actionType ===
                    this.forwardReferenceForm.get('actionType')?.value &&
                  res.actionName ===
                    this.forwardReferenceForm.get('action')?.value,
              );
              if (selectedActionConfig) {
                this.forwardReferenceForm
                  .get('actionConfigId')
                  ?.setValue(selectedActionConfig.actionConfigId);
              } else {
                this.toastr.error('No matching action config found');
              }
              this.forwardReferenceForm.patchValue({ assigneeName: 65 });
              this.disableReferenceForwardControl(actionName);
              this.forwardReferenceForm.get('assignerComment')?.enable();
              this.forwardReferenceForm.get('replyType')?.enable();
              // Optionally disable other form controls
            }, 300);
          }
        },
        error: (err: Error) => {},
      });
    } else if (actionName == 'Discard') {
      this.getOfficeList('MORTH');
      this.adminService.getUserListByRoleId('2').subscribe({
        next: async (res: any) => {
          if (res && res.length > 0) {
            const user = res[0];
            const officeForDesignation = this.officeTypeList.find(
              (o: any) => o.officeId === user.office,
            );
            await this.getFinalReplyDesignation(
              officeForDesignation ? officeForDesignation.officeName : '',
            );
            // Wait for all lists to load
            setTimeout(async () => {
              const organizationObj = this.organizationsList.find(
                (o: any) => o.organizationId === user.organization,
              );
              const officeObj = this.officeTypeList.find(
                (o: any) => o.officeId === user.office,
              );
              const designationObj = this.designationList.find(
                (d: any) => d.designationId === user.designation,
              );

              // ✅ Patch only after lists are available

              this.forwardReferenceForm.patchValue({
                assigneeOrganization: organizationObj
                  ? organizationObj.organizationCode
                  : '',
                assigneeOffice: officeObj ? officeObj.officeName : '',
                assigneeDesignation: designationObj
                  ? designationObj.designationCode
                  : '',
              });

              // Now load user dropdown and enable comment field
              await this.getUserList();
              // const assigneeObj = this.userLists.find(
              //   (o: any) => o.id === user.id
              // );
              // this.selectedUser = this.userLists.filter((res: UserList) => res.id == 695);
              this.forwardReferenceForm.patchValue({ assigneeName: 6158 });

              // Optionally disable other form controls
              this.disableReferenceForwardControl(actionName);
              this.forwardReferenceForm.get('assignerComment')?.enable();
            }, 300); // Give small delay for lists to be populated
          }
        },
        error: (err: Error) => {},
      });
    } else if (actionName == 'AssignBack') {
      this.getOfficeList('MORTH');
      this.adminService.getUserListByRoleId('2').subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            const user = res[0];
            const officeForDesignation = this.officeTypeList.find(
              (o: any) => o.officeId === user.office,
            );
            this.getFinalReplyDesignation(
              officeForDesignation ? officeForDesignation.officeName : '',
            );
            // Wait for all lists to load
            setTimeout(() => {
              const organizationObj = this.organizationsList.find(
                (o: any) => o.organizationId === user.organization,
              );
              const designationObj = this.designationList.find(
                (d: any) => d.designationId === user.designation,
              );
              const officeObj = this.officeTypeList.find(
                (o: any) => o.officeId === user.office,
              );
              // ✅ Patch only after lists are available
              this.forwardReferenceForm.patchValue({
                assigneeOrganization: organizationObj
                  ? organizationObj.organizationCode
                  : '',
                assigneeOffice: officeObj ? officeObj.officeName : '',
                assigneeDesignation: designationObj
                  ? designationObj.designationCode
                  : '',
              });

              // Now load user dropdown and enable comment field
              this.getUserList();
              // const assigneeObj = this.userLists.find(
              //   (o: any) => o.id === user.id
              // );

              this.forwardReferenceForm.patchValue({ assigneeName: 65 });
              this.disableReferenceForwardControl(actionName);
              this.forwardReferenceForm.get('assignerComment')?.enable();
              // Optionally disable other form controls
            }, 300);
          }
        },
        error: (err: Error) => {},
      });
    } else {
    }
  }

  disableReferenceForwardControl(actionName: string) {
    if (actionName == 'finalReply') {
      const fieldsToDisable = [
        'action',
        'assigneeOrganization',
        'assigneeOffice',
        'assigneeDesignation',
        'assigneeName',
        'assignerComment',
      ];
      fieldsToDisable.forEach((field) => {
        this.forwardReferenceForm.get(field)?.disable();
      });
    } else if (actionName == 'Discard') {
      const fieldsToDisable = [
        'replyType',
        'assigneeOrganization',
        'assigneeOffice',
        'assigneeDesignation',
        'assigneeName',
      ];
      fieldsToDisable.forEach((field) => {
        this.forwardReferenceForm.get(field)?.disable();
      });
    } else if (actionName == 'AssignBack') {
      const fieldsToDisable = [
        'action',
        'replyType',
        'assigneeOrganization',
        'assigneeOffice',
        'assigneeDesignation',
        'assigneeName',
        'assignerComment',
      ];
      fieldsToDisable.forEach((field) => {
        this.forwardReferenceForm.get(field)?.disable();
      });
    } else {
    }
  }

  resetForwardReferencForm(actionName: string) {
    const cascadeFields = [
      'assigneeOfficeType',
      'assigneeOffice',
      'assigneeDivision',
      'assigneeDesignation',
      'assigneeName',
    ];
    // Reset cascade lists
    this.officeTypeOptions = [];
    this.officeTypeList = [];
    this.divisionList = [];
    this.designationList = [];
    this.userLists = [];

    if (actionName == 'forwardForReply') {
      const fieldsToResetAndDisable = [
        'action',
        'replyType',
        'assigneeOrganization',
        ...cascadeFields,
        'assignerComment',
      ];

      fieldsToResetAndDisable.forEach((field) => {
        const control = this.forwardReferenceForm.get(field);
        if (control) {
          control.reset('');
        }
      });
    } else if (actionName == 'forward') {
      const fieldsToResetAndDisable = [
        'replyType',
        'assigneeOrganization',
        ...cascadeFields,
        'assignerComment',
      ];

      fieldsToResetAndDisable.forEach((field) => {
        const control = this.forwardReferenceForm.get(field);
        if (control) {
          control.reset('');
        }
      });
    } else if (actionName == 'finalDraftReply') {
      const fieldsToResetAndDisable = [
        'action',
        'assigneeOrganization',
        ...cascadeFields,
        'assignerComment',
      ];

      fieldsToResetAndDisable.forEach((field) => {
        const control = this.forwardReferenceForm.get(field);
        if (control) {
          control.reset('');
        }
      });
    }
  }

  updateButtonsVisibility() {
    const actionType = this.forwardReferenceForm.get('actionType')?.value;
    const actionName = this.forwardReferenceForm.get('action')?.value;
    this.showForwardBtn = false;
    this.showDiscardBtn = false;
    this.showFinalReplyBtn = false;
    this.showAssignBack = false;
    this.showDraftReply = false;
    this.showCloseReference = false;

    // Case: Final Draft Reply → only final reply button
    if (actionType === 'Final Draft Reply') {
      this.showFinalReplyBtn = true;
      return;
    }

    if (actionType === 'Forward For Reply') {
      if (actionName === 'Forward') {
        this.showForwardBtn = true;
      }
      if (actionName === 'Discard') {
        this.showDiscardBtn = true;
      }
      if (actionName === 'Assign Back') {
        this.showAssignBack = true;
      }
    }
    if (actionType === 'Draft Reply') {
      this.showDraftReply = true;
    }
    if (actionType === 'Close Reference') {
      this.showCloseReference = true;
    }
  }

  // Your PDF list
  onSelectChange(event: any) {}

  // Dropdown handler

  showVersionHistory() {
    alert('amhindra bhagat');
  }

  // Custom validator to check if date is not in the future
  noFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Don't validate empty values
    }

    const selectedDate = new Date(control.value);
    const today = new Date();

    // Set time to start of day for both dates to compare only dates
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return { futureDate: true };
    }

    return null;
  }

  // ========== Linked References Methods ==========

  initiateLinkedReferencesSearchForm() {
    this.linkedReferencesSearchForm = new FormGroup({
      dateOfLetterFrom: new FormControl(''),
      dateOfLetterTo: new FormControl(''),
      dateOfReceivingFrom: new FormControl(''),
      dateOfReceivingTo: new FormControl(''),
      nameOfDignitary: new FormControl(''),
      designation: new FormControl(''),
      state: new FormControl(''),
      constituency: new FormControl(''),
      categoryOfSubject: new FormControl(''),
      subject: new FormControl(''),
    });
  }

  searchReferencesToLink() {
    const criteria = this.linkedReferencesSearchForm.getRawValue();

    // Check if at least one criterion is filled
    const hasAnyCriteria = Object.values(criteria).some(
      (value) => value && value.toString().trim() !== '',
    );

    if (!hasAnyCriteria) {
      this.toastr.warning('Please fill at least one search criterion');
      return;
    }

    this.ngxService.start();
    this.userMgmtService.searchReferencesForLinking(criteria).subscribe({
      next: (results) => {
        // Filter out current reference and already linked references
        const linkedRefIds = this.linkedReferencesData.data.map(
          (ref: any) => ref.referenceId,
        );
        const filtered = results.filter(
          (ref: any) =>
            ref.referenceId !== this.refernceDetails.referenceId &&
            !linkedRefIds.includes(ref.referenceId),
        );
        this.searchResultsData.data = filtered;
        this.toastr.success(`Found ${filtered.length} reference(s)`);
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('Failed to search references');
        console.error(err);
        this.ngxService.stop();
      },
    });
  }

  linkSelectedReferences() {
    const selectedRefs = this.searchResultsSelection.selected;

    if (selectedRefs.length === 0) {
      this.toastr.warning('Please select at least one reference to link');
      return;
    }

    if (!this.refernceDetails.referenceId) {
      this.toastr.error('Current reference ID not found');
      return;
    }

    this.ngxService.start();

    // Link each selected reference
    const linkRequests = selectedRefs.map((ref) => {
      return this.userMgmtService
        .linkReferences({
          primaryReferenceId: this.refernceDetails.referenceId,
          linkedReferenceId: ref.referenceId,
          linkType: 'RELATED',
        })
        .toPromise();
    });

    Promise.all(linkRequests)
      .then(() => {
        this.toastr.success(
          `Successfully linked ${selectedRefs.length} reference(s)`,
        );
        this.searchResultsSelection.clear();
        this.loadLinkedReferences();
        // Remove linked items from search results
        const linkedIds = selectedRefs.map((ref) => ref.referenceId);
        this.searchResultsData.data = this.searchResultsData.data.filter(
          (ref: any) => !linkedIds.includes(ref.referenceId),
        );
        this.ngxService.stop();
      })
      .catch((err) => {
        this.toastr.error('Failed to link some references');
        console.error(err);
        this.ngxService.stop();
      });
  }

  loadLinkedReferences() {
    if (!this.refernceDetails.referenceId) return;

    this.userMgmtService
      .getLinkedReferences(this.refernceDetails.referenceId)
      .subscribe({
        next: (linked) => {
          this.linkedReferencesData.data = linked;
        },
        error: (err) => {
          console.error('Failed to load linked references', err);
        },
      });
  }

  delinkSelectedReferences() {
    const selectedRefs = this.linkedReferencesSelection.selected;

    if (selectedRefs.length === 0) {
      this.toastr.warning('Please select at least one reference to delink');
      return;
    }

    this.ngxService.start();

    // Delink each selected reference
    const delinkRequests = selectedRefs.map((ref) => {
      return this.userMgmtService.delinkReferences(ref.linkId).toPromise();
    });

    Promise.all(delinkRequests)
      .then(() => {
        this.toastr.success(
          `Successfully delinked ${selectedRefs.length} reference(s)`,
        );
        this.linkedReferencesSelection.clear();
        this.loadLinkedReferences();
        this.ngxService.stop();
      })
      .catch((err) => {
        this.toastr.error('Failed to delink some references');
        console.error(err);
        this.ngxService.stop();
      });
  }

  openSelectedReferences() {
    const selected = this.searchResultsSelection.selected;

    if (selected.length === 0) {
      this.toastr.warning('Please select at least one reference to open');
      return;
    }

    // Open each reference in a new tab
    selected.forEach((ref) => {
      const url =
        window.location.origin + `/dashboard/add-reference/${ref.referenceNo}`;
      window.open(url, '_blank');
    });
  }

  submitLinkedReferences() {
    // This would save any pending changes
    this.toastr.success('Linked references updated successfully');
  }

  // Knowledge Base Methods
  initiateKnowledgeBaseForm() {
    this.knowledgeBaseForm = new FormGroup({
      nameOfDignitary: new FormControl('', Validators.required),
      designation: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      constituency: new FormControl(''),
      categoryOfSubject: new FormControl('', Validators.required),
      subjectIssue: new FormControl(''),
    });
  }

  searchKnowledgeBase() {
    if (!this.knowledgeBaseForm.valid) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    const searchCriteria = this.knowledgeBaseForm.getRawValue();
    this.ngxService.start();
    this.knowledgeBaseSearched = true;

    this.userMgmtService.searchKnowledgeBase(searchCriteria).subscribe({
      next: (results) => {
        this.knowledgeBaseResults = results;
        this.knowledgeBaseDataSource.data = results;
        this.toastr.success(`Found ${results.length} reference(s)`);
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error('Failed to search knowledge base');
        console.error(err);
        this.knowledgeBaseResults = [];
        this.knowledgeBaseDataSource.data = [];
        this.ngxService.stop();
      },
    });
  }

  toggleKBReference(reference: VipReference) {
    const index = this.selectedKBReferences.findIndex(
      (ref) => ref.referenceNo === reference.referenceNo,
    );
    if (index > -1) {
      this.selectedKBReferences.splice(index, 1);
    } else {
      this.selectedKBReferences.push(reference);
    }
  }

  isKBReferenceSelected(reference: VipReference): boolean {
    return this.selectedKBReferences.some(
      (ref) => ref.referenceNo === reference.referenceNo,
    );
  }

  toggleAllKBReferences(event: any) {
    if (event.checked) {
      this.selectedKBReferences = [...this.knowledgeBaseResults];
    } else {
      this.selectedKBReferences = [];
    }
  }

  isAllKBSelected(): boolean {
    return (
      this.knowledgeBaseResults.length > 0 &&
      this.selectedKBReferences.length === this.knowledgeBaseResults.length
    );
  }

  isSomeKBSelected(): boolean {
    return (
      this.selectedKBReferences.length > 0 &&
      this.selectedKBReferences.length < this.knowledgeBaseResults.length
    );
  }

  openSelectedKBReferences() {
    if (this.selectedKBReferences.length === 0) {
      this.toastr.warning('Please select at least one reference to open');
      return;
    }

    // Open each reference in a new tab
    this.selectedKBReferences.forEach((ref) => {
      const url =
        window.location.origin + `/dashboard/add-reference/${ref.referenceNo}`;
      window.open(url, '_blank');
    });

    this.toastr.success(
      `Opening ${this.selectedKBReferences.length} reference(s) in new tabs`,
    );
  }

  clearSearchResults() {
    this.searchResultsData.data = [];
    this.searchResultsSelection.clear();
    this.linkedReferencesSearchForm.reset();
  }

  // Toggle all search results selection
  toggleAllSearchResults() {
    if (this.isAllSearchResultsSelected()) {
      this.searchResultsSelection.clear();
    } else {
      this.searchResultsData.data.forEach((row) =>
        this.searchResultsSelection.select(row),
      );
    }
  }

  // Check if all search results are selected
  isAllSearchResultsSelected() {
    const numSelected = this.searchResultsSelection.selected.length;
    const numRows = this.searchResultsData.data.length;
    return numSelected === numRows && numRows > 0;
  }

  // Toggle all linked references selection
  toggleAllLinkedReferences() {
    if (this.isAllLinkedReferencesSelected()) {
      this.linkedReferencesSelection.clear();
    } else {
      this.linkedReferencesData.data.forEach((row) =>
        this.linkedReferencesSelection.select(row),
      );
    }
  }

  // Check if all linked references are selected
  isAllLinkedReferencesSelected() {
    const numSelected = this.linkedReferencesSelection.selected.length;
    const numRows = this.linkedReferencesData.data.length;
    return numSelected === numRows && numRows > 0;
  }

  /**
   * Remove timestamp prefix from filename for display
   * Example: "1765340372547_Draft_Reply_v1.pdf" -> "Draft_Reply_v1.pdf"
   */
  cleanFilename(filename: string): string {
    if (!filename) {
      return filename;
    }
    // Remove timestamp prefix pattern: digits_
    return filename.replace(/^\d+_/, '');
  }
}
