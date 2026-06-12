import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganisationService } from '../../../services/organisation.service';
import { AuthService } from '../../../services/auth.service';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import { Organisation, CreateOrganisationRequest } from '../../../types/upskilling.types';

type View = 'list' | 'create';
type UploadState = { orgId: string; error: string; uploading: boolean } | null;

@Component({
  selector: 'app-org-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FileUploadComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1><i class="ph ph-buildings"></i> Organisations</h1>
          <p *ngIf="isAdmin()">Review and manage all registered organisations.</p>
          <p *ngIf="isEmployer()">Browse verified organisations or register your own.</p>
          <p *ngIf="!isAdmin() && !isEmployer()">Browse verified organisations on CareerOS.</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin/organisations" class="btn-secondary header-btn" *ngIf="isAdmin()">
            <i class="ph ph-clock-countdown"></i> Pending Reviews
          </a>
          <button class="btn-primary header-btn" (click)="setView('create')" *ngIf="isEmployer() && view() !== 'create'">
            <i class="ph ph-plus-circle"></i> Register Organisation
          </button>
          <button class="btn-secondary header-btn" (click)="setView('list')" *ngIf="isEmployer() && view() === 'create'">
            <i class="ph ph-arrow-left"></i> Back to List
          </button>
        </div>
      </div>

      <!-- ── Admin: Pending Approvals ── -->
      <div class="section" *ngIf="view() === 'list' && isAdmin() && !isLoading() && pendingOrgs().length > 0">
        <h2 class="section-title">
          <i class="ph ph-clock-countdown"></i> Pending Approvals
          <span class="count-badge">{{ pendingOrgs().length }}</span>
        </h2>
        <div class="review-cards">
          <div class="review-card" *ngFor="let org of pendingOrgs()">
            <div class="org-avatar">{{ org.name[0].toUpperCase() }}</div>
            <div class="review-card-info">
              <div class="review-card-name">{{ org.name }}</div>
              <div class="review-card-meta">
                <span class="type-badge">{{ org.type }}</span>
                <span class="text-muted" *ngIf="org.emailDomain">{{ org.emailDomain }}</span>
                <span class="text-muted" *ngIf="org.createdAt">Submitted {{ org.createdAt | date:'d MMM y' }}</span>
              </div>
              <p class="review-card-desc" *ngIf="org.description">{{ org.description }}</p>
            </div>
            <a [routerLink]="['/organisation', org.id, 'review']" class="review-btn">
              <i class="ph ph-magnifying-glass"></i> Review
            </a>
          </div>
        </div>
      </div>

      <!-- ── Admin: Verified Organisations (card grid) ── -->
      <div class="section" *ngIf="view() === 'list' && isAdmin()">
        <h2 class="section-title"><i class="ph ph-buildings"></i> Organisations</h2>
        <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>
        <div class="empty-state" *ngIf="!isLoading() && approvedAdminOrgs().length === 0">
          <i class="ph ph-buildings"></i><p>No organisations yet.</p>
        </div>
        <div class="org-grid" *ngIf="!isLoading() && approvedAdminOrgs().length > 0">
          <div class="org-card admin-org-card" *ngFor="let org of approvedAdminOrgs()">
            <div class="org-card-logo">{{ org.name[0].toUpperCase() }}</div>
            <div class="org-card-info">
              <div class="org-card-name">{{ org.name }}</div>
              <span class="type-badge">{{ org.type }}</span>
              <p class="org-card-desc" *ngIf="org.description">{{ org.description }}</p>
            </div>
            <a [routerLink]="['/organisation', org.id, 'review']" class="review-btn-sm">
              <i class="ph ph-magnifying-glass"></i> Review
            </a>
          </div>
        </div>
      </div>
      <!-- ── My Applications status tracker (employer only) ── -->
      <div class="section" *ngIf="view() === 'list' && isEmployer() && myOrgs().length > 0">
        <div class="my-orgs-list">
          <div class="my-org-card" *ngFor="let org of myOrgs()" [class]="'status-' + org.verificationStatus.toLowerCase()">
            <div class="my-org-left">
              <div class="org-avatar">{{ org.name[0].toUpperCase() }}</div>
              <div>
                <div class="my-org-name">{{ org.name }}</div>
                <div class="my-org-meta">
                  <span class="type-badge">{{ org.type }}</span>
                  <span class="my-org-date" *ngIf="org.createdAt">Submitted {{ org.createdAt | date:'d MMM y' }}</span>
                </div>
                <div class="my-org-url" *ngIf="org.website">
                  <i class="ph ph-globe"></i> {{ org.website }}
                </div>
              </div>
            </div>
            <div class="status-badge-group">
              <div class="status-pill" [class]="'pill-' + org.verificationStatus.toLowerCase()">
                <i class="ph" [class.ph-clock]="org.verificationStatus === 'PENDING'"
                             [class.ph-check-circle]="org.verificationStatus === 'VERIFIED'"
                             [class.ph-x-circle]="org.verificationStatus === 'REJECTED'"></i>
                {{ statusLabel(org.verificationStatus) }}
              </div>
              <!-- Missing doc warning -->
              <div class="missing-doc" *ngIf="org.verificationStatus === 'PENDING' && !org.verificationDocumentUrl">
                <span class="missing-doc-label"><i class="ph ph-warning"></i> No document</span>
                <label class="upload-doc-btn">
                  <i class="ph" [class.ph-spinner]="uploadState()?.orgId === org.id && uploadState()!.uploading"
                               [class.ph-upload-simple]="!(uploadState()?.orgId === org.id && uploadState()!.uploading)"></i>
                  {{ uploadState()?.orgId === org.id && uploadState()!.uploading ? 'Uploading…' : 'Upload Doc' }}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none"
                         (change)="retryDocUpload(org.id, $event)">
                </label>
                <span class="upload-error" *ngIf="uploadState()?.orgId === org.id && uploadState()!.error">
                  {{ uploadState()!.error }}
                </span>
              </div>
              <a [routerLink]="['/organisation/dashboard']" [queryParams]="{orgId: org.id}" class="manage-btn"
                 *ngIf="org.verificationStatus === 'VERIFIED'">
                <i class="ph ph-gear"></i> Manage
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Create form (employer only) ── -->
      <div class="create-card" *ngIf="isEmployer() && view() === 'create'">
        <div class="create-header">
          <div class="create-icon"><i class="ph ph-buildings"></i></div>
          <div>
            <h2>Register Your Organisation</h2>
            <p>Fill in the details below. A <strong>verification document is required</strong> before submission.</p>
          </div>
        </div>

        <form class="create-form" (ngSubmit)="submit()" #orgForm="ngForm">
          <!-- Step indicator -->
          <div class="steps">
            <div class="step" [class.done]="createForm.name && createForm.type && createForm.website && createForm.emailDomain && createForm.description">
              <div class="step-num">1</div><span>Basic Info</span>
            </div>
            <div class="step-sep"></div>
            <div class="step" [class.done]="verifyDoc !== null">
              <div class="step-num">2</div><span>Verification Doc</span>
            </div>
            <div class="step-sep"></div>
            <div class="step" [class.done]="submitted()">
              <div class="step-num">3</div><span>Submit</span>
            </div>
          </div>

          <div class="form-section">
            <h3 class="form-section-title">Basic Information</h3>
            <div class="form-row">
              <div class="field">
                <label>Organisation Name <span class="req">*</span></label>
                <input type="text" [(ngModel)]="createForm.name" name="name" required
                       placeholder="e.g. TechCorp Malaysia" #nameCtrl="ngModel"
                       [class.input-error]="nameCtrl.invalid && nameCtrl.touched">
                <span class="field-error" *ngIf="nameCtrl.invalid && nameCtrl.touched">
                  <i class="ph ph-warning-circle"></i> Name is required.
                </span>
              </div>
              <div class="field">
                <label>Organisation Type <span class="req">*</span></label>
                <select [(ngModel)]="createForm.type" name="type" required #typeCtrl="ngModel"
                        [class.input-error]="typeCtrl.invalid && typeCtrl.touched">
                  <option value="">— Select type —</option>
                  <option value="INDUSTRY">Industry / Company</option>
                  <option value="UNIVERSITY">University</option>
                </select>
                <span class="field-error" *ngIf="typeCtrl.invalid && typeCtrl.touched">
                  <i class="ph ph-warning-circle"></i> Please select a type.
                </span>
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label>Official Website <span class="req">*</span></label>
                <input type="url" [(ngModel)]="createForm.website" name="website" required
                       placeholder="https://company.com" #websiteCtrl="ngModel"
                       pattern="https?://.+"
                       [class.input-error]="websiteCtrl.invalid && websiteCtrl.touched">
                <span class="field-error" *ngIf="websiteCtrl.invalid && websiteCtrl.touched">
                  <i class="ph ph-warning-circle"></i> A valid website URL is required (https://...).
                </span>
              </div>
              <div class="field">
                <label>Corporate Email Domain <span class="req">*</span></label>
                <input type="text" [(ngModel)]="createForm.emailDomain" name="emailDomain" required
                       placeholder="company.com" #domainCtrl="ngModel"
                       pattern="^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                       [class.input-error]="domainCtrl.invalid && domainCtrl.touched">
                <span class="field-hint" *ngIf="!domainCtrl.invalid || !domainCtrl.touched">Used to verify member emails belong to your organisation.</span>
                <span class="field-error" *ngIf="domainCtrl.invalid && domainCtrl.touched">
                  <i class="ph ph-warning-circle"></i> Enter your corporate email domain (e.g. company.com).
                </span>
              </div>
            </div>
            <div class="field">
              <label>Organisation Description <span class="req">*</span></label>
              <textarea [(ngModel)]="createForm.description" name="description" required rows="4"
                        placeholder="Describe your organisation — what you do, your mission, industry, and why you're registering on CareerOS."
                        #descCtrl="ngModel"
                        [class.input-error]="descCtrl.invalid && descCtrl.touched"></textarea>
              <span class="field-error" *ngIf="descCtrl.invalid && descCtrl.touched">
                <i class="ph ph-warning-circle"></i> Please provide a description of your organisation.
              </span>
            </div>
          </div>

          <div class="form-section doc-section" [class.doc-missing]="docTouched && !verifyDoc">
            <h3 class="form-section-title">
              Verification Document <span class="req">*</span>
              <span class="doc-badge" *ngIf="verifyDoc"><i class="ph ph-check-circle"></i> Uploaded</span>
            </h3>
            <div class="doc-info-box">
              <i class="ph ph-info"></i>
              <div>
                <strong>Why is this required?</strong>
                <p>To maintain platform integrity, all organisations must submit an official document proving their legitimacy before being approved. Accepted documents:</p>
                <ul>
                  <li>Company registration certificate (SSM / equivalent)</li>
                  <li>Business license</li>
                  <li>University or institution accreditation letter</li>
                </ul>
              </div>
            </div>
            <app-file-upload
              label="Upload registration document / business cert (PDF, JPG, PNG)"
              (fileSelected)="onDocSelected($event)">
            </app-file-upload>
            <div class="field-error doc-error" *ngIf="docTouched && !verifyDoc">
              <i class="ph ph-warning-circle"></i> A verification document is required before you can submit.
            </div>
          </div>

          <div class="form-error" *ngIf="createError()">
            <i class="ph ph-warning-circle"></i>
            <div>
              <strong>Submission failed</strong>
              <p>{{ createError() }}</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="setView('list')">Cancel</button>
            <button type="submit" class="btn-submit"
                    [disabled]="isSubmitting() || orgForm.invalid || !createForm.type"
                    (click)="markDocTouched()">
              <i class="ph ph-paper-plane-tilt"></i>
              {{ isSubmitting() ? 'Submitting…' : 'Submit Application' }}
            </button>
          </div>
        </form>
      </div>

      <!-- ── Verified orgs list (candidate + employer only) ── -->
      <div class="section" *ngIf="view() === 'list' && !isAdmin()">
        <h2 class="section-title">Verified Organisations</h2>
        <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>
        <div class="empty-state" *ngIf="!isLoading() && verifiedOrgs().length === 0">
          <i class="ph ph-buildings"></i>
          <p>No verified organisations yet.</p>
        </div>
        <div class="org-grid" *ngIf="!isLoading()">
          <a class="org-card" *ngFor="let org of verifiedOrgs()"
             [routerLink]="['/organisation', org.id]">
            <div class="org-card-logo">{{ org.name[0].toUpperCase() }}</div>
            <div class="org-card-info">
              <div class="org-card-name">{{ org.name }}</div>
              <span class="type-badge">{{ org.type }}</span>
              <p class="org-card-desc" *ngIf="org.description">{{ org.description }}</p>
            </div>
            <i class="ph ph-arrow-right card-arrow"></i>
          </a>
        </div>
      </div>

      <div class="toast success-toast" [class.show]="toast()">
        <i class="ph ph-check-circle"></i> {{ toast() }}
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
    .header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; display: flex; align-items: center; gap: 10px; }
    .page-header h1 i { color: var(--color-primary); }
    .page-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
    .header-btn { display: flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 9px; font-size: 0.875rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
    .btn-primary { background: var(--color-primary); color: white; border: none; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary { background: var(--color-secondary); color: var(--color-primary); border: 1px solid var(--color-border); }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0 0 14px; }

    /* My orgs */
    .my-orgs-list { display: flex; flex-direction: column; gap: 12px; }
    .my-org-card {
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 14px; padding: 16px 20px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      border-left: 4px solid var(--color-border);
    }
    .my-org-card.status-pending { border-left-color: #f59e0b; }
    .my-org-card.status-verified { border-left-color: #10b981; }
    .my-org-card.status-rejected { border-left-color: #ef4444; }
    .my-org-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .org-avatar { width: 44px; height: 44px; border-radius: 10px; background: var(--color-secondary); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800; flex-shrink: 0; }
    .my-org-name { font-weight: 700; font-size: 0.95rem; color: var(--color-text); }
    .my-org-meta { display: flex; align-items: center; gap: 8px; margin: 3px 0; }
    .my-org-date { font-size: 0.75rem; color: var(--color-text-tertiary); }
    .my-org-url { font-size: 0.78rem; color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px; }
    .type-badge { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #dbeafe; color: #1d4ed8; }
    .status-badge-group { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .status-pill { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; }
    .pill-pending { background: #fef3c7; color: #92400e; }
    .pill-verified { background: #d1fae5; color: #065f46; }
    .pill-rejected { background: #fee2e2; color: #991b1b; }
    .manage-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 8px; background: var(--color-secondary); color: var(--color-primary); text-decoration: none; font-size: 0.8rem; font-weight: 600; }
    .missing-doc { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .missing-doc-label { font-size: 0.72rem; color: #d97706; font-weight: 600; display: flex; align-items: center; gap: 3px; }
    .upload-doc-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 8px; background: #fef3c7; color: #92400e; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: 1px solid #fcd34d; white-space: nowrap; }
    .upload-doc-btn:hover { background: #fde68a; }
    .upload-error { font-size: 0.7rem; color: #dc2626; max-width: 160px; text-align: right; }

    /* Create form */
    .create-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 28px; margin-bottom: 32px; }
    .create-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
    .create-icon { width: 52px; height: 52px; border-radius: 14px; background: var(--color-secondary); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0; }
    .create-header h2 { font-size: 1.1rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; }
    .create-header p { font-size: 0.85rem; color: var(--color-text-secondary); margin: 0; }
    /* Steps */
    .steps { display: flex; align-items: center; margin-bottom: 28px; }
    .step { display: flex; align-items: center; gap: 7px; font-size: 0.8rem; font-weight: 600; color: var(--color-text-tertiary); }
    .step.done { color: var(--color-primary); }
    .step-num { width: 24px; height: 24px; border-radius: 50%; background: var(--color-border); color: var(--color-text-secondary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; }
    .step.done .step-num { background: var(--color-primary); color: white; }
    .step-sep { flex: 1; height: 2px; background: var(--color-border); margin: 0 10px; max-width: 60px; }
    /* Form sections */
    .form-section { margin-bottom: 24px; padding: 20px; background: var(--color-bg); border-radius: 12px; border: 1px solid var(--color-border); }
    .form-section-title { font-size: 0.88rem; font-weight: 700; color: var(--color-text); margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
    .doc-badge { font-size: 0.75rem; font-weight: 600; color: #059669; display: flex; align-items: center; gap: 4px; margin-left: 4px; }
    .doc-section { border-color: var(--color-border); }
    .doc-section.doc-missing { border-color: #fca5a5; background: #fff5f5; }
    .doc-desc { font-size: 0.82rem; color: var(--color-text-secondary); margin: 0 0 14px; }
    .doc-info-box { display: flex; gap: 12px; padding: 12px 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; margin-bottom: 14px; font-size: 0.82rem; color: #1e40af; }
    .doc-info-box i { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
    .doc-info-box strong { display: block; margin-bottom: 4px; font-size: 0.83rem; }
    .doc-info-box p { margin: 0 0 6px; }
    .doc-info-box ul { margin: 0; padding-left: 16px; }
    .doc-info-box ul li { margin-bottom: 2px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { margin-bottom: 14px; }
    .field label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--color-text); margin-bottom: 5px; }
    .req { color: #ef4444; }
    .field-hint { font-size: 0.75rem; color: var(--color-text-tertiary); margin-top: 3px; display: block; }
    .field-error { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; color: #dc2626; margin-top: 4px; }
    .doc-error { margin-top: 8px; font-size: 0.82rem; }
    .field input, .field select, .field textarea {
      width: 100%; padding: 9px 12px; border-radius: 9px;
      border: 1px solid var(--color-input-border); background: var(--color-input-bg);
      color: var(--color-text); font-size: 0.875rem; outline: none;
      box-sizing: border-box; font-family: inherit; transition: border-color 0.2s;
    }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    .input-error { border-color: #dc2626 !important; }
    .input-error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.15) !important; }
    .form-error { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; background: #fee2e2; color: #991b1b; border-radius: 10px; font-size: 0.85rem; margin-bottom: 16px; }
    .form-error i { font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }
    .form-error strong { display: block; margin-bottom: 2px; }
    .form-error p { margin: 0; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-cancel { padding: 10px 20px; border-radius: 9px; border: 1px solid var(--color-border); background: transparent; color: var(--color-text-secondary); font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-submit { display: flex; align-items: center; gap: 7px; padding: 10px 22px; border-radius: 9px; background: var(--color-primary); color: white; border: none; font-size: 0.9rem; font-weight: 700; cursor: pointer; }
    .btn-submit:hover:not(:disabled) { opacity: 0.9; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    /* Org grid */
    .org-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .org-card { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 14px; text-decoration: none; color: var(--color-text); transition: all 0.2s; }
    .org-card:hover { border-color: var(--color-primary); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .org-card-logo { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, var(--color-primary), #059669); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; flex-shrink: 0; }
    .org-card-info { flex: 1; min-width: 0; }
    .org-card-name { font-weight: 700; font-size: 0.9rem; margin-bottom: 4px; }
    .org-card-desc { font-size: 0.78rem; color: var(--color-text-secondary); margin: 5px 0 0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .card-arrow { color: var(--color-text-tertiary); font-size: 1.1rem; flex-shrink: 0; }
    /* Admin review cards */
    .count-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 22px; border-radius: 999px; background: #f59e0b; color: white; font-size: 0.72rem; font-weight: 800; margin-left: 6px; padding: 0 5px; }
    .review-cards { display: flex; flex-direction: column; gap: 12px; }
    .review-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 14px; border-left: 4px solid var(--color-primary); }
    .review-card-info { flex: 1; min-width: 0; }
    .review-card-name { font-weight: 700; font-size: 0.95rem; color: var(--color-text); margin-bottom: 4px; }
    .review-card-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
    .review-card-desc { font-size: 0.8rem; color: var(--color-text-secondary); margin: 0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .review-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 9px; background: var(--color-primary); color: white; font-size: 0.82rem; font-weight: 700; text-decoration: none; white-space: nowrap; flex-shrink: 0; }
    .review-btn:hover { opacity: 0.9; }
    .review-btn-sm { display: inline-flex; align-items: center; gap: 5px; padding: 6px 13px; border-radius: 7px; background: var(--color-secondary); color: var(--color-primary); font-size: 0.75rem; font-weight: 700; text-decoration: none; white-space: nowrap; flex-shrink: 0; border: 1px solid var(--color-border); transition: all 0.2s; }
    .review-btn-sm:hover { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .admin-org-card { cursor: default; }
    .admin-org-card:hover { transform: none; box-shadow: none; }
    /* Admin table */
    .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .admin-header .section-title { margin-bottom: 0; display: flex; align-items: center; gap: 8px; }
    .admin-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #fef3c7; color: #92400e; letter-spacing: 0.03em; text-transform: uppercase; }
    .admin-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--color-border); }
    .admin-table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
    .admin-table thead { background: var(--color-secondary); }
    .admin-table th { padding: 10px 14px; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--color-border); }
    .admin-table td { padding: 12px 14px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
    .admin-table tbody tr:last-child td { border-bottom: none; }
    .admin-table tbody tr:hover { background: var(--color-secondary); }
    .admin-table tr.row-pending { background: #fffbeb; }
    .admin-table tr.row-rejected { background: #fff5f5; }
    .admin-org-name { display: flex; align-items: center; gap: 10px; }
    .org-avatar.sm { width: 32px; height: 32px; font-size: 0.95rem; }
    .font-bold { font-weight: 700; color: var(--color-text); }
    .org-domain { font-size: 0.72rem; color: var(--color-text-tertiary); }
    .text-muted { color: var(--color-text-tertiary); font-size: 0.8rem; }
    .website-link { font-size: 0.78rem; color: var(--color-primary); text-decoration: none; display: flex; align-items: center; gap: 3px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .website-link:hover { text-decoration: underline; }
    .admin-actions { display: flex; align-items: center; gap: 6px; }
    .action-btn { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 0.76rem; font-weight: 700; cursor: pointer; border: 1px solid transparent; white-space: nowrap; }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .doc-btn { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; text-decoration: none; }
    .doc-btn:hover { background: #dbeafe; }
    .approve-btn { background: #d1fae5; color: #065f46; border-color: #6ee7b7; }
    .approve-btn:hover:not(:disabled) { background: #a7f3d0; }
    .reject-btn { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
    .reject-btn:hover:not(:disabled) { background: #fecaca; }
    /* Misc */
    .loading-state { display: flex; justify-content: center; padding: 40px; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 8px; color: var(--color-text-tertiary); }
    .empty-state i { font-size: 2.5rem; }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #065f46; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; display: flex; align-items: center; gap: 8px; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 768px) { .page { padding: 20px; } .form-row { grid-template-columns: 1fr; } .org-grid { grid-template-columns: 1fr; } .my-org-card { flex-direction: column; align-items: flex-start; } }
  `]
})
export class OrgListComponent implements OnInit {
  private orgService = inject(OrganisationService);
  private authService = inject(AuthService);

  private _role = this.authService.getCurrentUser()?.role ?? 'candidate';
  isAdmin    = signal(this._role === 'admin');
  isEmployer = signal(this._role === 'employer');
  allOrgs = signal<Organisation[]>([]);
  pendingOrgs = computed(() => this.allOrgs().filter(o => o.verificationStatus === 'PENDING'));
  approvedAdminOrgs = computed(() => this.allOrgs().filter(o => o.verificationStatus === 'VERIFIED'));
  actionLoading = signal<string | null>(null);
  view = signal<View>('list');
  isLoading = signal(true);
  isSubmitting = signal(false);
  submitted = signal(false);
  verifiedOrgs = signal<Organisation[]>([]);
  myOrgs = signal<Organisation[]>([]);
  createError = signal('');
  toast = signal('');
  uploadState = signal<UploadState>(null);
  verifyDoc: File | null = null;
  docTouched = false;

  createForm: CreateOrganisationRequest = { name: '', type: 'INDUSTRY', website: '', description: '', emailDomain: '' };

  constructor() {}

  ngOnInit() {
    const admin = this.isAdmin();
    const employer = this.isEmployer();

    if (admin) {
      this.orgService.getAllOrganisations().subscribe({
        next: orgs => { this.allOrgs.set(orgs); this.isLoading.set(false); },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.orgService.getVerifiedOrganisations().subscribe({
        next: orgs => { this.verifiedOrgs.set(orgs); this.isLoading.set(false); },
        error: () => this.isLoading.set(false)
      });
      if (employer) {
        this.orgService.getMyOrganisations().subscribe({
          next: orgs => this.myOrgs.set(orgs),
          error: () => {}
        });
      }
    }
  }

  setView(v: View) {
    this.view.set(v);
    this.createError.set('');
    this.docTouched = false;
  }

  onDocSelected(file: File | null) {
    this.verifyDoc = file;
  }

  markDocTouched() {
    this.docTouched = true;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pending Review',
      VERIFIED: 'Approved',
      REJECTED: 'Rejected'
    };
    return labels[status] ?? status;
  }

  submit() {
    this.docTouched = true;
    if (!this.verifyDoc) return;
    if (!this.createForm.name || !this.createForm.type || !this.createForm.website ||
        !this.createForm.emailDomain || !this.createForm.description) return;

    this.isSubmitting.set(true);
    this.createError.set('');

    this.orgService.createOrganisation(this.createForm).subscribe({
      next: org => {
        // Upload the mandatory verification document
        this.orgService.uploadVerificationDocument(org.id, this.verifyDoc!).subscribe({
          next: updated => {
            this.myOrgs.update(list => [updated, ...list]);
            this.isSubmitting.set(false);
            this.submitted.set(true);
            this.showToast('Application submitted! Pending admin review.');
            setTimeout(() => { this.view.set('list'); this.submitted.set(false); }, 1500);
          },
          error: () => {
            // Org created but doc upload failed — still add to list
            this.myOrgs.update(list => [org, ...list]);
            this.isSubmitting.set(false);
            this.submitted.set(true);
            this.createError.set('Organisation registered, but document upload failed. Please re-upload from your dashboard.');
            setTimeout(() => this.view.set('list'), 2500);
          }
        });
      },
      error: err => {
        const body = err.error;
        let msg = 'Something went wrong. Please try again.';
        if (err.status === 0) {
          msg = 'Cannot reach the server. Check your connection or try again later.';
        } else if (err.status === 401 || err.status === 403) {
          msg = 'You must be signed in with an employer or admin account to register an organisation.';
        } else if (err.status === 409 || (typeof body === 'string' && body.toLowerCase().includes('unique'))) {
          msg = `An organisation named "${this.createForm.name}" already exists. Please choose a different name.`;
        } else if (err.status === 400) {
          msg = 'Invalid input — please check all required fields and try again.';
        } else if (body?.message) {
          msg = body.message;
        } else if (body?.error) {
          msg = body.error;
        } else if (err.status >= 500) {
          msg = 'A server error occurred. Please try again in a moment.';
        }
        this.createError.set(msg);
        this.isSubmitting.set(false);
      }
    });
  }

  approveOrg(orgId: string) {
    this.actionLoading.set(orgId);
    this.orgService.verifyOrganisation(orgId).subscribe({
      next: updated => {
        this.allOrgs.update(list => list.map(o => o.id === orgId ? updated : o));
        this.actionLoading.set(null);
        this.showToast('Organisation approved.');
      },
      error: () => { this.actionLoading.set(null); this.showToast('Failed to approve.'); }
    });
  }

  rejectOrg(orgId: string) {
    this.actionLoading.set(orgId);
    this.orgService.rejectOrganisation(orgId).subscribe({
      next: updated => {
        this.allOrgs.update(list => list.map(o => o.id === orgId ? updated : o));
        this.actionLoading.set(null);
        this.showToast('Organisation rejected.');
      },
      error: () => { this.actionLoading.set(null); this.showToast('Failed to reject.'); }
    });
  }

  retryDocUpload(orgId: string, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadState.set({ orgId, error: '', uploading: true });
    this.orgService.uploadVerificationDocument(orgId, file).subscribe({
      next: updated => {
        this.myOrgs.update(list => list.map(o => o.id === orgId ? updated : o));
        this.uploadState.set(null);
        this.showToast('Document uploaded! Your application is under review.');
      },
      error: err => {
        let msg = 'Upload failed. Please try again.';
        if (err.status === 0) msg = 'Cannot reach server — check your connection.';
        else if (err.status === 413) msg = 'File too large. Try a smaller file.';
        this.uploadState.set({ orgId, error: msg, uploading: false });
      }
    });
  }

  private showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 4000);
  }
}
