import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UpskillingService } from '../../../services/upskilling.service';
import { CourseEnrollment } from '../../../types/upskilling.types';

@Component({
  selector: 'app-my-learning',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>My Learning</h1>
          <p>Track your progress across all enrolled courses</p>
        </div>
      </div>

      <div class="stats-row" *ngIf="!isLoading()">
        <div class="stat-chip">
          <span class="n">{{ enrollments().length }}</span>
          <span class="l">Enrolled</span>
        </div>
        <div class="stat-chip green">
          <span class="n">{{ completedCount() }}</span>
          <span class="l">Completed</span>
        </div>
        <div class="stat-chip yellow">
          <span class="n">{{ inProgressCount() }}</span>
          <span class="l">In Progress</span>
        </div>
      </div>

      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="empty-state" *ngIf="!isLoading() && enrollments().length === 0">
        <i class="ph ph-books"></i>
        <h3>No courses yet</h3>
        <p>Go to <a routerLink="/upskilling">Upskilling</a> to find and enrol in courses</p>
      </div>

      <div class="enrollment-list" *ngIf="!isLoading()">
        <div class="enrollment-card" *ngFor="let e of enrollments()">
          <div class="card-header">
            <div>
              <h4>{{ e.course?.title || 'Course' }}</h4>
              <p class="org">{{ e.course?.organisation?.name }}</p>
            </div>
            <span class="status-chip" [class]="statusClass(e.completionStatus)">
              {{ e.completionStatus | titlecase }}
            </span>
          </div>

          <div class="progress-row">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="e.progressPercentage"></div>
            </div>
            <span class="pct">{{ e.progressPercentage }}%</span>
          </div>

          <div class="badge-reward" *ngIf="e.course?.badge && e.completionStatus !== 'COMPLETED'">
            <i class="ph ph-medal"></i>
            <span>Complete to earn: <strong>{{ e.course!.badge!.name }}</strong></span>
          </div>

          <div class="card-actions">
            <button class="btn-complete"
                    *ngIf="e.completionStatus === 'IN_PROGRESS'"
                    (click)="markComplete(e)">
              <i class="ph ph-check-circle"></i> Mark Complete
            </button>
            <button class="btn-drop"
                    *ngIf="e.completionStatus === 'IN_PROGRESS'"
                    (click)="drop(e)">
              Drop
            </button>
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
    .stats-row { display: flex; gap: 14px; margin-bottom: 28px; flex-wrap: wrap; }
    .stat-chip {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 14px 24px; border-radius: 12px;
      background: var(--color-surface); border: 1px solid var(--color-border);
    }
    .stat-chip .n { font-size: 1.5rem; font-weight: 800; color: var(--color-text); }
    .stat-chip .l { font-size: 0.78rem; color: var(--color-text-secondary); }
    .stat-chip.green .n { color: #10b981; }
    .stat-chip.yellow .n { color: #f59e0b; }
    .enrollment-list { display: flex; flex-direction: column; gap: 14px; }
    .enrollment-card {
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 14px; padding: 18px 20px;
    }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .card-header h4 { font-size: 0.95rem; font-weight: 700; color: var(--color-text); margin: 0 0 3px; }
    .org { font-size: 0.78rem; color: var(--color-text-tertiary); margin: 0; }
    .status-chip { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
    .chip-green { background: #d1fae5; color: #065f46; }
    .chip-yellow { background: #fef3c7; color: #92400e; }
    .chip-red { background: #fee2e2; color: #991b1b; }
    .progress-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .progress-bar {
      flex: 1; height: 8px; border-radius: 999px;
      background: var(--color-border); overflow: hidden;
    }
    .progress-fill {
      height: 100%; background: var(--color-primary);
      border-radius: 999px; transition: width 0.4s ease;
    }
    .pct { font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); min-width: 36px; text-align: right; }
    .card-actions { display: flex; gap: 8px; }
    .badge-reward {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 10px; border-radius: 8px; margin-bottom: 6px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 1px solid #f59e0b30;
      font-size: 0.78rem; color: #92400e;
    }
    .badge-reward i { font-size: 0.9rem; color: #d97706; }
    .badge-reward strong { font-weight: 700; color: #78350f; }
    .btn-complete {
      display: flex; align-items: center; gap: 5px;
      padding: 7px 14px; border-radius: 8px;
      background: var(--color-primary); color: white;
      border: none; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    }
    .btn-drop {
      padding: 7px 14px; border-radius: 8px;
      background: var(--color-surface-secondary); color: var(--color-text-secondary);
      border: 1px solid var(--color-border); font-size: 0.82rem; cursor: pointer;
    }
    .btn-complete:hover { opacity: 0.9; }
    .btn-drop:hover { color: #ef4444; border-color: #ef4444; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 8px; color: var(--color-text-tertiary); }
    .empty-state i { font-size: 3rem; }
    .empty-state h3 { font-size: 1rem; font-weight: 700; margin: 0; color: var(--color-text-secondary); }
    .empty-state p { font-size: 0.875rem; margin: 0; }
    .empty-state a { color: var(--color-primary); text-decoration: none; }
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 768px) { .page { padding: 20px; } }
  `]
})
export class MyLearningComponent implements OnInit {
  private upskillingService = inject(UpskillingService);

  isLoading = signal(true);
  toast = signal('');

  // Read directly from shared service signal — updates instantly when enroll() fires
  enrollments = this.upskillingService.enrollments;

  completedCount = computed(() => this.enrollments().filter(e => e.completionStatus === 'COMPLETED').length);
  inProgressCount = computed(() => this.enrollments().filter(e => e.completionStatus === 'IN_PROGRESS').length);

  constructor() {}

  ngOnInit() {
    // Always refresh on page visit so data is never stale
    this.upskillingService.loadEnrollments(true);
    // Show loading only if cache was empty
    if (this.enrollments().length === 0) {
      // loadEnrollments is async; watch for data arrival
      const check = setInterval(() => {
        if (this.enrollments().length > 0 || !this.isLoading()) {
          this.isLoading.set(false);
          clearInterval(check);
        }
      }, 100);
      // Fallback: stop loading after 5s regardless
      setTimeout(() => { this.isLoading.set(false); clearInterval(check); }, 5000);
    } else {
      this.isLoading.set(false);
    }
  }

  statusClass(status: string): string {
    if (status === 'COMPLETED') return 'status-chip chip-green';
    if (status === 'IN_PROGRESS') return 'status-chip chip-yellow';
    return 'status-chip chip-red';
  }

  markComplete(e: CourseEnrollment) {
    // Optimistic update — instant UI feedback before server responds
    const optimistic: CourseEnrollment = { ...e, progressPercentage: 100, completionStatus: 'COMPLETED' };
    this.upskillingService.enrollments.update(list => list.map(en => en.id === e.id ? optimistic : en));

    this.upskillingService.updateProgress(e.id, { progressPercentage: 100 }).subscribe({
      next: res => {
        // Replace optimistic entry with real server response
        this.upskillingService.enrollments.update(list => list.map(en => en.id === res.enrollment.id ? res.enrollment : en));
        if (res.awardedBadge) {
          this.showToast(`🎖️ Badge earned: ${res.awardedBadge.badge?.name ?? 'New badge'}!`);
        } else {
          this.showToast('Course marked as complete!');
        }
      },
      error: () => {
        // Revert optimistic update on failure
        this.upskillingService.enrollments.update(list => list.map(en => en.id === e.id ? e : en));
        this.showToast('Failed to update progress.');
      }
    });
  }

  drop(e: CourseEnrollment) {
    if (!confirm('Drop this course?')) return;
    this.upskillingService.dropCourse(e.id).subscribe({
      next: () => {
        this.upskillingService.enrollments.update(list => list.filter(en => en.id !== e.id));
        this.showToast('Course dropped.');
      },
      error: () => this.showToast('Failed to drop course.')
    });
  }

  private showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
