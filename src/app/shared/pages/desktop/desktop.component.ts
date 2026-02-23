import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { User } from '../../interface/user.model';
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ToastrService } from 'ngx-toastr';
import { UsermgmtService } from '../../service/usermgmt.service';


@Component({
  selector: 'app-desktop',
  standalone: false,
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.css'
})
export class DesktopComponent {

  userDetails!:User;
  searchVipReference!:FormGroup;
  selectedQueue: string = '';
  private ngxService= inject(NgxUiLoaderService);
  private toastr= inject(ToastrService);
  private userMgmtService = inject(UsermgmtService);
  queuesList: { name: string; icon: string }[] = [];
  

  ngOnInit(){
    this.getUserDetails();
    this.searchVipReferenceFormInit();
    this.getUserQueues();
  }

  getUserDetails(){
    const userData=sessionStorage.getItem("user");
    if(userData){
      this.userDetails=JSON.parse(userData);
    }
  }
  searchVipReferenceFormInit(){
    this.searchVipReference=new FormGroup({
      "selecteQueue":new FormControl(""),
      "processName":new FormControl(""),
      "workshopName":new FormControl(""),
      "variantName":new FormControl(""),
      "registrationNo":new FormControl("")
    })
  }
  getUserQueues() {
    this.ngxService.start();
    this.userMgmtService.getUserQueueList(this.userDetails.loginId).subscribe({
      next: (res) => {
        const queues = res.queues;
        this.queuesList = []; // Clear old list
  
        queues.forEach((queue: string) => {
          switch(queue) {
            case "VIP_Initiator":
              this.queuesList.push({ name: "VIP_Initiator", icon: 'person_add' });
              break;
            case "VIP_Assigner":
              this.queuesList.push({ name: "VIP_Assigner", icon: 'assignment_ind' });
              break;
            case "VIP_Assignee":
              this.queuesList.push({ name: "VIP_Assignee", icon: 'assignment_turned_in' });
              break;
            case "VIP_Final_Reply":
              this.queuesList.push({ name: "VIP_Final_Reply", icon: 'task_alt' });
              break;
            default:
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

navigateToQueue(selectQueue:any){
  this.selectedQueue = selectQueue;
}
}