import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const emailVerificationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // If not in browser environment (e.g., SSR), defer to client-side check
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Get current user
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  // Check if email is verified (treat null as not verified)
  if (currentUser.emailVerified !== true) {
    // Store the attempted URL and show verification modal
    sessionStorage.setItem('pendingVerificationRoute', state.url);
    router.navigate(['/verify-email']);
    return false;
  }

  return true;
};
