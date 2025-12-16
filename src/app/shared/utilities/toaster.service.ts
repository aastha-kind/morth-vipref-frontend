import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(private snackBar: MatSnackBar) {}

  // 🔹 Common configuration
  private getConfig(panelClass: string, duration: number = 2000): MatSnackBarConfig {
    return {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    };
  }
  

  // ✅ Success message
  success(message: string, duration: number = 2000) {
    this.snackBar.open(`✅ ${message}`, 'OK', this.getConfig('success-snackbar', duration));
  }

  // ⚠️ Error message
  error(message: string, duration: number = 2500) {
    this.snackBar.open(`❌ ${message}`, 'Dismiss', this.getConfig('error-snackbar', duration));
  }

  // ℹ️ Info message
  info(message: string, duration: number = 2000) {
    this.snackBar.open(`ℹ️ ${message}`, 'Close', this.getConfig('info-snackbar', duration));
  }

  // ⚙️ Warning message
  warning(message: string, duration: number = 2000) {
    this.snackBar.open(`⚠️ ${message}`, 'Close', this.getConfig('warning-snackbar', duration));
  }

  // 🗑️ Dismiss all snackbars
  dismiss() {
    this.snackBar.dismiss();
  }
}