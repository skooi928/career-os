import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecognitionService } from '../../../services/recognition.service';
import { OrganisationService } from '../../../services/organisation.service';
import { CourseRecognitionRequest, ReviewDecisionRequest } from '../../../types/upskilling.types';

@Component({
  selector: 'app-university-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Review Industry Courses</h1><p>Evaluate and recognise courses submitted by industry organisations</p></div>
        <div class="stats-row">
          <div class="stat-chip"><span>{{ pending().length }}</span> Pending</div>
          <div class="stat-chip approved"><span>{{ approved().length }}</span> Approved</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" *ngIf="!isLoading()">
        <button class="tab" [class.active]="activeTab() === 'pending'" (click)="activeTab.set('pending')">
          Pending Review <span class="tab-badge" *ngIf="pending().length">{{ pending().length }}</span>
        </button>
        <button class="tab" [class.active]="activeTab() === 'all'" (click)="activeTab.set('all')">
          All Requests
        </button>
        <button class="tab" [class.active]="activeTab() === 'approved'" (click)="activeTab.set('approved')">
          Approved
        </button>
      </div>

      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="empty-state card" *ngIf="!isLoading() && visibleRequests().length === 0">
        <i class="ph ph-certificate" style="font-size:2.5rem;color:var(--color-primary);display:block;margin-bottom:12px;"></i>
        <p style="color:var(--color-text-secondary);margin:0;">No recognition requests in this category.</p>
      </div>

      <div class="requests-list" *ngIf="!isLoading()">
        <div class="request-card card" *ngFor="let r of visibleRequests()">
          <div class="req-header">
            <div class="req-info">
              <div class="req-title">{{ r.course?.title || r.courseId }}</div>
              <div class="req-org">by <strong>{{ r.submittingOrg?.name || r.submittingOrgId }}</strong></div>
            </div>
            <span class="status-pill" [class]="'status-' + r.status.toLowerCase().replace('_','-')">
              {{ r.status.replace('_', ' ') }}
            </span>
          </div>

          <div class="req-meta">
            <span *ngIf="r.creditHours"><i class="ph ph-book"></i> {{ r.creditHours }} credit hours</span>
            <span>Submitted {{ r.submittedAt | date:'mediumDate' }}</span>
            <span *ngIf="r.reviewedAt">Reviewed {{ r.reviewedAt | date:'mediumDate' }}</span>
          </div>

          <div class="course-details" *ngIf="r.course">
            <div class="detail-row" *ngIf="r.course.description">
              <span class="detail-label">Description:</span>
              <span>{{ r.course.description }}</span>
            </div>
            <div class="detail-row" *ngIf="r.course.difficultyLevel">
              <span class="detail-label">Difficulty:</span>
              <span>{{ r.course.difficultyLevel }}</span>
            </div>
            <div class="detail-row" *ngIf="r.course.durationHours">
              <span class="detail-label">Duration:</span>
              <span>{{ r.course.durationHours }}h</span>
            </div>
            <div class="detail-row" *ngIf="r.course.badge">
              <span class="detail-label">Badge Awarded:</span>
              <span class="badge-chip">{{ r.course.badge.name }}</span>
            </div>
          </div>

          <div class="outcomes-section" *ngIf="r.learningOutcomes">
            <div class="section-label"><i class="ph ph-list-checks"></i> Learning Outcomes</div>
            <p class="outcomes-text">{{ r.learningOutcomes }}</p>
          </div>

          <div class="syllabus-link" *ngIf="r.syllabusUrl">
            <a [href]="r.syllabusUrl" target="_blank" rel="noopener">
              <i class="ph ph-file-pdf"></i> View Syllabus
            </a>
          </div>

          <!-- Reviewer notes (existing) -->
          <div class="existing-notes" *ngIf="r.reviewerNotes">
            <i class="ph ph-chat-text"></i> <em>{{ r.reviewerNotes }}</em>
          </div>

          <!-- Review panel -->
          <div class="review-panel" *ngIf="reviewingId() === r.id">
            <textarea class="notes-input" [(ngModel)]="reviewNotes" rows="3"
                      placeholder="Add notes for the submitting organisation (optional)…"></textarea>
            <div class="review-btns">
              <button class="btn-approve" (click)="submitReview(r.id, 'APPROVED')">
                <i class="ph ph-check-circle"></i> Approve
              </button>
              <button class="btn-revision" (click)="submitReview(r.id, 'REVISION_REQUESTED')">
                <i class="ph ph-pencil"></i> Request Revision
              </button>
              <button class="btn-reject-r" (click)="submitReview(r.id, 'REJECTED')">
                <i class="ph ph-x-circle"></i> Reject
              </button>
              <button class="btn-cancel" (click)="reviewingId.set(null)">Cancel</button>
            </div>
          </div>

          <!-- Actions for SUBMITTED/UNDER_REVIEW -->
          <div class="req-actions" *ngIf="r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW'">
            <button class="btn-review" (click)="startReview(r.id)" *ngIf="reviewingId() !== r.id">
              <i class="ph ph-clipboard-text"></i> Review
            </button>
          </div>
        </div>
      </div>

      <div class="toast" [class.show]="toast()">{{ toast() }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; }
    .page-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
    .stats-row { display: flex; gap: 10px; }
    .stat-chip { padding: 7px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 9px; font-size: 0.8rem; color: var(--color-text-secondary); font-weight: 600; }
    .stat-chip span { color: var(--color-text); font-weight: 800; margin-right: 4px; }
    .stat-chip.approved span { color: #059669; }
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 20px; margin-bottom: 14px; }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 4px; width: fit-content; }
    .tab { padding: 8px 18px; border: none; background: transparent; border-radius: 9px; font-size: 0.83rem; font-weight: 600; color: var(--color-text-secondary); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
    .tab.active { background: var(--color-primary); color: white; }
    .tab-badge { background: #dc2626; color: white; border-radius: 20px; padding: 1px 7px; font-size: 0.68rem; font-weight: 800; }
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 48px; }
    /* Request card */
    .request-card { display: flex; flex-direction: column; gap: 12px; }
    .req-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .req-title { font-size: 1rem; font-weight: 700; color: var(--color-text); }
    .req-org { font-size: 0.82rem; color: var(--color-text-secondary); }
    .status-pill { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
    .status-submitted { background: #e0e7ff; color: #3730a3; }
    .status-under-review { background: #fef3c7; color: #92400e; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-revision-requested { background: #ffedd5; color: #9a3412; }
    .req-meta { display: flex; gap: 14px; font-size: 0.78rem; color: var(--color-text-tertiary); align-items: center; flex-wrap: wrap; }
    .req-meta span { display: flex; align-items: center; gap: 4px; }
    .course-details { display: flex; flex-direction: column; gap: 5px; background: var(--color-bg); border-radius: 10px; padding: 12px; }
    .detail-row { display: flex; gap: 8px; font-size: 0.82rem; }
    .detail-label { font-weight: 600; color: var(--color-text); min-width: 80px; flex-shrink: 0; }
    .badge-chip { padding: 2px 8px; background: #fef3c7; color: #92400e; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
    .section-label { font-size: 0.82rem; font-weight: 600; color: var(--color-text); display: flex; align-items: center; gap: 5px; margin-bottom: 4px; }
    .outcomes-text { font-size: 0.82rem; color: var(--color-text-secondary); margin: 0; line-height: 1.5; }
    .syllabus-link a { display: inline-flex; align-items: center; gap: 5px; color: var(--color-primary); font-size: 0.82rem; font-weight: 600; text-decoration: none; }
    .existing-notes { font-size: 0.82rem; color: var(--color-text-secondary); padding: 8px 12px; background: var(--color-bg); border-radius: 8px; display: flex; align-items: flex-start; gap: 6px; }
    /* Review panel */
    .review-panel { display: flex; flex-direction: column; gap: 10px; background: var(--color-bg); border-radius: 12px; padding: 14px; border: 1px solid var(--color-border); }
    .notes-input { width: 100%; padding: 9px 12px; border-radius: 9px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; font-family: inherit; box-sizing: border-box; }
    .notes-input:focus { border-color: var(--color-primary); }
    .review-btns { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn-approve { display: flex; align-items: center; gap: 5px; padding: 8px 16px; background: #059669; color: white; border: none; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
    .btn-revision { display: flex; align-items: center; gap: 5px; padding: 8px 14px; background: #d97706; color: white; border: none; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
    .btn-reject-r { display: flex; align-items: center; gap: 5px; padding: 8px 14px; background: #dc2626; color: white; border: none; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
    .btn-cancel { padding: 8px 14px; border: 1px solid var(--color-border); background: transparent; color: var(--color-text-secondary); border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
    .req-actions { display: flex; gap: 8px; }
    .btn-review { display: flex; align-items: center; gap: 5px; padding: 8px 16px; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 768px) { .page { padding: 20px; } .tabs { width: 100%; } }
  `]
})
export class UniversityReviewComponent implements OnInit {
  isLoading = signal(true);
  requests = signal<CourseRecognitionRequest[]>([]);
  activeTab = signal<'pending' | 'all' | 'approved'>('pending');
  reviewingId = signal<string | null>(null);
  reviewNotes = '';
  toast = signal('');
  orgId = '';

  pending = () => this.requests().filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW');
  approved = () => this.requests().filter(r => r.status === 'APPROVED');

  visibleRequests(): CourseRecognitionRequest[] {
    const tab = this.activeTab();
    if (tab === 'pending') return this.pending();
    if (tab === 'approved') return this.approved();
    return this.requests();
  }

  constructor(
    private recognitionService: RecognitionService,
    private orgService: OrganisationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.orgService.getMyOrganisations().subscribe({
      next: orgs => {
        const active = orgs.find(o => o.type === 'UNIVERSITY' && o.verificationStatus === 'VERIFIED')
          ?? orgs.find(o => o.type === 'UNIVERSITY');
        if (!active) {
          this.router.navigate(['/organisation']);
          return;
        }
        this.orgId = active.id;
        this.recognitionService.getIncomingRequests(this.orgId).subscribe({
          next: r => { this.requests.set(r); this.isLoading.set(false); },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  startReview(id: string) {
    this.reviewNotes = '';
    this.reviewingId.set(id);
  }

  submitReview(requestId: string, status: string) {
    const req: ReviewDecisionRequest = { status, notes: this.reviewNotes || undefined };
    this.recognitionService.reviewRequest(requestId, req).subscribe({
      next: updated => {
        this.requests.update(l => l.map(r => r.id === requestId ? updated : r));
        this.reviewingId.set(null);
        this.showToast(`Request ${status.replace('_', ' ').toLowerCase()}.`);
      },
      error: () => this.showToast('Failed to submit review.')
    });
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3500); }
}
