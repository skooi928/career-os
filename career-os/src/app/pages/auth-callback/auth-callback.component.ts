import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; flex-direction: column;">
      <h2 *ngIf="!error()">Authenticating...</h2>
      <div *ngIf="error()" style="color: red; text-align: center;">
        <h2>Authentication Failed</h2>
        <p>{{ error() }}</p>
        <button (click)="goToLogin()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Back to Login</button>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams.subscribe(params => {
        const token = params['token'];
        if (token) {
          const success = this.authService.setAuthSessionFromToken(token);
          if (success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.error.set('Failed to parse the authentication token securely. Please check the browser console for details.');
          }
        } else {
          this.error.set('No token found in callback URL.');
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
