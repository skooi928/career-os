import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../types/upskilling.types';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="course-card">
      <div class="card-top">
        <div class="org-row">
          <div class="org-logo" *ngIf="course.organisation?.logoUrl; else orgInitial">
            <img [src]="course.organisation!.logoUrl" [alt]="course.organisation?.name">
          </div>
          <ng-template #orgInitial>
            <div class="org-initial">{{ (course.organisation?.name || 'O')[0] }}</div>
          </ng-template>
          <span class="org-name">{{ course.organisation?.name || 'Organisation' }}</span>
        </div>
        <div class="category-badge" *ngIf="course.category">{{ course.category }}</div>
      </div>

      <h3 class="course-title">{{ course.title }}</h3>
      <p class="course-desc">{{ course.description }}</p>

      <div class="meta-row">
        <span class="diff" [class]="'diff-' + course.difficultyLevel!.toLowerCase()">
          {{ course.difficultyLevel }}
        </span>
        <span class="meta-item" *ngIf="course.durationHours">
          <i class="ph ph-clock"></i> {{ course.durationHours }}h
        </span>
        <span class="meta-item" *ngIf="course.enrolledCount != null">
          <i class="ph ph-users"></i> {{ course.enrolledCount }}
        </span>
      </div>

      <div class="badge-reward" *ngIf="course.badge">
        <i class="ph ph-medal"></i>
        <span>Earns: <strong>{{ course.badge.name }}</strong></span>
        <span class="badge-tag" *ngIf="course.badge.skillTag">{{ course.badge.skillTag }}</span>
      </div>

      <div class="card-actions">
        <button class="btn-view" (click)="onViewClick.emit(course)">View Details</button>
        <button class="btn-enroll"
                *ngIf="showEnroll"
                [disabled]="isEnrolled"
                (click)="!isEnrolled && onEnrollClick.emit(course)">
          {{ isEnrolled ? 'Enrolled' : 'Enrol' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .course-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: box-shadow 0.2s;
    }
    .course-card:hover { box-shadow: var(--shadow-md); }
    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .org-row { display: flex; align-items: center; gap: 7px; }
    .org-logo img, .org-initial {
      width: 26px; height: 26px; border-radius: 6px; object-fit: contain;
    }
    .org-initial {
      background: var(--color-secondary);
      color: var(--color-primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 800;
    }
    .org-name { font-size: 0.78rem; color: var(--color-text-secondary); font-weight: 500; }
    .category-badge {
      font-size: 0.7rem; font-weight: 600; padding: 3px 8px;
      border-radius: 999px; background: var(--color-secondary); color: var(--color-primary);
    }
    .course-title {
      font-size: 0.95rem; font-weight: 700; color: var(--color-text);
      margin: 0; line-height: 1.3;
    }
    .course-desc {
      font-size: 0.82rem; color: var(--color-text-secondary);
      margin: 0; line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .meta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
    .diff { font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
    .diff-beginner { background: #d1fae5; color: #065f46; }
    .diff-intermediate { background: #fef3c7; color: #92400e; }
    .diff-advanced { background: #fee2e2; color: #991b1b; }
    .meta-item {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.78rem; color: var(--color-text-tertiary);
    }
    .badge-reward {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 10px; border-radius: 8px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 1px solid #f59e0b30;
      font-size: 0.78rem; color: #92400e;
    }
    .badge-reward i { font-size: 0.9rem; color: #d97706; flex-shrink: 0; }
    .badge-reward strong { font-weight: 700; color: #78350f; }
    .badge-tag {
      margin-left: auto; font-size: 0.68rem; font-weight: 600;
      padding: 2px 7px; border-radius: 999px;
      background: #fcd34d40; color: #92400e;
    }
    .card-actions { display: flex; gap: 8px; margin-top: auto; padding-top: 8px; }
    .btn-view {
      flex: 1; padding: 8px; border-radius: 8px;
      background: var(--color-secondary); color: var(--color-primary);
      border: none; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    }
    .btn-enroll {
      flex: 1; padding: 8px; border-radius: 8px;
      background: var(--color-primary); color: white;
      border: none; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    }
    .btn-enroll:disabled { opacity: 0.6; cursor: default; }
    .btn-view:hover { opacity: 0.85; }
    .btn-enroll:hover:not(:disabled) { opacity: 0.9; }
  `]
})
export class CourseCardComponent {
  @Input() course!: Course;
  @Input() isEnrolled = false;
  @Input() showEnroll = true;
  @Output() onEnrollClick = new EventEmitter<Course>();
  @Output() onViewClick = new EventEmitter<Course>();
}
