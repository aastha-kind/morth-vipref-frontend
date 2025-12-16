import { Component, inject } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UsermgmtService } from '../../service/usermgmt.service';
import { User } from '../../interface/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-side-nav',
  standalone: false,
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent {
  userDetails!: User;
  showMasterData = false;
  private ngxService = inject(NgxUiLoaderService);
  private userMgmtService = inject(UsermgmtService);
  private toastr = inject(ToastrService);
  queuesList: any[] = [];
  ngOnInit() {
    this.getUserDetails();
    this.getUserQueues();
  }
  toggleMasterData() {
    this.showMasterData = !this.showMasterData;
  }

  getUserQueues() {
    this.ngxService.start();
    this.userMgmtService.getUserQueueList(this.userDetails.loginId).subscribe({
      next: (res) => {
        const queues = res.queues;
        this.queuesList = [];

        queues.forEach((queue: string) => {
          switch (queue) {
            case "Initiator":
              this.queuesList.push({ name: "VIP_Initiator", route: 'vip-initiator' });
              break;
            case "Assigner":
              this.queuesList.push({ name: "VIP_Assigner", route: 'vip-assigner' });
              break;
            case "Assignee":
              this.queuesList.push({ name: "VIP_Assignee", route: 'vip-assignee' });
              break;
            case "Final_Reply":
              this.queuesList.push({ name: "VIP_Final_Reply", route: 'vip-final-reply' });
              break;

            case "Close_Reference":
              this.queuesList.push({ name: "Closed_References", route: 'vip-closed-references' });
              break;
          }
        });
        this.ngxService.stop();
      },
      error: (err) => {
        this.toastr.error("No references found for this user");
        this.ngxService.stop();
      }
    })
  }

  getUserDetails() {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      this.userDetails = JSON.parse(userData);
    }
  }
}
