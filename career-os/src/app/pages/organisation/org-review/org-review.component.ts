import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrganisationService } from '../../../services/organisation.service';
import { Organisation } from '../../../types/upskilling.types';

@Component({
  selector: 'app-org-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="review-header">
        <a routerLink="/organisation" class="back-btn">
          <i class="ph ph-arrow-left"></i> Back to Organisations
        </a>
        <span class="header-badge"><i class="ph ph-shield-check"></i> Admin Review</span>
      </div>

      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="error-state" *ngIf="error()">
        <i class="ph ph-warning-circle"></i><p>{{ error() }}</p>
      </div>

      <ng-container *ngIf="!isLoading() && org() as o">
        <div class="review-layout">

          <!-- Left: Details -->
          <div class="review-detail-card">
            <div class="org-hero">
              <div class="org-logo-lg">{{ o.name[0].toUpperCase() }}</div>
              <div class="org-hero-info">
                <h1 class="org-name">{{ o.name }}</h1>
                <div class="org-meta-row">
                  <span class="type-badge">{{ o.type === 'INDUSTRY' ? 'Industry / Company' : 'University' }}</span>
                  <span class="status-pill" [class]="'pill-' + o.verificationStatus.toLowerCase()">
                    <i class="ph"
                       [class.ph-clock]="o.verificationStatus === 'PENDING'"
                       [class.ph-check-circle]="o.verificationStatus === 'VERIFIED'"
                       [class.ph-x-circle]="o.verificationStatus === 'REJECTED'"></i>
                    {{ statusLabel(o.verificationStatus) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-section" *ngIf="o.description">
              <h3 class="detail-label"><i class="ph ph-align-left"></i> Description</h3>
              <p class="detail-text">{{ o.description }}</p>
            </div>

            <div class="detail-grid">
              <div class="detail-item" *ngIf="o.website">
                <span class="detail-item-label"><i class="ph ph-globe"></i> Website</span>
                <a [href]="o.website" target="_blank" class="detail-link">{{ o.website }}</a>
              </div>
              <div class="detail-item" *ngIf="o.emailDomain">
                <span class="detail-item-label"><i class="ph ph-envelope"></i> Email Domain</span>
                <span class="detail-value">{{ o.emailDomain }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-item-label"><i class="ph ph-calendar"></i> Submitted</span>
                <span class="detail-value">{{ o.createdAt | date:'d MMMM yyyy, h:mm a' }}</span>
              </div>
              <div class="detail-item" *ngIf="o.verifiedAt">
                <span class="detail-item-label"><i class="ph ph-check-circle"></i> Verified At</span>
                <span class="detail-value">{{ o.verifiedAt | date:'d MMMM yyyy' }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h3 class="detail-label"><i class="ph ph-file-text"></i> Verification Document</h3>
              <div class="doc-box" *ngIf="o.verificationDocumentUrl; else noDoc">
                <i class="ph ph-file-text doc-icon"></i>
                <div class="doc-box-info">
                  <span class="doc-box-name">Verification Document</span>
                  <span class="doc-box-sub">Submitted by the organisation</span>
                </div>
                <a [href]="o.verificationDocumentUrl" target="_blank" class="doc-open-btn">
                  <i class="ph ph-arrow-square-out"></i> Open
                </a>
              </div>
              <ng-template #noDoc>
                <div class="no-doc-warning">
                  <i class="ph ph-warning"></i>
                  <span>No verification document has been uploaded.</span>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="action-card">
            <h3 class="action-title">Review Decision</h3>
            <p class="action-desc">Review the organisation details and verification document before approving or rejecting their registration.</p>

            <div class="current-status">
              <span class="cs-label">Current status</span>
              <span class="status-pill" [class]="'pill-' + o.verificationStatus.toLowerCase()">
                <i class="ph"
                   [class.ph-clock]="o.verificationStatus === 'PENDING'"
                   [class.ph-check-circle]="o.verificationStatus === 'VERIFIED'"
                   [class.ph-x-circle]="o.verificationStatus === 'REJECTED'"></i>
                {{ statusLabel(o.verificationStatus) }}
              </span>
            </div>

            <div class="action-buttons">
              <button class="action-approve" (click)="approve()"
                      [disabled]="actionLoading() || o.verificationStatus === 'VERIFIED'">
                <i class="ph ph-check-circle"></i>
                {{ actionLoading() ? 'Processing…' : 'Approve' }}
              </button>
              <button class="action-reject" (click)="reject()"
                      [disabled]="actionLoading() || o.verificationStatus === 'REJECTED'">
                <i class="ph ph-x-circle"></i>
                {{ actionLoading() ? 'Processing…' : 'Reject' }}
              </button>
            </div>

            <div class="action-approved-note" *ngIf="o.verificationStatus === 'VERIFIED'">
              <i class="ph ph-check-circle"></i> This organisation is already approved.
            </div>
            <div class="action-rejected-note" *ngIf="o.verificationStatus === 'REJECTED'">
              <i class="ph ph-x-circle"></i> This organisation is already rejected.
            </div>
          </div>
        </div>
      </ng-container>

      <div class="toast" [class.show]="toast()">
        <i class="ph ph-check-circle"></i> {{ toast() }}
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; max-width: 1100px; margin: 0 auto; }

    /* Header */
    .review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .back-btn { display: inline-flex; align-items: center; gap: 7px; color: var(--color-text-secondary); font-size: 0.875rem; font-weight: 600; text-decoration: none; padding: 8px 16px; border-radius: 9px; border: 1px solid var(--color-border); background: var(--color-surface); transition: all 0.2s; }
    .back-btn:hover { color: var(--color-text); border-color: var(--color-primary); }
    .header-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; padding: 5px 12px; border-radius: 999px; background: #fef3c7; color: #92400e; letter-spacing: 0.03em; text-transform: uppercase; }

    /* Layout */
    .review-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }

    /* Detail card */
    .review-detail-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 28px; }
    .org-hero { display: flex; align-items: center; gap: 18px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--color-border); }
    .org-logo-lg { width: 72px; height: 72px; border-radius: 16px; background: linear-gradient(135deg, var(--color-primary), #059669); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; flex-shrink: 0; }
    .org-name { font-size: 1.4rem; font-weight: 800; color: var(--color-text); margin: 0 0 8px; }
    .org-meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

    .detail-section { margin-bottom: 20px; }
    .detail-label { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 10px; }
    .detail-label i { font-size: 1rem; }
    .detail-text { font-size: 0.9rem; color: var(--color-text); line-height: 1.6; margin: 0; }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .detail-item { background: var(--color-bg); border-radius: 10px; padding: 12px 14px; border: 1px solid var(--color-border); }
    .detail-item-label { display: flex; align-items: center; gap: 6px; font-size: 0.73rem; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 5px; }
    .detail-value { font-size: 0.875rem; color: var(--color-text); font-weight: 500; word-break: break-word; }
    .detail-link { font-size: 0.875rem; color: var(--color-primary); text-decoration: none; word-break: break-all; }
    .detail-link:hover { text-decoration: underline; }

    .doc-box { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 10px; }
    .doc-icon { font-size: 1.8rem; color: var(--color-primary); flex-shrink: 0; }
    .doc-box-info { flex: 1; min-width: 0; }
    .doc-box-name { display: block; font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
    .doc-box-sub { font-size: 0.75rem; color: var(--color-text-secondary); }
    .doc-open-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 8px; background: var(--color-secondary); color: var(--color-primary); font-size: 0.8rem; font-weight: 700; text-decoration: none; border: 1px solid var(--color-border); flex-shrink: 0; transition: all 0.2s; }
    .doc-open-btn:hover { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .no-doc-warning { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; font-size: 0.85rem; color: #92400e; }
    .no-doc-warning i { font-size: 1.1rem; color: #f59e0b; }

    /* Action card */
    .action-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 24px; position: sticky; top: 80px; }
    .action-title { font-size: 1rem; font-weight: 800; color: var(--color-text); margin: 0 0 8px; }
    .action-desc { font-size: 0.82rem; color: var(--color-text-secondary); margin: 0 0 20px; line-height: 1.5; }
    .current-status { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--color-bg); border-radius: 10px; margin-bottom: 16px; border: 1px solid var(--color-border); }
    .cs-label { font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
    .action-buttons { display: flex; flex-direction: column; gap: 10px; }
    .action-approve { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 13px; border-radius: 10px; background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .action-approve:hover:not(:disabled) { background: #059669; color: white; border-color: #059669; }
    .action-approve:disabled { opacity: 0.5; cursor: not-allowed; }
    .action-reject { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 13px; border-radius: 10px; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .action-reject:hover:not(:disabled) { background: #ef4444; color: white; border-color: #ef4444; }
    .action-reject:disabled { opacity: 0.5; cursor: not-allowed; }
    .action-approved-note { display: flex; align-items: center; gap: 7px; padding: 10px 14px; background: #d1fae5; color: #065f46; border-radius: 9px; font-size: 0.8rem; font-weight: 600; margin-top: 14px; }
    .action-rejected-note { display: flex; align-items: center; gap: 7px; padding: 10px 14px; background: #fee2e2; color: #991b1b; border-radius: 9px; font-size: 0.8rem; font-weight: 600; margin-top: 14px; }

    /* Status pills */
    .status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
    .pill-pending { background: #fef3c7; color: #92400e; }
    .pill-verified { background: #d1fae5; color: #065f46; }
    .pill-rejected { background: #fee2e2; color: #991b1b; }

    /* Type badge */
    .type-badge { display: inline-block; padding: 3px 9px; border-radius: 5px; background: var(--color-secondary); color: var(--color-primary); font-size: 0.73rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }

    /* Loading / error */
    .loading-state { display: flex; justify-content: center; padding: 80px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-state { display: flex; align-items: center; gap: 12px; padding: 24px; background: #fee2e2; border-radius: 14px; color: #991b1b; font-size: 0.9rem; }
    .error-state i { font-size: 1.5rem; }

    /* Toast */
    .toast { position: fixed; bottom: 24px; right: 24px; background: #065f46; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; display: flex; align-items: center; gap: 8px; }
    .toast.show { opacity: 1; transform: translateY(0); }

    @media (max-width: 900px) {
      .page { padding: 20px; }
      .review-layout { grid-template-columns: 1fr; }
      .detail-grid { grid-template-columns: 1fr; }
      .action-card { position: static; }
    }
  `]
})
export class OrgReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orgService = inject(OrganisationService);

  org = signal<Organisation | null>(null);
  isLoading = signal(true);
  actionLoading = signal(false);
  toast = signal('');
  error = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orgService.getOrganisationById(id).subscribe({
      next: org => { this.org.set(org); this.isLoading.set(false); },
      error: () => { this.error.set('Failed to load organisation details.'); this.isLoading.set(false); }
    });
  }

  approve() {
    const id = this.org()?.id;
    if (!id) return;
    this.actionLoading.set(true);
    this.orgService.verifyOrganisation(id).subscribe({
      next: updated => {
        this.org.set(updated);
        this.actionLoading.set(false);
        this.showToast('Organisation approved successfully!');
      },
      error: () => this.actionLoading.set(false)
    });
  }

  reject() {
    const id = this.org()?.id;
    if (!id) return;
    this.actionLoading.set(true);
    this.orgService.rejectOrganisation(id).subscribe({
      next: updated => {
        this.org.set(updated);
        this.actionLoading.set(false);
        this.showToast('Organisation rejected.');
      },
      error: () => this.actionLoading.set(false)
    });
  }

  statusLabel(s: string) {
    return s === 'PENDING' ? 'Pending Review' : s === 'VERIFIED' ? 'Verified' : 'Rejected';
  }

  private showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
