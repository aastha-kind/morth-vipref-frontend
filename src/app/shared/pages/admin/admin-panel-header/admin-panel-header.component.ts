import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel-header',
  standalone: false,
  templateUrl: './admin-panel-header.component.html',
  styleUrl: './admin-panel-header.component.css'
})
export class AdminPanelHeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  private router=inject(Router);

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}
