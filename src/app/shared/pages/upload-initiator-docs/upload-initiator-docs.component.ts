import { Component, inject, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VipReferenceDetailsResponse } from '../../interface/reference-details-response.model';
import { UsermgmtService } from '../../service/usermgmt.service';
import { User } from '../../interface/user.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload-initiator-docs',
  standalone: false,
  templateUrl: './upload-initiator-docs.component.html',
  styleUrl: './upload-initiator-docs.component.css'
})
export class UploadInitiatorDocsComponent {
  uploadReferenceDocs!: FormGroup;
  selectedFile!: File;
  isConfirm: boolean = false;
  refernceDetails: VipReferenceDetailsResponse = {} as VipReferenceDetailsResponse;
  private userMgmtService = inject(UsermgmtService);
  userDetails!: User;
  private ngxService = inject(NgxUiLoaderService);
  private toastr = inject(ToastrService);
  documentTypes: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: VipReferenceDetailsResponse, private dialogRef: MatDialogRef<UploadInitiatorDocsComponent>) {
    this.initiateUploadForm();
  }

  ngOnInit() {
    this.getUserDetails();
    this.refernceDetails = this.data;
    this.loadDocumentTypes();
  }

  loadDocumentTypes() {
    // Initiator role should only see "Letter" document type
    if (this.userDetails?.roles?.[0]?.roleName === 'Initiator') {
      this.documentTypes = [{ typeName: 'Letter' }];
      return;
    }
    this.userMgmtService.getActiveDocumentTypes().subscribe({
      next: (response: any) => {
        this.documentTypes = response;
      },
      error: (err) => {
        console.error('Error loading document types:', err);
        this.toastr.error('Failed to load document types');
      }
    });
  }
  getUserDetails() {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      this.userDetails = JSON.parse(userData);
    }
  }
  initiateUploadForm() {
    this.uploadReferenceDocs = new FormGroup({
      file: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      comments: new FormControl('')
    })
  }


  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate type
      if (file.type !== 'application/pdf') {
        this.uploadReferenceDocs.get('file')?.setErrors({ invalidType: true });
        return;
      }

      // Validate size (max 5MB to match DMS limit)
      if (file.size > 5 * 1024 * 1024) {
        this.uploadReferenceDocs.get('file')?.setErrors({ maxSizeExceeded: true });
        return;
      }

      this.uploadReferenceDocs.get('file')?.setErrors(null);
      this.selectedFile = file;
    }
  }

  confirmUpload(): void {
    if (!this.uploadReferenceDocs.valid) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!this.isConfirm) {
      alert("Please confirm that once uploaded, the document cannot be deleted.");
      return;
    }
    if (this.selectedFile) {
      this.ngxService.start();
      const formData = new FormData();
      const uploadReferenceDocument = this.uploadReferenceDocs.getRawValue();

      const file = this.selectedFile;
      const documentType = uploadReferenceDocument.documentType;
      const comments = uploadReferenceDocument.comments;
      const referenceId = this.refernceDetails?.referenceId;
      const createdBy = this.userDetails?.loginId;

      if (file) {
        formData.append("files", file); // Backend expects 'files' list
        formData.append("documentTypes", documentType);
        formData.append("comments", comments);
        formData.append("createdBy", createdBy.toString());
      }
      if (referenceId !== null && referenceId !== undefined) {
        this.userMgmtService.uploadReferenceDocuments(formData, referenceId).subscribe({
          next: (res: any) => {
            this.toastr.success(`${res}`);
            // Reset form but keep dialog open for next upload
            this.uploadReferenceDocs.reset();
            this.selectedFile = null as any;
            this.isConfirm = false;
            this.ngxService.stop();

            // Close and signal refresh
            this.dialogRef.close({
              uploaded: true,
              selectFile: file,
              comments: comments,
              documentType: documentType
            });
          },
          error: (err) => {
            this.toastr.error(`${err.message}`);
            this.ngxService.stop();
          }
        })
      }
      else {
        this.dialogRef.close({
          selectFile: file,
          comments: comments,
          documentType: documentType
        });
        this.ngxService.stop();
      }
    }
  }

}
