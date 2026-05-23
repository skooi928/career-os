import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // If not in browser environment (e.g., SSR), defer to client-side check
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // In browser, check token in localStorage
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    return true;
  }

  // No valid token found, redirect to login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

