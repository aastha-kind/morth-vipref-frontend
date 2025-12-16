import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-reply',
  standalone: false,
  templateUrl: './upload-reply.component.html',
  styleUrl: './upload-reply.component.css'
})
export class UploadReplyComponent {
  uploadReplyDocs!: FormGroup;
  selectedFile!: File;

  constructor(private dialogRef: MatDialogRef<UploadReplyComponent>){

  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate type
      if (file.type !== 'application/pdf') {
        this.uploadReplyDocs.get('file')?.setErrors({ invalidType: true });
        return;
      }

      // Validate size (max 50MB = 50 * 1024 * 1024)
      if (file.size > 2 * 1024 * 1024) {
        this.uploadReplyDocs.get('file')?.setErrors({ maxSizeExceeded: true });
        return;
      }

      this.uploadReplyDocs.get('file')?.setErrors(null);
      this.selectedFile = file;
    }
  }

    confirmUpload(): void {
    if (this.selectedFile) {
      this.dialogRef.close({
        selectFile: this.selectedFile
      });
      this.uploadReplyDocs.reset();
    }
  }
}
