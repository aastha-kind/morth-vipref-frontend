import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  selectedMenu: string = "User Dashboard";
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);

  isMenuOpen = false;
  opened = false;

  // Responsive sidenav state
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;

  ngOnInit(): void {
    this.breakpointObserver
      .observe(['(max-width: 991px)'])
      .subscribe(result => {
        this.sidenavMode = result.matches ? 'over' : 'side';
        this.sidenavOpened = !result.matches;
      });
  }

  toggle(): void {
    this.opened = !this.opened;
  }

  menu: any = [
    {
      title: 'Dashboard',
      icon: 'home',
      link: '/dashboard',
      color: '#ff7f0e',
    },
    {
      title: 'Desktop',
      icon: 'home',
      link: '/dashboard/desktop',
      color: '#ff7f0e',
    },
    {
      title: 'Statistics',
      icon: 'bar_chart',
      color: '#ff7f0e',
      subMenu: [
        {
          title: 'Sales',
          icon: 'money',
          link: '/sales',
          color: '#ff7f0e',
        },
        {
          title: 'Customers',
          icon: 'people',
          color: '#ff7f0e',
          link: '/customers',
        },
      ],
    },
  ];

  switchMenu(option: string): void {
    this.selectedMenu = option;
    if (this.selectedMenu == "User Desktop") {
      this.router.navigate(['/dashboard/desktop']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
