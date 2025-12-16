import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditorComponent } from '@tinymce/tinymce-angular';
import jsPDF from 'jspdf';
import tinymce from 'tinymce';
import html2canvas from 'html2canvas';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { VipReferenceDetailsResponse } from '../../interface/reference-details-response.model';
import { User } from '../../interface/user.model';
import { UsermgmtService } from '../../service/usermgmt.service';
import { ToasterService } from '../../utilities/toaster.service';


@Component({
  selector: 'app-reply-editor',
  standalone: false,
  templateUrl: './reply-editor.component.html',
  styleUrl: './reply-editor.component.css'
})
export class ReplyEditorComponent {
  refernceDetails: VipReferenceDetailsResponse = {} as VipReferenceDetailsResponse;
  private ngxService = inject(NgxUiLoaderService);
  editorInstance: any;
  userDetails!: User;
  private userMgmtService = inject(UsermgmtService);
  private toastr = inject(ToasterService);

  onEditorInit(event: any) {
    this.editorInstance = event.editor;
  }
  editorContent: string = "";
  init: EditorComponent['init'];

  constructor(private dialogRef: MatDialogRef<ReplyEditorComponent>, @Inject(MAT_DIALOG_DATA) public data: VipReferenceDetailsResponse) { }

  ngOnInit() {
    this.ngxService.start();
    this.init = {
      height: 550,
      menubar: "file edit view insert format tools table help",
      plugins: [
        "advlist", "autolink", "lists", "link", "image",
        "charmap", "anchor", "searchreplace", "visualblocks", "code",
        "fullscreen", "insertdatetime", "media", "table", "help", "wordcount"
      ],
      toolbar:
        "undo redo | bold italic underline | blocks | " +
        "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | fontsize fontfamily",
      resize_enabled: true,
      resize_dir: 'vertical',
      setup: (editor: any) => {
        editor.on('init', () => {
          this.ngxService.stop();
        });
      }
    };
    this.getUserDetails();
    this.refernceDetails = this.data;
    // Start with empty editor instead of loading previous draft
    // Users can view saved drafts in the draft list, but editing starts fresh
    this.editorContent = '';
  }

  getActiveDraftReply(referenceId: number) {
    this.userMgmtService.getActiveReferenceId(referenceId).subscribe({
      next: (res: any) => {
        if (res?.data?.body) {
          const draft = Array.isArray(res.data?.body) ? res.data?.body[0] : res.data?.body;
          this.editorContent = draft.draftContent || '';
        }
      },
      error: (err: any) => {
        this.toastr.error("Error in getting save draft reply.");
      }
    });
  }

  getUserDetails() {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      this.userDetails = JSON.parse(userData);
    }
  }

  // private Long referenceId;
  //   private String createdBy;
  //   private String comments;
  //   private String draftContent;   // <-- HTML content from editor
  //   private MultipartFile file;

  confirmUpload() {
    if (!this.editorContent || this.editorContent.trim() === '') {
      this.toastr.error("Draft reply cannot be empty.");
      return;
    }

    // Show progress message
    this.toastr.info('Saving draft reply...', 0);
    this.ngxService.start();

    // Skip frontend PDF generation - send HTML to backend directly
    // Backend will generate PDF using a server-side library (much faster)
    this.uploadDraftReply();
  }

  uploadDraftReply() {
    const saveDraftReplyForm = new FormData();

    const referenceId = this.refernceDetails?.referenceId;
    const createdBy = this.userDetails?.loginId;

    // Create a minimal placeholder PDF file (backend will generate the actual PDF)
    const placeholderBlob = new Blob([''], { type: 'application/pdf' });
    const placeholderFile = new File([placeholderBlob], 'Draft_Reply.pdf', { type: 'application/pdf' });

    saveDraftReplyForm.append("file", placeholderFile);
    saveDraftReplyForm.append("createdBy", createdBy.toString());
    saveDraftReplyForm.append("referenceId", referenceId.toString());
    saveDraftReplyForm.append("draftContent", this.editorContent);

    this.userMgmtService.saveDraftReply(saveDraftReplyForm).subscribe({
      next: (res: any) => {
        this.toastr.dismiss();
        this.dialogRef.close({data:res});
        this.ngxService.stop();
      },
      error: (err: any) => {
        this.toastr.dismiss();
        this.toastr.error("Failed to save draft reply.");
        this.dialogRef.close({data:null});
        this.ngxService.stop();
      }
    });
  }






}
