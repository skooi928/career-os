import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService, LinkedAccountStatus } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h1><i class="ph ph-gear"></i> Account Settings</h1>
        <p>Manage your account configurations, security, and linked profiles.</p>
      </div>

      <div class="settings-grid">
        <!-- Card: Account Binding -->
        <div class="settings-card glass">
          <div class="card-header">
            <div class="header-icon"><i class="ph ph-link-simple"></i></div>
            <div>
              <h3>Linked Accounts</h3>
              <p>Bind your personal account with your work account to share data across roles.</p>
            </div>
          </div>

          <!-- Status Alert -->
          <div class="alert success" *ngIf="successMessage()">
            <i class="ph ph-check-circle"></i>
            <div>
              <strong>Success</strong>
              <p>{{ successMessage() }}</p>
            </div>
          </div>

          <div class="alert error" *ngIf="errorMessage()">
            <i class="ph ph-warning-circle"></i>
            <div>
              <strong>Error</strong>
              <p>{{ errorMessage() }}</p>
            </div>
          </div>

          <div class="loading-state" *ngIf="isLoading()">
            <div class="spinner"></div>
            <p>Loading account details...</p>
          </div>

          <div class="status-content" *ngIf="!isLoading()">
            <!-- Case 1: Account is linked -->
            <div class="linked-status" *ngIf="status().linked">
              <div class="linked-info-box">
                <div class="linked-details">
                  <span class="status-badge-linked">Connected</span>
                  <h4>Linked Email</h4>
                  <p class="linked-email">{{ status().linkedEmail }}</p>
                  <h4>Account Role</h4>
                  <p class="linked-role">{{ status().linkedRole | titlecase }} Account</p>
                </div>
              </div>

              <div class="unbind-action">
                <p class="warning-text">
                  Unlinking will separate the data streams for these two accounts. You will no longer share the same profile and resume records.
                </p>
                <button class="btn-unlink" [disabled]="isSubmitting()" (click)="onUnlink()">
                  <i class="ph ph-link-break" *ngIf="!isSubmitting()"></i>
                  <span class="spinner-sm" *ngIf="isSubmitting()"></span>
                  {{ isSubmitting() ? 'Disconnecting...' : 'Disconnect Account' }}
                </button>
              </div>
            </div>

            <!-- Case 2: Account is NOT linked -->
            <div class="unlinked-status" *ngIf="!status().linked">
              <div class="empty-link-state">
                <i class="ph ph-link-simple-slash empty-icon"></i>
                <h4>No Linked Accounts</h4>
                <p>Linking allows you to sync your candidate profile details, resume, and experience directly with a work persona (employer/mentor) while retaining separate workspaces.</p>
              </div>

              <div class="linking-actions">
                <!-- If currently logged in as Candidate (Personal) -> Link Work Account -->
                <div class="action-section" *ngIf="isCandidate()">
                  <h5>Work Account Binding (Azure)</h5>
                  <p>Authorize with your corporate Azure AD/Microsoft account to link your employer workspace.</p>
                  <button class="btn-azure" (click)="onLinkAzure()">
                    <i class="ph ph-microsoft-logo"></i> Link Work Account
                  </button>
                </div>

                <!-- If currently logged in as Employer/Mentor -> Link Personal Account -->
                <div class="action-section" *ngIf="!isCandidate()">
                  <h5>Link Your Personal Account</h5>
                  <p class="section-desc">Follow these steps to connect your corporate workspace with your personal Candidate profile:</p>
                  
                  <div class="steps-flow">
                    <div class="step-item">
                      <div class="step-badge">1</div>
                      <div class="step-text">
                        <strong>Verify Personal Account</strong>
                        <p>Ensure you have a registered Candidate account using a personal email address on CareerOS.</p>
                      </div>
                    </div>
                    <div class="step-item">
                      <div class="step-badge">2</div>
                      <div class="step-text">
                        <strong>Authenticate to Bind</strong>
                        <p>Provide your personal account credentials to establish the bidirectional connection.</p>
                      </div>
                    </div>
                  </div>

                  <button class="btn-link-action" (click)="showLinkModal.set(true)">
                    <i class="ph ph-lock-key"></i> Log in to Link Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Credential Modal for Personal Account Binding -->
      <div class="modal-backdrop" *ngIf="showLinkModal()">
        <div class="modal glass animate-fade-in">
          <div class="modal-header">
            <h3><i class="ph ph-user-circle"></i> Link Personal Account</h3>
            <button class="btn-close" (click)="showLinkModal.set(false)"><i class="ph ph-x"></i></button>
          </div>
          <form (ngSubmit)="onLinkPersonal()" #linkForm="ngForm" class="modal-form">
            <p class="modal-desc">
              Enter your personal Candidate account credentials to merge the profiles.
            </p>
            <div class="field">
              <label>Personal Account Email</label>
              <input type="email" [(ngModel)]="personalEmail" name="email" required placeholder="e.g. personal@gmail.com" #emailCtrl="ngModel">
            </div>
            <div class="field">
              <label>Password</label>
              <input type="password" [(ngModel)]="personalPassword" name="password" required placeholder="••••••••" #passCtrl="ngModel">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="showLinkModal.set(false)">Cancel</button>
              <button type="submit" class="btn-submit" [disabled]="isSubmitting() || linkForm.invalid">
                <span class="spinner-sm" *ngIf="isSubmitting()"></span>
                {{ isSubmitting() ? 'Linking...' : 'Link Account' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container { padding: 32px 40px; max-width: 900px; margin: 0 auto; }
    .settings-header { margin-bottom: 28px; }
    .settings-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 6px; display: flex; align-items: center; gap: 10px; }
    .settings-header h1 i { color: var(--color-primary); }
    .settings-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }

    .settings-grid { display: flex; flex-direction: column; gap: 24px; }
    .settings-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 28px; }
    .settings-card.glass {
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.05);
    }
    .card-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
    .header-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--color-secondary); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
    .card-header h3 { font-size: 1.15rem; font-weight: 700; color: var(--color-text); margin: 0 0 4px; }
    .card-header p { font-size: 0.85rem; color: var(--color-text-secondary); margin: 0; }

    .alert { display: flex; align-items: flex-start; gap: 10px; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; font-size: 0.85rem; }
    .alert.success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .alert.success i { font-size: 1.25rem; margin-top: 1px; }
    .alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .alert.error i { font-size: 1.25rem; margin-top: 1px; }
    .alert strong { display: block; margin-bottom: 2px; }
    .alert p { margin: 0; }

    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 40px 0; gap: 12px; color: var(--color-text-secondary); font-size: 0.88rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; display: inline-block; animation: spin 0.8s linear infinite; margin-right: 6px; vertical-align: middle; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Linked UI */
    .linked-info-box { display: flex; align-items: center; gap: 24px; padding: 20px; background: var(--color-surface-secondary); border-radius: 14px; border: 1px solid var(--color-border); margin-bottom: 24px; }
    .linked-icon-group { position: relative; display: flex; align-items: center; justify-content: center; }
    .success-icon { position: absolute; bottom: -2px; right: -2px; font-size: 1.25rem; background: white; border-radius: 50%; }
    .avatar-linked { font-size: 3.5rem; color: var(--color-primary); }
    .linked-details h4 { font-size: 0.72rem; text-transform: uppercase; color: var(--color-text-secondary); letter-spacing: 0.05em; margin: 0 0 3px 0; }
    .linked-email { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0 0 12px 0; }
    .linked-role { font-size: 0.85rem; font-weight: 600; color: var(--color-primary); margin: 0; }
    .status-badge-linked { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 999px; display: inline-block; margin-bottom: 8px; }

    .warning-text { font-size: 0.82rem; color: var(--color-text-secondary); margin: 0 0 16px 0; }
    .btn-unlink { padding: 10px 22px; border-radius: 10px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
    .btn-unlink:hover { background: #fecaca; }

    /* Unlinked UI */
    .empty-link-state { display: flex; flex-direction: column; align-items: center; padding: 32px 20px; text-align: center; border: 1px dashed var(--color-border); border-radius: 14px; margin-bottom: 28px; }
    .empty-icon { font-size: 2.2rem; color: var(--color-text-secondary); margin-bottom: 12px; opacity: 0.6; }
    .empty-link-state h4 { font-size: 0.95rem; font-weight: 700; color: var(--color-text); margin: 0 0 6px 0; }
    .empty-link-state p { font-size: 0.82rem; color: var(--color-text-secondary); max-width: 440px; margin: 0; line-height: 1.4; }

    .linking-actions { display: grid; grid-template-columns: 1fr; gap: 20px; }
    .action-section { padding: 20px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 12px; }
    .action-section h5 { font-size: 0.9rem; font-weight: 700; color: var(--color-text); margin: 0 0 6px; }
    .action-section p { font-size: 0.8rem; color: var(--color-text-secondary); margin: 0 0 16px; }
    .btn-azure { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; background: #00a4ef; color: white; border: none; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
    .btn-azure:hover { opacity: 0.9; }
    .btn-link-action { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; background: var(--color-primary); color: white; border: none; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
    .btn-link-action:hover { opacity: 0.9; }

    .section-desc { font-size: 0.85rem; color: var(--color-text-secondary); margin: 0 0 16px; }
    .steps-flow { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; background: var(--color-surface-secondary); padding: 16px; border-radius: 12px; border: 1px solid var(--color-border); }
    .step-item { display: flex; align-items: flex-start; gap: 12px; }
    .step-badge { width: 20px; height: 20px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; flex-shrink: 0; margin-top: 2px; }
    .step-text strong { display: block; font-size: 0.82rem; color: var(--color-text); margin-bottom: 2px; }
    .step-text p { font-size: 0.76rem; color: var(--color-text-secondary); margin: 0; line-height: 1.3; }

    /* Modal */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .modal { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; width: 100%; max-width: 420px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
    .modal.glass { backdrop-filter: blur(16px); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .modal-header h3 { font-size: 1.05rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px; color: var(--color-text); }
    .modal-header h3 i { color: var(--color-primary); }
    .btn-close { background: none; border: none; font-size: 1.2rem; color: var(--color-text-secondary); cursor: pointer; padding: 4px; }
    .modal-desc { font-size: 0.82rem; color: var(--color-text-secondary); margin: 0 0 16px; line-height: 1.4; }
    .modal-form .field { margin-bottom: 16px; }
    .modal-form label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--color-text); margin-bottom: 6px; }
    .modal-form input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; box-sizing: border-box; }
    .modal-form input:focus { border-color: var(--color-primary); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; }
    .btn-cancel { padding: 9px 18px; border-radius: 8px; border: 1px solid var(--color-border); background: transparent; color: var(--color-text-secondary); font-size: 0.82rem; font-weight: 600; cursor: pointer; }
    .btn-submit { padding: 9px 20px; border-radius: 8px; background: var(--color-primary); color: white; border: none; font-size: 0.82rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    .animate-fade-in { animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  status = signal<LinkedAccountStatus>({ linked: false });
  isLoading = signal(true);
  isSubmitting = signal(false);
  showLinkModal = signal(false);

  personalEmail = '';
  personalPassword = '';

  successMessage = signal('');
  errorMessage = signal('');

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStatus();

      // Check url params for linked state or errors from Azure callback redirect
      this.route.queryParams.subscribe(params => {
        if (params['linked'] === 'true') {
          this.successMessage.set('Work account successfully linked!');
          this.loadStatus();
        } else if (params['error']) {
          this.errorMessage.set(params['error']);
        }
      });
    }
  }

  isCandidate(): boolean {
    return this.authService.isCandidate();
  }

  loadStatus() {
    this.isLoading.set(true);
    this.settingsService.getLinkedAccountStatus().subscribe({
      next: res => {
        this.status.set(res);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Failed to load status', err);
        this.isLoading.set(false);
      }
    });
  }

  onLinkAzure() {
    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage.set('You must be signed in to link your account.');
      return;
    }
    // Redirect browser to link endpoint
    window.location.href = `http://localhost:8080/api/auth/azure/link?token=${encodeURIComponent(token)}`;
  }

  onLinkPersonal() {
    if (!this.personalEmail || !this.personalPassword) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.settingsService.linkPersonalAccount({
      email: this.personalEmail,
      password: this.personalPassword
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showLinkModal.set(false);
        this.successMessage.set('Personal account successfully linked!');
        this.personalEmail = '';
        this.personalPassword = '';
        this.loadStatus();
      },
      error: err => {
        this.isSubmitting.set(false);
        const error = err.error?.error || 'Failed to authenticate and link personal account.';
        this.errorMessage.set(error);
      }
    });
  }

  onUnlink() {
    if (!confirm('Are you sure you want to disconnect this linked account?')) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.settingsService.unlinkAccount().subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Account disconnected successfully.');
        this.loadStatus();
      },
      error: err => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Failed to disconnect account. Please try again.');
      }
    });
  }
}
