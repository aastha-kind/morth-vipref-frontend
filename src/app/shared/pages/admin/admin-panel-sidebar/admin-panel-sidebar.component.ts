import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-panel-sidebar',
  standalone: false,
  templateUrl: './admin-panel-sidebar.component.html',
  styleUrl: './admin-panel-sidebar.component.css'
})
export class AdminPanelSidebarComponent {
  showMasterData = false;

  toggleMasterData() {
    this.showMasterData = !this.showMasterData;
  }
}
