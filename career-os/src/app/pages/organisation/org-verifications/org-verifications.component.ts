import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeService } from '../../../services/badge.service';
import { StatusPillComponent } from '../../../components/status-pill/status-pill.component';
import { UniversityCourseConversion, Badge } from '../../../types/upskilling.types';

@Component({
  selector: 'app-org-verifications',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusPillComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Certificate Verifications</h1><p>Review student academic certificate conversion requests</p></div>
        <div class="filter-tabs">
          <button [class.active]="activeFilter() === 'PENDING'" (click)="activeFilter.set('PENDING')">Pending <span class="badge-cnt" *ngIf="pendingCount()">{{ pendingCount() }}</span></button>
          <button [class.active]="activeFilter() === 'ALL'" (click)="activeFilter.set('ALL')">All</button>
        </div>
      </div>

      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="empty-state" *ngIf="!isLoading() && filteredRequests().length === 0">
        <i class="ph ph-seal-check"></i>
        <h3>No {{ activeFilter() === 'PENDING' ? 'pending' : '' }} requests</h3>
        <p>All submissions have been reviewed</p>
      </div>

      <div class="submissions" *ngIf="!isLoading() && filteredRequests().length > 0">
        <div class="sub-card card" *ngFor="let r of filteredRequests()">
          <div class="sub-header">
            <div>
              <div class="uni-row"><i class="ph ph-graduation-cap"></i><h4>{{ r.universityName }}</h4></div>
              <p class="course-nm">{{ r.courseName }}</p>
              <p class="submitted">Submitted {{ r.createdAt | date:'mediumDate' }}</p>
            </div>
            <app-status-pill [status]="r.status"></app-status-pill>
          </div>

          <a *ngIf="r.uploadedDocumentUrl" [href]="r.uploadedDocumentUrl" target="_blank" rel="noopener noreferrer" class="doc-link">
            <i class="ph ph-file-pdf"></i> View Submitted Document
          </a>

          <div class="current-badge" *ngIf="r.badge"><i class="ph ph-medal"></i>Requested badge: <strong>{{ r.badge.name }}</strong></div>

          <div class="reviewer-notes" *ngIf="r.status !== 'PENDING' && r['notes']"><i class="ph ph-note-pencil"></i>{{ r['notes'] }}</div>

          <div class="review-panel" *ngIf="r.status === 'PENDING'">
            <div class="field"><label>Map to Badge</label><select [(ngModel)]="reviewState[r.id].badgeId"><option value="">Select badge…</option><option *ngFor="let b of availableBadges()" [value]="b.id">{{ b.name }}</option></select></div>
            <div class="field"><label>Notes</label><textarea [(ngModel)]="reviewState[r.id].notes" rows="2" placeholder="Optional notes for the applicant…"></textarea></div>
            <div class="review-actions">
              <button class="btn-approve" [disabled]="isReviewing()" (click)="review(r, 'APPROVED')"><i class="ph ph-check-circle"></i> Approve</button>
              <button class="btn-reject" [disabled]="isReviewing()" (click)="review(r, 'REJECTED')"><i class="ph ph-x-circle"></i> Reject</button>
            </div>
          </div>
        </div>
      </div>

      <div class="toast" [class.show]="toast()">{{ toast() }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; }
    .page-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
    .filter-tabs { display: flex; gap: 4px; }
    .filter-tabs button { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text-secondary); font-size: 0.83rem; font-weight: 500; cursor: pointer; }
    .filter-tabs button.active { background: var(--color-primary); color: white; border-color: transparent; font-weight: 700; }
    .badge-cnt { background: white; color: var(--color-primary); font-size: 0.68rem; font-weight: 800; padding: 1px 6px; border-radius: 999px; }
    .submissions { display: flex; flex-direction: column; gap: 14px; }
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 18px 22px; }
    .sub-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .uni-row { display: flex; align-items: center; gap: 7px; margin-bottom: 3px; }
    .uni-row i { color: var(--color-primary); font-size: 1rem; }
    .uni-row h4 { font-size: 0.9rem; font-weight: 700; color: var(--color-text); margin: 0; }
    .course-nm { font-size: 0.83rem; color: var(--color-text-secondary); margin: 0 0 3px; }
    .submitted { font-size: 0.75rem; color: var(--color-text-tertiary); margin: 0; }
    .doc-link { display: inline-flex; align-items: center; gap: 6px; font-size: 0.83rem; color: var(--color-primary); text-decoration: none; margin-bottom: 10px; }
    .doc-link:hover { text-decoration: underline; }
    .current-badge { display: flex; align-items: center; gap: 6px; font-size: 0.83rem; color: var(--color-text-secondary); margin-bottom: 10px; }
    .current-badge i { color: var(--color-primary); }
    .reviewer-notes { display: flex; gap: 6px; font-size: 0.8rem; color: var(--color-text-secondary); background: var(--color-surface-secondary); border-radius: 8px; padding: 9px 11px; margin-top: 8px; }
    .review-panel { border-top: 1px solid var(--color-border); padding-top: 14px; margin-top: 4px; }
    .field { margin-bottom: 10px; }
    .field label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--color-text); margin-bottom: 4px; }
    .field select, .field textarea { width: 100%; padding: 8px 11px; border-radius: 8px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; box-sizing: border-box; font-family: inherit; }
    .field select:focus, .field textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    .review-actions { display: flex; gap: 9px; }
    .btn-approve, .btn-reject { display: flex; align-items: center; gap: 5px; padding: 8px 18px; border-radius: 8px; font-size: 0.875rem; font-weight: 700; cursor: pointer; border: none; }
    .btn-approve { background: var(--color-primary); color: white; }
    .btn-reject { background: #fee2e2; color: #dc2626; }
    .btn-approve:hover:not(:disabled), .btn-reject:hover:not(:disabled) { opacity: 0.9; }
    .btn-approve:disabled, .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 9px; color: var(--color-text-tertiary); }
    .empty-state i { font-size: 2.8rem; }
    .empty-state h3 { font-size: 0.95rem; font-weight: 700; margin: 0; color: var(--color-text-secondary); }
    .empty-state p { font-size: 0.875rem; margin: 0; }
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 768px) { .page { padding: 20px; } .page-header { flex-direction: column; gap: 14px; } }
  `]
})
export class OrgVerificationsComponent implements OnInit {
  isLoading = signal(true);
  allRequests = signal<UniversityCourseConversion[]>([]);
  availableBadges = signal<Badge[]>([]);
  activeFilter = signal<'PENDING' | 'ALL'>('PENDING');
  isReviewing = signal(false);
  toast = signal('');
  reviewState: Record<string, { badgeId: string; notes: string }> = {};

  get filteredRequests() { return () => this.activeFilter() === 'PENDING' ? this.allRequests().filter(r => r.status === 'PENDING') : this.allRequests(); }
  get pendingCount() { return () => this.allRequests().filter(r => r.status === 'PENDING').length; }

  constructor(private badgeService: BadgeService) {}

  ngOnInit() {
    this.badgeService.getPendingConversions().subscribe({
      next: data => { this.allRequests.set(data); data.forEach(r => { this.reviewState[r.id] = { badgeId: r.mappedBadgeId ?? '', notes: '' }; }); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
    this.badgeService.getAllBadges().subscribe({ next: b => this.availableBadges.set(b), error: () => {} });
  }

  review(r: UniversityCourseConversion, status: 'APPROVED' | 'REJECTED') {
    const state = this.reviewState[r.id];
    this.isReviewing.set(true);
    this.badgeService.reviewConversion(r.id, { status, badgeId: state?.badgeId || undefined, notes: state?.notes || undefined }).subscribe({
      next: u => { this.allRequests.update(l => l.map(x => x.id === u.id ? u : x)); this.isReviewing.set(false); this.showToast(status === 'APPROVED' ? 'Request approved!' : 'Request rejected.'); },
      error: () => { this.isReviewing.set(false); this.showToast('Action failed.'); }
    });
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3000); }
}
