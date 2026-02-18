import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsermgmtService } from '../../service/usermgmt.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { User } from '../../interface/user.model';
import { NgxUiLoaderService } from "ngx-ui-loader";

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  public loginForm!: FormGroup;
  public hide: boolean = true; // Password hiding
  public captchaToken: string | null = null; // Store captcha token
  public siteKey: string = '6LdTnR4sAAAAAFMnARBUQ7gNwMkpmMhfOYDejvt8'; // Replace with your actual site key

  private userMgmtService = inject(UsermgmtService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private ngxService = inject(NgxUiLoaderService);

  constructor(private fb: FormBuilder) { }

  public ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
  }

  public onCaptchaResolved(captchaResponse: string | null): void {
    this.captchaToken = captchaResponse;
  }

  public onLogin(): void {
    // Validate captcha
    // if (!this.captchaToken) {
    //   this.toastr.error("Please complete the captcha verification.");
    //   return;
    // }

    this.ngxService.start();
    this.markAsDirty(this.loginForm);

    // Include captcha token in login request
    const loginData = {
      ...this.loginForm.value,
      captchaToken: this.captchaToken
    };

    this.userMgmtService.loginVipUser(loginData).subscribe({
      next: (res: any) => {
        if (res !== undefined && res !== null) {
          // Add officeType to user object before storing, strip sensitive fields
          const { userPassword, hashedPassword, ...safeUser } = res.user;
          const userWithOfficeType = {
            ...safeUser,
            officeType: res.officeType,
            officeTypeName: res.officeTypeName
          };

          if (res.user.roles[0].roleName == "Admin") {
            this.router.navigate(['/administrator']);
            sessionStorage.setItem('token', res.token);
            sessionStorage.setItem('user', JSON.stringify(userWithOfficeType));
            this.ngxService.stop();
          }
          else if (res.user.roles[0].roleName == "Initiator" || res.user.roles[0].roleName == "Assigner" || res.user.roles[0].roleName == "Assignee" || res.user.roles[0].roleName == "Final_Reply") {
            this.router.navigate(['/dashboard']);
            sessionStorage.setItem('token', res.token);
            sessionStorage.setItem('user', JSON.stringify(userWithOfficeType));
            this.ngxService.stop();
          }
          else {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.clear();
            this.router.navigate(['/login']);
            this.ngxService.stop();
          }
        }
        else {
          this.toastr.error("Invalid username or password. Please try again.");
          this.ngxService.stop();
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.error?.error || err.message || "Invalid username or password. Please try again.";
        this.toastr.error(errorMessage);
        this.ngxService.stop();
      }
    })
  }

  private markAsDirty(group: FormGroup): void {
    group.markAsDirty();
    // tslint:disable-next-line:forin
    for (const i in group.controls) {
      group.controls[i].markAsDirty();
    }
  }
}
