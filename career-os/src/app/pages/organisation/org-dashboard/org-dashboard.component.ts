import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganisationService } from '../../../services/organisation.service';
import { StatusPillComponent } from '../../../components/status-pill/status-pill.component';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import { Organisation, CreateOrganisationRequest, UpdateOrganisationRequest, OrgDashboardStats } from '../../../types/upskilling.types';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusPillComponent, FileUploadComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Organisation Dashboard</h1><p>Manage your organisation, courses, badges, and team</p></div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <!-- No org found -->
      <div class="empty-state card" *ngIf="!isLoading() && !activeOrg()">
        <i class="ph ph-buildings" style="font-size:2.5rem;color:var(--color-primary);display:block;margin-bottom:12px;"></i>
        <p style="color:var(--color-text-secondary);margin:0 0 16px;">No active organisation found. Register one from the Organisations page.</p>
        <a routerLink="/organisation" style="display:inline-flex;align-items:center;gap:7px;padding:10px 24px;background:var(--color-primary);color:white;border-radius:9px;text-decoration:none;font-weight:700;font-size:0.9rem;">
          <i class="ph ph-arrow-left"></i> Go to Organisations
        </a>
      </div>

      <!-- â”€â”€ Org view / edit â”€â”€ -->
      <ng-container *ngIf="!isLoading() && activeOrg()">

        <!-- Org bar -->
        <div class="org-bar card">
          <div class="org-ident">
            <div class="org-logo" *ngIf="activeOrg()!.logoUrl; else logoFb">
              <img [src]="activeOrg()!.logoUrl" [alt]="activeOrg()!.name">
            </div>
            <ng-template #logoFb><div class="logo-fb">{{ activeOrg()!.name[0] }}</div></ng-template>
            <div>
              <h3>{{ activeOrg()!.name }}</h3>
              <div class="pill-row">
                <app-status-pill [status]="activeOrg()!.type"></app-status-pill>
                <app-status-pill [status]="activeOrg()!.verificationStatus"></app-status-pill>
              </div>
            </div>
          </div>
          <div class="org-bar-actions">
            <button class="btn-secondary" (click)="toggleEdit()">
              <i class="ph" [class.ph-pencil-simple]="!isEditing()" [class.ph-x]="isEditing()"></i>
              {{ isEditing() ? 'Cancel' : 'Edit Info' }}
            </button>
            <a [routerLink]="['/organisation', activeOrg()!.id]" class="btn-secondary">
              <i class="ph ph-arrow-square-out"></i> Public Page
            </a>
          </div>
        </div>

        <!-- â”€â”€ Edit form â”€â”€ -->
        <div class="card edit-card" *ngIf="isEditing()">
          <h3 class="edit-title"><i class="ph ph-pencil-simple"></i> Edit Organisation Info</h3>
          <form (ngSubmit)="saveEdit()" #editForm="ngForm">
            <div class="form-row">
              <div class="field">
                <label>Organisation Name <span class="req">*</span></label>
                <input type="text" [(ngModel)]="editFormData.name" name="editName" required
                       placeholder="Organisation name" #editNameCtrl="ngModel"
                       [class.input-error]="editNameCtrl.invalid && editNameCtrl.touched">
                <span class="field-hint error" *ngIf="editNameCtrl.invalid && editNameCtrl.touched">Name is required.</span>
              </div>
              <div class="field">
                <label>Website</label>
                <input type="url" [(ngModel)]="editFormData.website" name="editWebsite"
                       placeholder="https://..." pattern="https?://.+"
                       #editWebCtrl="ngModel"
                       [class.input-error]="editWebCtrl.invalid && editWebCtrl.touched">
                <span class="field-hint error" *ngIf="editWebCtrl.invalid && editWebCtrl.touched">Enter a valid URL.</span>
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label>Email Domain</label>
                <input type="text" [(ngModel)]="editFormData.emailDomain" name="editDomain" placeholder="company.com">
              </div>
              <div class="field">
                <label>Logo URL</label>
                <input type="url" [(ngModel)]="editFormData.logoUrl" name="editLogo" placeholder="https://...logo.png">
              </div>
            </div>
            <div class="field">
              <label>Description</label>
              <textarea [(ngModel)]="editFormData.description" name="editDesc" rows="3"
                        placeholder="Brief description of your organisation"></textarea>
            </div>
            <div class="form-error" *ngIf="editError()"><i class="ph ph-warning-circle"></i> {{ editError() }}</div>
            <div class="edit-actions">
              <button type="button" class="btn-cancel" (click)="toggleEdit()">Cancel</button>
              <button type="submit" class="btn-primary btn-save" [disabled]="isSaving() || editForm.invalid">
                {{ isSaving() ? 'Savingâ€¦' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Verification banner -->
        <div class="verify-banner" *ngIf="activeOrg()!.verificationStatus === 'PENDING'">
          <i class="ph ph-warning"></i>
          <div><strong>Verification Pending</strong><p>Upload a verification document to speed up admin review.</p></div>
          <button class="btn-warn" (click)="showVerifyUpload = !showVerifyUpload">Upload Document</button>
        </div>

        <div class="verify-upload card" *ngIf="showVerifyUpload">
          <app-file-upload label="Upload verification document" (fileSelected)="verifyDoc = $event"></app-file-upload>
          <button class="btn-primary" [disabled]="!verifyDoc" (click)="uploadVerifyDoc()">Submit Document</button>
        </div>

        <!-- Stats -->
        <div class="stats-grid" *ngIf="stats()">
          <div class="stat-card">
            <div class="stat-icon"><i class="ph ph-chalkboard-teacher"></i></div>
            <div><span class="stat-n">{{ stats()!.publishedCourses }}</span><span class="stat-l">Published Courses</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="ph ph-users"></i></div>
            <div><span class="stat-n">{{ stats()!.totalEnrollments }}</span><span class="stat-l">Total Enrollments</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="ph ph-medal"></i></div>
            <div><span class="stat-n">{{ stats()!.totalBadgesIssued }}</span><span class="stat-l">Badges Issued</span></div>
          </div>
          <div class="stat-card pending">
            <div class="stat-icon pending"><i class="ph ph-clock"></i></div>
            <div><span class="stat-n">{{ stats()!.pendingVerifications }}</span><span class="stat-l">Pending Reviews</span></div>
          </div>
        </div>

        <!-- Quick actions -->
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
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    /* Create hero */
    .create-hero { text-align: center; padding: 16px 0 24px; }
    .create-hero i { font-size: 2.8rem; color: var(--color-primary); display: block; margin-bottom: 10px; }
    .create-hero h2 { font-size: 1.2rem; font-weight: 800; color: var(--color-text); margin: 0 0 6px; }
    .create-hero p { font-size: 0.88rem; color: var(--color-text-secondary); margin: 0; }
    /* Form */
    .create-form, form { display: flex; flex-direction: column; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { margin-bottom: 14px; }
    .field label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--color-text); margin-bottom: 5px; }
    .req { color: #ef4444; }
    .field-hint { font-size: 0.75rem; color: var(--color-text-tertiary); margin-top: 3px; display: block; }
    .field-hint.error { color: #dc2626; }
    .field input, .field select, .field textarea {
      width: 100%; padding: 9px 12px; border-radius: 9px;
      border: 1px solid var(--color-input-border); background: var(--color-input-bg);
      color: var(--color-text); font-size: 0.875rem; outline: none;
      box-sizing: border-box; font-family: inherit; transition: border-color 0.2s;
    }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    .input-error { border-color: #dc2626 !important; }
    .input-error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.15) !important; }
    .form-error { display: flex; align-items: center; gap: 6px; padding: 9px 12px; background: #fee2e2; color: #991b1b; border-radius: 8px; font-size: 0.82rem; margin-bottom: 12px; }
    .btn-primary { width: 100%; padding: 11px; background: var(--color-primary); color: white; border: none; border-radius: 9px; font-size: 0.9rem; font-weight: 700; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    /* Org bar */
    .org-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .org-ident { display: flex; align-items: center; gap: 14px; }
    .org-logo img, .logo-fb { width: 46px; height: 46px; border-radius: 10px; object-fit: contain; }
    .logo-fb { background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800; }
    .org-ident h3 { font-size: 0.95rem; font-weight: 700; color: var(--color-text); margin: 0 0 4px; }
    .pill-row { display: flex; gap: 6px; }
    .org-bar-actions { display: flex; gap: 8px; }
    .btn-secondary { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; background: var(--color-secondary); color: var(--color-primary); text-decoration: none; font-size: 0.83rem; font-weight: 600; border: none; cursor: pointer; white-space: nowrap; }
    .btn-secondary:hover { opacity: 0.85; }
    /* Edit card */
    .edit-card { border-color: var(--color-primary); }
    .edit-title { font-size: 0.95rem; font-weight: 700; color: var(--color-text); margin: 0 0 18px; display: flex; align-items: center; gap: 7px; }
    .edit-title i { color: var(--color-primary); }
    .edit-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-cancel { padding: 9px 20px; border-radius: 9px; border: 1px solid var(--color-border); background: transparent; color: var(--color-text-secondary); font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-save { width: auto; padding: 9px 24px; }
    /* Verify */
    .verify-banner { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: #fef3c7; border-radius: 12px; margin-bottom: 18px; }
    .verify-banner i { font-size: 1.2rem; color: #d97706; flex-shrink: 0; margin-top: 2px; }
    .verify-banner strong { display: block; font-size: 0.88rem; color: #92400e; margin-bottom: 2px; }
    .verify-banner p { font-size: 0.8rem; color: #92400e; margin: 0; }
    .btn-warn { margin-left: auto; flex-shrink: 0; padding: 7px 13px; border-radius: 7px; background: #d97706; color: white; border: none; font-size: 0.8rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .verify-upload { display: flex; flex-direction: column; gap: 12px; }
    /* Stats */
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
    @media (max-width: 768px) { .page { padding: 20px; } .form-row { grid-template-columns: 1fr; } .org-bar { flex-direction: column; align-items: flex-start; } }
  `]
})
export class OrgDashboardComponent implements OnInit {
  isLoading = signal(true);
  activeOrg = signal<Organisation | null>(null);
  stats = signal<OrgDashboardStats | null>(null);
  isCreating = signal(false);
  isEditing = signal(false);
  isSaving = signal(false);
  createError = signal('');
  editError = signal('');
  toast = signal('');
  showVerifyUpload = false;
  verifyDoc: File | null = null;

  editFormData: UpdateOrganisationRequest = { name: '', website: '', description: '', emailDomain: '', logoUrl: '' };

  constructor(private orgService: OrganisationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const orgId = params['orgId'];
      if (orgId) {
        this.orgService.getOrganisationById(orgId).subscribe({
          next: org => { this.activeOrg.set(org); this.loadStats(org.id); this.isLoading.set(false); },
          error: () => this.isLoading.set(false)
        });
      } else {
        this.orgService.getMyOrganisations().subscribe({
          next: orgs => {
            const verified = orgs.find(o => o.verificationStatus === 'VERIFIED') ?? orgs[0] ?? null;
            if (verified) { this.activeOrg.set(verified); this.loadStats(verified.id); }
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      }
    });
  }

  loadStats(id: string) {
    this.orgService.getDashboardStats(id).subscribe({ next: s => this.stats.set(s), error: () => {} });
  }

  toggleEdit() {
    if (!this.isEditing()) {
      const org = this.activeOrg()!;
      this.editFormData = { name: org.name, website: org.website ?? '', description: org.description ?? '', emailDomain: org.emailDomain ?? '', logoUrl: org.logoUrl ?? '' };
    }
    this.isEditing.update(v => !v);
    this.editError.set('');
  }

  saveEdit() {
    const org = this.activeOrg();
    if (!org || !this.editFormData.name) return;
    this.isSaving.set(true); this.editError.set('');
    this.orgService.updateOrganisation(org.id, this.editFormData).subscribe({
      next: updated => {
        this.activeOrg.set(updated);
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.showToast('Organisation updated successfully!');
      },
      error: err => {
        const msg = err.error?.message || err.error?.error || (err.status === 403 ? 'You do not have permission to edit this organisation.' : 'Failed to save. Please try again.');
        this.editError.set(msg);
        this.isSaving.set(false);
      }
    });
  }

  uploadVerifyDoc() {
    const org = this.activeOrg();
    if (!org || !this.verifyDoc) return;
    this.orgService.uploadVerificationDocument(org.id, this.verifyDoc).subscribe({
      next: () => { this.showVerifyUpload = false; this.showToast('Document uploaded.'); },
      error: () => this.showToast('Upload failed â€” please try again.')
    });
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3500); }
}
