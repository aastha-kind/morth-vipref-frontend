import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-editor',
  standalone: false,
  templateUrl: './view-editor.component.html',
  styleUrl: './view-editor.component.css'
})
export class ViewEditorComponent {
  draftContent!: string;
  previewInit = {
    menubar: false,
    toolbar: false,
    statusbar: false,
    readonly: true,
    plugins: [],
    height: 400,
    branding: false,
    forced_root_block: "",
    setup: (editor: any) => {
      // Make editor truly read-only - disable all editing
      editor.on('init', () => {
        editor.mode.set('readonly'); // Set readonly mode
        editor.getBody().setAttribute('contenteditable', 'false'); // Disable contenteditable
      });

      // Disable keyboard input
      editor.on('keydown keyup keypress', (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
    }
  };
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.draftContent = data.draftContent;
  }
}
