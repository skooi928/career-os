import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeService } from '../../../services/badge.service';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import { StatusPillComponent } from '../../../components/status-pill/status-pill.component';
import { UniversityCourseConversion, Badge } from '../../../types/upskilling.types';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent, StatusPillComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>University Verification</h1>
          <p>Submit academic certificates to get badge equivalency recognition</p>
        </div>
      </div>

      <div class="content-grid">
        <!-- Form -->
        <div class="form-card card">
          <h2>Submit Certificate</h2>
          <p class="form-desc">Upload your transcript or completion certificate for review by a verified university.</p>
          <form (ngSubmit)="submit()" #f="ngForm">
            <div class="field">
              <label>University Name <span class="req">*</span></label>
              <input type="text" [(ngModel)]="form.universityName" name="uni" required placeholder="e.g. Universiti Teknologi Malaysia">
            </div>
            <div class="field">
              <label>Course / Programme <span class="req">*</span></label>
              <input type="text" [(ngModel)]="form.courseName" name="course" required placeholder="e.g. Bachelor of Software Engineering">
            </div>
            <div class="field">
              <label>Map to Badge (optional)</label>
              <select [(ngModel)]="form.mappedBadgeId" name="badge">
                <option value="">Let reviewers decide</option>
                <option *ngFor="let b of availableBadges()" [value]="b.id">{{ b.name }} — {{ b.organisation?.name }}</option>
              </select>
            </div>
            <div class="field">
              <label>Supporting Document</label>
              <app-file-upload label="Upload transcript or certificate" hint="PDF, PNG, JPG up to 10MB" accept=".pdf,.png,.jpg,.jpeg" (fileSelected)="selectedFile = $event"></app-file-upload>
            </div>
            <div class="form-error" *ngIf="submitError()">{{ submitError() }}</div>
            <button type="submit" class="btn-submit" [disabled]="isSubmitting() || !f.valid">
              <span *ngIf="!isSubmitting()"><i class="ph ph-paper-plane-tilt"></i> Submit for Review</span>
              <span *ngIf="isSubmitting()">Submitting...</span>
            </button>
          </form>
        </div>

        <!-- Submissions -->
        <div class="submissions-panel card">
          <div class="panel-header">
            <h2>My Submissions</h2>
            <span class="count-badge">{{ submissions().length }}</span>
          </div>
          <div class="loading-sm" *ngIf="isLoading()"><div class="spinner"></div></div>
          <div class="empty-subs" *ngIf="!isLoading() && submissions().length === 0">
            <i class="ph ph-file-text"></i><p>No submissions yet</p>
          </div>
          <div class="sub-list" *ngIf="!isLoading()">
            <div class="sub-item" *ngFor="let s of submissions()">
              <div class="sub-top">
                <div>
                  <h4>{{ s.courseName }}</h4>
                  <p>{{ s.universityName }}</p>
                </div>
                <app-status-pill [status]="s.status"></app-status-pill>
              </div>
              <div class="sub-meta">
                <span *ngIf="s.badge"><i class="ph ph-medal"></i>{{ s.badge.name }}</span>
                <span><i class="ph ph-clock"></i>{{ s.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="sub-notes" *ngIf="s['notes']"><i class="ph ph-note"></i>{{ s['notes'] }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="toast" [class.show]="toast()">{{ toast() }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; }
    .page-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
    .content-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; align-items: start; }
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 24px; }
    .form-card h2, .panel-header h2 { font-size: 1.05rem; font-weight: 700; color: var(--color-text); margin: 0 0 6px; }
    .form-desc { font-size: 0.83rem; color: var(--color-text-secondary); margin: 0 0 20px; }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 0.83rem; font-weight: 600; color: var(--color-text); margin-bottom: 5px; }
    .req { color: #ef4444; }
    .field input, .field select { width: 100%; padding: 9px 12px; border-radius: 9px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; box-sizing: border-box; }
    .field input:focus, .field select:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    .form-error { padding: 9px 12px; background: #fee2e2; color: #991b1b; border-radius: 8px; font-size: 0.8rem; margin-bottom: 12px; }
    .btn-submit { width: 100%; padding: 11px; background: var(--color-primary); color: white; border: none; border-radius: 9px; font-size: 0.9rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .btn-submit:hover:not(:disabled) { opacity: 0.9; }
    .btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .count-badge { font-size: 0.75rem; font-weight: 700; padding: 2px 9px; border-radius: 999px; background: var(--color-secondary); color: var(--color-primary); }
    .sub-list { display: flex; flex-direction: column; gap: 10px; }
    .sub-item { background: var(--color-surface-secondary); border-radius: 10px; padding: 14px; }
    .sub-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .sub-top h4 { font-size: 0.88rem; font-weight: 700; color: var(--color-text); margin: 0 0 2px; }
    .sub-top p { font-size: 0.78rem; color: var(--color-text-secondary); margin: 0; }
    .sub-meta { display: flex; flex-direction: column; gap: 3px; }
    .sub-meta span { display: flex; align-items: center; gap: 5px; font-size: 0.76rem; color: var(--color-text-secondary); }
    .sub-notes { margin-top: 8px; padding: 7px 10px; background: #fef3c7; border-radius: 7px; font-size: 0.76rem; color: #92400e; display: flex; gap: 5px; }
    .empty-subs { display: flex; flex-direction: column; align-items: center; padding: 30px; gap: 6px; color: var(--color-text-tertiary); }
    .empty-subs i { font-size: 1.8rem; }
    .empty-subs p { margin: 0; font-size: 0.83rem; }
    .loading-sm { display: flex; justify-content: center; padding: 30px; }
    .spinner { width: 28px; height: 28px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } .page { padding: 20px; } }
  `]
})
export class VerificationComponent implements OnInit {
  isLoading = signal(true);
  submissions = signal<UniversityCourseConversion[]>([]);
  availableBadges = signal<Badge[]>([]);
  isSubmitting = signal(false);
  submitError = signal('');
  toast = signal('');
  form = { universityName: '', courseName: '', mappedBadgeId: '' };
  selectedFile: File | null = null;

  constructor(private badgeService: BadgeService) {}

  ngOnInit() {
    this.badgeService.getMyConversions().subscribe({ next: d => { this.submissions.set(d); this.isLoading.set(false); }, error: () => this.isLoading.set(false) });
    this.badgeService.getAllBadges().subscribe({ next: b => this.availableBadges.set(b), error: () => {} });
  }

  submit() {
    if (!this.form.universityName || !this.form.courseName) return;
    this.isSubmitting.set(true); this.submitError.set('');
    const doSubmit = (docUrl?: string) => {
      this.badgeService.submitConversionRequest({
        universityName: this.form.universityName,
        courseName: this.form.courseName,
        mappedBadgeId: this.form.mappedBadgeId || undefined,
        uploadedDocumentUrl: docUrl
      }).subscribe({
        next: s => { this.submissions.update(l => [s, ...l]); this.form = { universityName: '', courseName: '', mappedBadgeId: '' }; this.selectedFile = null; this.isSubmitting.set(false); this.showToast('Submitted for review!'); },
        error: () => { this.submitError.set('Submission failed. Try again.'); this.isSubmitting.set(false); }
      });
    };
    if (this.selectedFile) {
      this.badgeService.uploadCertificate(this.selectedFile).subscribe({ next: ({ url }) => doSubmit(url), error: () => { this.submitError.set('File upload failed.'); this.isSubmitting.set(false); } });
    } else { doSubmit(); }
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3000); }
}
