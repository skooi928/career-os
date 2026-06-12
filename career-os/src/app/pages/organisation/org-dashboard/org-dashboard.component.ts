import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganisationService } from '../../../services/organisation.service';
import { StatusPillComponent } from '../../../components/status-pill/status-pill.component';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import { Organisation, CreateOrganisationRequest, OrgDashboardStats } from '../../../types/upskilling.types';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusPillComponent, FileUploadComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Organisation Dashboard</h1><p>Manage your organisation, courses, badges, and team</p></div>
      </div>

      <!-- Create Org -->
      <div class="create-org card" *ngIf="!isLoading() && !activeOrg()">
        <div class="create-hero">
          <i class="ph ph-buildings"></i>
          <h2>Create Your Organisation</h2>
          <p>Set up your company or university to publish courses, issue badges, and manage your team.</p>
        </div>
        <form class="create-form" (ngSubmit)="createOrg()" #orgForm="ngForm">
          <div class="form-row">
            <div class="field"><label>Name <span class="req">*</span></label><input type="text" [(ngModel)]="createForm.name" name="name" required placeholder="TechCorp Malaysia"></div>
            <div class="field"><label>Type <span class="req">*</span></label><select [(ngModel)]="createForm.type" name="type" required><option value="">Select…</option><option value="INDUSTRY">Industry / Company</option><option value="UNIVERSITY">University</option></select></div>
          </div>
          <div class="form-row">
            <div class="field"><label>Website</label><input type="url" [(ngModel)]="createForm.website" name="website" placeholder="https://..."></div>
            <div class="field"><label>Email Domain</label><input type="text" [(ngModel)]="createForm.emailDomain" name="domain" placeholder="company.com"></div>
          </div>
          <div class="field"><label>Description</label><textarea [(ngModel)]="createForm.description" name="desc" rows="3" placeholder="Brief description"></textarea></div>
          <div class="field"><label>Verification Document</label><app-file-upload label="Upload company/university registration" (fileSelected)="verifyDoc = $event"></app-file-upload></div>
          <div class="form-error" *ngIf="createError()">{{ createError() }}</div>
          <button type="submit" class="btn-primary" [disabled]="isCreating() || !orgForm.valid || !createForm.type">{{ isCreating() ? 'Creating…' : 'Create Organisation' }}</button>
        </form>
      </div>

      <!-- Org view -->
      <ng-container *ngIf="activeOrg()">
        <div class="org-bar card">
          <div class="org-ident">
            <div class="org-logo" *ngIf="activeOrg()!.logoUrl; else logoFb"><img [src]="activeOrg()!.logoUrl" [alt]="activeOrg()!.name"></div>
            <ng-template #logoFb><div class="logo-fb">{{ activeOrg()!.name[0] }}</div></ng-template>
            <div>
              <h3>{{ activeOrg()!.name }}</h3>
              <div class="pill-row"><app-status-pill [status]="activeOrg()!.type"></app-status-pill><app-status-pill [status]="activeOrg()!.verificationStatus"></app-status-pill></div>
            </div>
          </div>
          <a [routerLink]="['/organisation', activeOrg()!.id]" class="btn-secondary"><i class="ph ph-arrow-square-out"></i> View Public Page</a>
        </div>

        <div class="verify-banner" *ngIf="activeOrg()!.verificationStatus === 'PENDING'">
          <i class="ph ph-warning"></i>
          <div><strong>Verification Pending</strong><p>Upload a verification document to speed up admin review.</p></div>
          <button class="btn-warn" (click)="showVerifyUpload = !showVerifyUpload">Upload Document</button>
        </div>

        <div class="verify-upload card" *ngIf="showVerifyUpload">
          <app-file-upload label="Upload verification document" (fileSelected)="verifyDoc = $event"></app-file-upload>
          <button class="btn-primary" [disabled]="!verifyDoc" (click)="uploadVerifyDoc()">Submit Document</button>
        </div>

        <div class="stats-grid" *ngIf="stats()">
          <div class="stat-card"><div class="stat-icon"><i class="ph ph-chalkboard-teacher"></i></div><div><span class="stat-n">{{ stats()!.publishedCourses }}</span><span class="stat-l">Published Courses</span></div></div>
          <div class="stat-card"><div class="stat-icon"><i class="ph ph-users"></i></div><div><span class="stat-n">{{ stats()!.totalEnrollments }}</span><span class="stat-l">Total Enrollments</span></div></div>
          <div class="stat-card"><div class="stat-icon"><i class="ph ph-medal"></i></div><div><span class="stat-n">{{ stats()!.totalBadgesIssued }}</span><span class="stat-l">Badges Issued</span></div></div>
          <div class="stat-card pending"><div class="stat-icon pending"><i class="ph ph-clock"></i></div><div><span class="stat-n">{{ stats()!.pendingVerifications }}</span><span class="stat-l">Pending Reviews</span></div></div>
        </div>

        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-grid">
            <a routerLink="/organisation/courses" class="action-card"><i class="ph ph-chalkboard-teacher"></i><span>Manage Courses</span></a>
            <a routerLink="/organisation/members" class="action-card"><i class="ph ph-users-three"></i><span>Manage Members</span></a>
            <a routerLink="/organisation/verifications" class="action-card" *ngIf="activeOrg()!.type === 'UNIVERSITY'"><i class="ph ph-seal-check"></i><span>Review Verifications</span></a>
          </div>
        </div>
      </ng-container>

      <div class="toast" [class.show]="toast()">{{ toast() }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; }
    .page-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
    .create-hero { text-align: center; padding: 16px 0 24px; }
    .create-hero i { font-size: 2.8rem; color: var(--color-primary); display: block; margin-bottom: 10px; }
    .create-hero h2 { font-size: 1.2rem; font-weight: 800; color: var(--color-text); margin: 0 0 6px; }
    .create-hero p { font-size: 0.88rem; color: var(--color-text-secondary); margin: 0; }
    .create-form { display: flex; flex-direction: column; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { margin-bottom: 14px; }
    .field label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--color-text); margin-bottom: 5px; }
    .req { color: #ef4444; }
    .field input, .field select, .field textarea { width: 100%; padding: 9px 12px; border-radius: 9px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; box-sizing: border-box; font-family: inherit; }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    .form-error { padding: 9px 12px; background: #fee2e2; color: #991b1b; border-radius: 8px; font-size: 0.8rem; margin-bottom: 10px; }
    .btn-primary { width: 100%; padding: 11px; background: var(--color-primary); color: white; border: none; border-radius: 9px; font-size: 0.9rem; font-weight: 700; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .org-bar { display: flex; align-items: center; justify-content: space-between; }
    .org-ident { display: flex; align-items: center; gap: 14px; }
    .org-logo img, .logo-fb { width: 46px; height: 46px; border-radius: 10px; object-fit: contain; }
    .logo-fb { background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800; }
    .org-ident h3 { font-size: 0.95rem; font-weight: 700; color: var(--color-text); margin: 0 0 4px; }
    .pill-row { display: flex; gap: 6px; }
    .btn-secondary { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; background: var(--color-secondary); color: var(--color-primary); text-decoration: none; font-size: 0.83rem; font-weight: 600; }
    .verify-banner { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: #fef3c7; border-radius: 12px; margin-bottom: 18px; }
    .verify-banner i { font-size: 1.2rem; color: #d97706; flex-shrink: 0; margin-top: 2px; }
    .verify-banner strong { display: block; font-size: 0.88rem; color: #92400e; margin-bottom: 2px; }
    .verify-banner p { font-size: 0.8rem; color: #92400e; margin: 0; }
    .btn-warn { margin-left: auto; flex-shrink: 0; padding: 7px 13px; border-radius: 7px; background: #d97706; color: white; border: none; font-size: 0.8rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .verify-upload { display: flex; flex-direction: column; gap: 12px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
    .stat-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 16px 18px; display: flex; align-items: center; gap: 12px; }
    .stat-icon { width: 42px; height: 42px; background: var(--color-secondary); border-radius: 9px; display: flex; align-items: center; justify-content: center; color: var(--color-primary); font-size: 1.2rem; flex-shrink: 0; }
    .stat-icon.pending { background: #fef3c7; color: #d97706; }
    .stat-n { display: block; font-size: 1.5rem; font-weight: 800; color: var(--color-text); line-height: 1; }
    .stat-l { display: block; font-size: 0.75rem; color: var(--color-text-secondary); }
    .quick-actions h3 { font-size: 0.95rem; font-weight: 700; color: var(--color-text); margin: 0 0 14px; }
    .action-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .action-card { display: flex; align-items: center; gap: 9px; padding: 12px 18px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; text-decoration: none; color: var(--color-text); font-weight: 600; font-size: 0.875rem; transition: all 0.2s; }
    .action-card i { font-size: 1.2rem; color: var(--color-primary); }
    .action-card:hover { border-color: var(--color-primary); background: var(--color-secondary); }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .page { padding: 20px; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class OrgDashboardComponent implements OnInit {
  isLoading = signal(true);
  activeOrg = signal<Organisation | null>(null);
  stats = signal<OrgDashboardStats | null>(null);
  isCreating = signal(false);
  createError = signal('');
  toast = signal('');
  showVerifyUpload = false;
  verifyDoc: File | null = null;
  createForm: CreateOrganisationRequest = { name: '', type: 'INDUSTRY', website: '', description: '', emailDomain: '' };

  constructor(private orgService: OrganisationService) {}

  ngOnInit() {
    this.orgService.getMyOrganisations().subscribe({
      next: orgs => { if (orgs.length > 0) { this.activeOrg.set(orgs[0]); this.loadStats(orgs[0].id); } this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  loadStats(id: string) {
    this.orgService.getDashboardStats(id).subscribe({ next: s => this.stats.set(s), error: () => {} });
  }

  createOrg() {
    if (!this.createForm.name || !this.createForm.type) return;
    this.isCreating.set(true); this.createError.set('');
    this.orgService.createOrganisation(this.createForm).subscribe({
      next: org => { this.activeOrg.set(org); this.isCreating.set(false); this.showToast('Organisation created!'); if (this.verifyDoc) this.uploadVerifyDoc(); },
      error: () => { this.createError.set('Failed to create. Please try again.'); this.isCreating.set(false); }
    });
  }

  uploadVerifyDoc() {
    const org = this.activeOrg();
    if (!org || !this.verifyDoc) return;
    this.orgService.uploadVerificationDocument(org.id, this.verifyDoc).subscribe({ next: () => { this.showVerifyUpload = false; this.showToast('Document uploaded.'); }, error: () => this.showToast('Upload failed.') });
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3000); }
}
