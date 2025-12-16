import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsermgmtService } from '../../service/usermgmt.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm!: FormGroup;
  resetPasswordForm!: FormGroup;

  currentStep: number = 1; // 1 = forgot password, 2 = reset password
  temporaryPassword: string = '';
  savedLoginId: string = '';

  hideTempPassword: boolean = true;
  hideNewPassword: boolean = true;
  hideConfirmPassword: boolean = true;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userMgmtService = inject(UsermgmtService);
  private toastr = inject(ToastrService);
  private ngxService = inject(NgxUiLoaderService);

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    this.forgotPasswordForm = this.fb.group({
      loginId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetPasswordForm = this.fb.group({
      temporaryPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onForgotPassword(): void {
    this.markFormAsDirty(this.forgotPasswordForm);

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.ngxService.start();
    const requestData = this.forgotPasswordForm.value;

    this.userMgmtService.forgotPassword(requestData).subscribe({
      next: (res: any) => {
        this.ngxService.stop();
        if (res.success) {
          this.temporaryPassword = res.temporaryPassword;
          this.savedLoginId = requestData.loginId;
          this.currentStep = 2;
          this.toastr.success(res.message, 'Success');
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => {
        this.ngxService.stop();
        const errorMessage = err.error?.message || 'Failed to process forgot password request';
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  onResetPassword(): void {
    this.markFormAsDirty(this.resetPasswordForm);

    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.ngxService.start();
    const requestData = {
      loginId: this.savedLoginId,
      ...this.resetPasswordForm.value
    };

    this.userMgmtService.resetPassword(requestData).subscribe({
      next: (res: any) => {
        this.ngxService.stop();
        if (res.success) {
          this.toastr.success(res.message, 'Success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => {
        this.ngxService.stop();
        const errorMessage = err.error?.message || 'Failed to reset password';
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.temporaryPassword).then(() => {
      this.toastr.info('Temporary password copied to clipboard', 'Copied');
    }).catch(() => {
      this.toastr.error('Failed to copy to clipboard', 'Error');
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }

  private markFormAsDirty(form: FormGroup): void {
    form.markAsDirty();
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsDirty();
      form.controls[key].markAsTouched();
    });
  }
}
