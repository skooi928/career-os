import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecognitionService } from '../../../services/recognition.service';
import { OrganisationService } from '../../../services/organisation.service';
import { UpskillingService } from '../../../services/upskilling.service';
import { CourseRecognitionRequest, Course, Organisation, SubmitRecognitionRequest } from '../../../types/upskilling.types';

@Component({
  selector: 'app-org-recognitions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Course Recognition</h1><p>Submit your courses for university recognition</p></div>
      </div>

      <!-- Submit form -->
      <div class="card submit-card">
        <h3><i class="ph ph-certificate"></i> Submit Course for Recognition</h3>
        <form (ngSubmit)="submitRequest()" #f="ngForm">
          <div class="form-row">
            <div class="field">
              <label>Course <span class="req">*</span></label>
              <select [(ngModel)]="submitForm.courseId" name="courseId" required>
                <option value="">Select a course…</option>
                <option *ngFor="let c of courses()" [value]="c.id">{{ c.title }}</option>
              </select>
            </div>
            <div class="field">
              <label>Target University</label>
              <select [(ngModel)]="submitForm.reviewingUniversityId" name="uniId">
                <option value="">Any university</option>
                <option *ngFor="let u of universities()" [value]="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Credit Hours</label>
              <input type="number" [(ngModel)]="submitForm.creditHours" name="credits" placeholder="3" min="1">
            </div>
            <div class="field">
              <label>Syllabus URL</label>
              <input type="url" [(ngModel)]="submitForm.syllabusUrl" name="syllabus" placeholder="https://…">
            </div>
          </div>
          <div class="field">
            <label>Learning Outcomes</label>
            <textarea [(ngModel)]="submitForm.learningOutcomes" name="outcomes" rows="3"
                      placeholder="Describe what students will learn and achieve…"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="isSubmitting() || !submitForm.courseId">
              {{ isSubmitting() ? 'Submitting…' : 'Submit for Recognition' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Submissions list -->
      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="empty-state card" *ngIf="!isLoading() && submissions().length === 0">
        <i class="ph ph-certificate" style="font-size:2.5rem;color:var(--color-primary);display:block;margin-bottom:12px;"></i>
        <p style="color:var(--color-text-secondary);margin:0;">No recognition requests submitted yet.</p>
      </div>

      <div class="submissions-list" *ngIf="!isLoading() && submissions().length > 0">
        <h3 class="section-title">My Submissions</h3>
        <div class="submission-row card" *ngFor="let r of submissions()">
          <div class="sub-top">
            <div class="course-info">
              <span class="course-title">{{ r.course?.title || r.courseId }}</span>
              <span class="uni-name" *ngIf="r.reviewingUniversity">
                → {{ r.reviewingUniversity.name }}
              </span>
            </div>
            <span class="status-pill" [class]="'status-' + r.status.toLowerCase().replace('_','-')">
              {{ r.status.replace('_', ' ') }}
            </span>
          </div>
          <div class="sub-meta">
            <span>Submitted {{ r.submittedAt | date:'mediumDate' }}</span>
            <span *ngIf="r.creditHours"><i class="ph ph-book"></i> {{ r.creditHours }} credits</span>
            <span *ngIf="r.reviewedAt">Reviewed {{ r.reviewedAt | date:'mediumDate' }}</span>
          </div>
          <div class="reviewer-notes" *ngIf="r.reviewerNotes">
            <i class="ph ph-chat-text"></i> <em>{{ r.reviewerNotes }}</em>
          </div>
        </div>
      </div>

      <div class="toast" [class.show]="toast()">{{ toast() }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; }
    .page-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 20px; margin-bottom: 16px; }
    .submit-card h3 { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0 0 16px; display: flex; align-items: center; gap: 7px; }
    .submit-card h3 i { color: var(--color-primary); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { margin-bottom: 12px; }
    .field label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--color-text); margin-bottom: 5px; }
    .req { color: #ef4444; }
    .field input, .field select, .field textarea { width: 100%; padding: 9px 12px; border-radius: 9px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; box-sizing: border-box; font-family: inherit; }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--color-primary); }
    .form-actions { display: flex; justify-content: flex-end; }
    .btn-primary { padding: 9px 24px; background: var(--color-primary); color: white; border: none; border-radius: 9px; font-size: 0.875rem; font-weight: 700; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 48px; }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0 0 12px; }
    .submission-row { display: flex; flex-direction: column; gap: 8px; }
    .sub-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .course-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .course-title { font-size: 0.95rem; font-weight: 700; color: var(--color-text); }
    .uni-name { font-size: 0.82rem; color: var(--color-text-secondary); }
    .status-pill { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
    .status-submitted { background: #e0e7ff; color: #3730a3; }
    .status-under-review { background: #fef3c7; color: #92400e; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-revision-requested { background: #ffedd5; color: #9a3412; }
    .sub-meta { display: flex; gap: 14px; font-size: 0.78rem; color: var(--color-text-tertiary); align-items: center; flex-wrap: wrap; }
    .reviewer-notes { font-size: 0.82rem; color: var(--color-text-secondary); padding: 8px 12px; background: var(--color-bg); border-radius: 8px; display: flex; align-items: flex-start; gap: 6px; }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 768px) { .page { padding: 20px; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class OrgRecognitionsComponent implements OnInit {
  isLoading = signal(true);
  isSubmitting = signal(false);
  submissions = signal<CourseRecognitionRequest[]>([]);
  courses = signal<Course[]>([]);
  universities = signal<Organisation[]>([]);
  toast = signal('');
  orgId = '';

  submitForm: SubmitRecognitionRequest & { courseId: string } = {
    courseId: '', reviewingUniversityId: '', syllabusUrl: '', learningOutcomes: '', creditHours: undefined
  };

  constructor(
    private recognitionService: RecognitionService,
    private orgService: OrganisationService,
    private upskillingService: UpskillingService
  ) {}

  ngOnInit() {
    this.orgService.getMyOrganisations().subscribe({
      next: orgs => {
        const active = orgs.find(o => o.verificationStatus === 'VERIFIED') ?? orgs[0];
        if (!active) { this.isLoading.set(false); return; }
        this.orgId = active.id;
        this.loadSubmissions();
        // Only published courses can be submitted for recognition
        this.upskillingService.getOrgCourses(this.orgId).subscribe({
          next: c => this.courses.set(c.filter(course => course.isPublished)),
          error: () => {}
        });
      },
      error: () => this.isLoading.set(false)
    });
    this.orgService.getVerifiedOrganisations().subscribe({
      next: orgs => this.universities.set(orgs.filter(o => o.type === 'UNIVERSITY')),
      error: () => {}
    });
  }

  loadSubmissions() {
    this.recognitionService.getOrgSubmissions(this.orgId).subscribe({
      next: s => { this.submissions.set(s); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  submitRequest() {
    if (!this.submitForm.courseId) return;
    this.isSubmitting.set(true);
    const req: SubmitRecognitionRequest = {
      reviewingUniversityId: this.submitForm.reviewingUniversityId || undefined,
      syllabusUrl: this.submitForm.syllabusUrl,
      learningOutcomes: this.submitForm.learningOutcomes,
      creditHours: this.submitForm.creditHours
    };
    this.recognitionService.submitForRecognition(this.submitForm.courseId, req).subscribe({
      next: r => {
        this.submissions.update(l => [r, ...l]);
        this.submitForm = { courseId: '', reviewingUniversityId: '', syllabusUrl: '', learningOutcomes: '', creditHours: undefined };
        this.isSubmitting.set(false);
        this.showToast('Recognition request submitted!');
      },
      error: err => {
        this.isSubmitting.set(false);
        this.showToast(err.error?.message || 'Failed to submit.');
      }
    });
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3500); }
}
