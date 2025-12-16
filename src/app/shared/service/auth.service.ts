import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return false;
    }

    // Check if token is expired
    if (this.isTokenExpired(token)) {
      this.logout('Your session has expired. Please login again.');
      return false;
    }

    return true;
  }

  /**
   * Check if JWT token is expired
   * JWT format: header.payload.signature
   */
  isTokenExpired(token: string): boolean {
    try {
      // Decode JWT payload (base64 decode the middle part)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true; // Invalid token format
      }

      const payload = JSON.parse(atob(parts[1]));

      // Check expiration (exp is in seconds, Date.now() is in milliseconds)
      if (!payload.exp) {
        return false; // No expiration claim, assume valid
      }

      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      return currentTime >= expirationTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume expired if we can't parse
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) {
        return null;
      }

      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('Error parsing token expiration:', error);
      return null;
    }
  }

  /**
   * Get time remaining before token expires (in minutes)
   */
  getTimeUntilExpiration(token: string): number | null {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return null;
    }

    const now = new Date().getTime();
    const expirationTime = expiration.getTime();
    const minutesRemaining = Math.floor((expirationTime - now) / 60000);

    return minutesRemaining;
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  willExpireSoon(token: string): boolean {
    const minutesRemaining = this.getTimeUntilExpiration(token);
    if (minutesRemaining === null) {
      return false;
    }

    return minutesRemaining <= 5 && minutesRemaining > 0;
  }

  /**
   * Get current user from session storage
   */
  getCurrentUser(): any {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  /**
   * Logout user and redirect to login
   */
  logout(message?: string): void {
    // Clear session storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // Show message if provided
    if (message) {
      this.toastr.warning(message, 'Session Expired');
    }

    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Check token expiration on app initialization or route changes
   * Returns true if valid, false if expired (and handles logout)
   */
  validateSession(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.logout('Your session has expired. Please login again.');
      return false;
    }

    // Warn user if token will expire soon
    if (this.willExpireSoon(token)) {
      const minutesRemaining = this.getTimeUntilExpiration(token);
      this.toastr.warning(
        `Your session will expire in ${minutesRemaining} minute(s). Please save your work.`,
        'Session Expiring Soon',
        { timeOut: 10000 }
      );
    }

    return true;
  }
}
