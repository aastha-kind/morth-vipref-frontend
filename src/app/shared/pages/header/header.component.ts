
import { Component, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { User } from '../../interface/user.model';
import { Router } from '@angular/router';
import { AdminService } from '../../service/admin.service';
import { UsermgmtService } from '../../service/usermgmt.service';
@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  userDetails?:User;
  loginUserName:String="";
  userMgmtService=inject(UsermgmtService);
   @Output() toggleSidenav = new EventEmitter<void>();

  constructor(private router: Router) { }

  logout(): void {
    this.router.navigate(['/']);
    this.userMgmtService.clearReferenceDetails();
    sessionStorage.clear();
  }

  ngOnInit(){
    const userData=sessionStorage.getItem("user");

    if(userData){
      this.userDetails=JSON.parse(userData);
    }
  }
}
