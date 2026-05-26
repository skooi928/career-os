import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verify-email-container">
      <div class="verify-card">
        <div class="icon">
          <i class="ph ph-envelope-open"></i>
        </div>
        
        <h1>Verify Your Email</h1>
        
        <p class="message">
          A verification email has been sent to:
        </p>
        
        <p class="email">{{ userEmail }}</p>
        
        <p class="instructions">
          Please click the link in the email to verify your account and unlock full access to Career OS.
        </p>
        
        <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin: 16px 0;">
          <strong>Note:</strong> After verifying your email, you'll need to log in again to access your profile.
        </p>
        
        <div class="actions">
          <button class="btn-primary" (click)="onVerified()">
            I've Verified My Email
          </button>
          <button class="btn-secondary" (click)="onLogout()">
            Sign Out
          </button>
        </div>
        
        <p class="resend-help">
          Didn't receive an email? <br>
          <small>Check your spam folder or contact support</small>
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #10b981;
      --primary-dark: #059669;
    }

    .verify-email-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--color-background) 0%, var(--color-background) 100%);
      padding: 20px;
    }

    .verify-card {
      background: var(--color-surface);
      border-radius: 16px;
      padding: 48px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--color-border);
    }

    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2.5rem;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 16px 0;
    }

    .message {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      margin: 0 0 12px 0;
    }

    .email {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--primary);
      background: var(--color-secondary);
      padding: 12px 16px;
      border-radius: 8px;
      word-break: break-all;
      margin: 0 0 24px 0;
    }

    .instructions {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin: 0 0 32px 0;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    button {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-hover);
      color: var(--color-text);
    }

    .resend-help {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    small {
      display: block;
      margin-top: 4px;
      font-size: 0.8rem;
    }

    @media (max-width: 480px) {
      .verify-card {
        padding: 32px 24px;
      }

      h1 {
        font-size: 1.5rem;
      }

      .icon {
        width: 64px;
        height: 64px;
        font-size: 2rem;
      }
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  userEmail: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = this.authService.getCurrentUser();
    if (user) {
      this.userEmail = user.email;
    } else {
      this.router.navigate(['/login']);
    }
  }

  onVerified() {
    // In a production app, you would call a backend endpoint to refresh the user's email verification status
    // For now, we'll just redirect to the pending route or dashboard
    // The user will need to log back in after verifying to get the updated status
    
    alert('Please log in again after verifying your email.');
    this.onLogout();
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
