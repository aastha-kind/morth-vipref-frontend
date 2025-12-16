import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class authInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('token');

    // Add Authorization header if token exists and not login request
    const authReq = (!req.url.includes('/auth/login') && token)
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle JWT expiration and unauthorized access
        if (error.status === 401 || error.status === 403) {
          // Check if error message contains JWT expired
          const errorMessage = error.error?.error || error.message || '';

          if (errorMessage.includes('JWT expired') ||
              errorMessage.includes('Token parsing failed') ||
              errorMessage.includes('expired') ||
              error.status === 401) {

            // Clear session storage
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');

            // Show toast notification
            this.toastr.error('Your session has expired. Please login again.', 'Session Expired');

            // Redirect to login page
            this.router.navigate(['/login']);
          }
        }

        return throwError(() => error);
      })
    );
  }
}
