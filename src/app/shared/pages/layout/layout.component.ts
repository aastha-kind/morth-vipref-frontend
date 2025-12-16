import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  selectedMenu:string="User Dashboard";
  private router=inject(Router);
  isMenuOpen = false;
  opened = false;

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
    if(this.selectedMenu == "User Desktop"){
      this.router.navigate(['/dashboard/desktop']);
    }
    else{
      this.router.navigate(['/dashboard']);
    }
  }

}
