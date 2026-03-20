import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../interface/user.model';
import { UsermgmtService } from '../../service/usermgmt.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  userDetails!: User;
  profileData: any = null;

  private ngxService = inject(NgxUiLoaderService);
  private usermgmtService = inject(UsermgmtService);

  ngOnInit(): void {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.userDetails = JSON.parse(userData);
      this.loadProfileData();
    }
  }

  loadProfileData(): void {
    this.ngxService.start();
    this.usermgmtService.getUserProfile(this.userDetails.loginId).subscribe({
      next: (res) => {
        if (res) {
          this.profileData = res;
        }
        this.ngxService.stop();
      },
      error: () => {
        this.ngxService.stop();
      }
    });
  }

  getInitials(): string {
    if (!this.userDetails?.name) return 'U';
    const parts = this.userDetails.name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
