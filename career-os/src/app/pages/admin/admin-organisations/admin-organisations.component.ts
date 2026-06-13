import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Organisation } from '../../../types/upskilling.types';

@Component({
  selector: 'app-admin-organisations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1><i class="ph ph-shield-check"></i> Organisation Approvals</h1>
          <p>Review and approve or reject pending organisation registration requests.</p>
        </div>
      </div>

      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="empty-state" *ngIf="!isLoading() && orgs().length === 0">
        <i class="ph ph-check-circle"></i>
        <h3>No pending requests</h3>
        <p>All organisation registrations have been reviewed.</p>
      </div>

      <div class="org-list" *ngIf="!isLoading() && orgs().length > 0">
        <div class="org-card" *ngFor="let org of orgs()">
          <div class="org-card-left">
            <div class="org-logo">{{ org.name[0].toUpperCase() }}</div>
            <div class="org-info">
              <h3>{{ org.name }}</h3>
              <div class="org-meta">
                <span class="badge type">{{ org.type }}</span>
                <span *ngIf="org.website" class="meta-item">
                  <i class="ph ph-globe"></i> {{ org.website }}
                </span>
                <span *ngIf="org.emailDomain" class="meta-item">
                  <i class="ph ph-envelope"></i> {{ org.emailDomain }}
                </span>
              </div>
              <p class="org-desc" *ngIf="org.description">{{ org.description }}</p>
              <a *ngIf="org.verificationDocumentUrl"
                 [href]="org.verificationDocumentUrl"
                 target="_blank"
                 class="doc-link">
                <i class="ph ph-file-pdf"></i> View Verification Document
              </a>
            </div>
          </div>
          <div class="org-card-actions">
            <button class="btn-approve" (click)="approve(org)" [disabled]="processing()">
              <i class="ph ph-check-circle"></i> Approve
            </button>
            <button class="btn-reject" (click)="reject(org)" [disabled]="processing()">
              <i class="ph ph-x-circle"></i> Reject
            </button>
          </div>
        </div>
      </div>

      <div class="toast" [class.show]="toast()">{{ toast() }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; display: flex; align-items: center; gap: 10px; }
    .page-header h1 i { color: #059669; }
    .page-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
    .org-list { display: flex; flex-direction: column; gap: 16px; }
    .org-card {
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 14px; padding: 20px 24px;
      display: flex; justify-content: space-between; align-items: center; gap: 24px;
    }
    .org-card-left { display: flex; align-items: flex-start; gap: 16px; flex: 1; min-width: 0; }
    .org-logo {
      width: 48px; height: 48px; border-radius: 12px;
      background: #d1fae5; color: #059669;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; font-weight: 800; flex-shrink: 0;
    }
    .org-info { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .org-info h3 { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0; }
    .org-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .badge { font-size: 0.7rem; font-weight: 700; padding: 2px 10px; border-radius: 999px; }
    .badge.type { background: #dbeafe; color: #1d4ed8; }
    .meta-item { font-size: 0.8rem; color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px; }
    .org-desc { font-size: 0.85rem; color: var(--color-text-secondary); margin: 0; }
    .doc-link { font-size: 0.8rem; color: #059669; text-decoration: none; display: flex; align-items: center; gap: 5px; }
    .doc-link:hover { text-decoration: underline; }
    .org-card-actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
    .btn-approve, .btn-reject {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 18px; border-radius: 8px;
      font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none;
      transition: opacity 0.2s;
    }
    .btn-approve { background: #d1fae5; color: #065f46; }
    .btn-approve:hover:not(:disabled) { background: #a7f3d0; }
    .btn-reject { background: #fee2e2; color: #991b1b; }
    .btn-reject:hover:not(:disabled) { background: #fecaca; }
    .btn-approve:disabled, .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px; gap: 8px; color: var(--color-text-tertiary); }
    .empty-state i { font-size: 3rem; color: #059669; }
    .empty-state h3 { font-size: 1rem; font-weight: 700; margin: 0; color: var(--color-text-secondary); }
    .empty-state p { font-size: 0.875rem; margin: 0; }
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: #059669; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 768px) { .page { padding: 20px; } .org-card { flex-direction: column; align-items: flex-start; } .org-card-actions { flex-direction: row; width: 100%; } .btn-approve, .btn-reject { flex: 1; justify-content: center; } }
  `]
})
export class AdminOrganisationsComponent implements OnInit {
  isLoading = signal(true);
  processing = signal(false);
  orgs = signal<Organisation[]>([]);
  toast = signal('');

  private base = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.http.get<Organisation[]>(`${this.base}/organisations/pending`).subscribe({
      next: data => { this.orgs.set(data); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.showToast('Failed to load pending organisations.'); }
    });
  }

  approve(org: Organisation) {
    this.processing.set(true);
    this.http.put<Organisation>(`${this.base}/organisations/${org.id}/verify`, {}).subscribe({
      next: () => {
        this.orgs.update(list => list.filter(o => o.id !== org.id));
        this.processing.set(false);
        this.showToast(`"${org.name}" approved successfully.`);
      },
      error: () => { this.processing.set(false); this.showToast('Failed to approve.'); }
    });
  }

  reject(org: Organisation) {
    this.processing.set(true);
    this.http.put<Organisation>(`${this.base}/organisations/${org.id}/reject`, {}).subscribe({
      next: () => {
        this.orgs.update(list => list.filter(o => o.id !== org.id));
        this.processing.set(false);
        this.showToast(`"${org.name}" rejected.`);
      },
      error: () => { this.processing.set(false); this.showToast('Failed to reject.'); }
    });
  }

  private showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
