import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = sessionStorage.getItem('token');
  const userData = sessionStorage.getItem('user');
  let userDetails: any = {};
  if (userData) {
    userDetails = JSON.parse(userData);
  }

  const publicRoutes = ['/', '/login', '/forget-password'];
  const routeRolesMap: { [key: string]: string[] } = {
    '/dashboard': ['Initiator', 'Assigner', 'Assignee', 'Final_Reply'],
    '/administrator': ['Admin']
  };

  if (!token || !userDetails) {
    if (publicRoutes.includes(state.url)) {
      return true;
    }
    router.navigate(['/login']);
    return false;
  }

  // Check if token is expired
  if (authService.isTokenExpired(token)) {
    authService.logout('Your session has expired. Please login again.');
    return false;
  }

  const role = userDetails.roles[0].roleName;

  if (publicRoutes.includes(state.url)) {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.clear();
    router.navigate(['/login']);
    return false;
  }


  const allowedRoute = Object.keys(routeRolesMap).find(prefix => state.url.startsWith(prefix));

  if (allowedRoute) {
    const allowedRoles = routeRolesMap[allowedRoute];
    if (!allowedRoles.includes(role)) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
       sessionStorage.clear();
      router.navigate(['/login']);
      return false;
    }
  } else {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
     sessionStorage.clear();
    router.navigate(['/login']);
    return false;
  }

  return true;
};
