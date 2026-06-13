import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UpskillingService } from '../../services/upskilling.service';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { Course, LearnerStats } from '../../types/upskilling.types';

@Component({
  selector: 'app-upskilling',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CourseCardComponent],
  template: `
    <div class="page">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-text">
          <h1>Upskill Your Career</h1>
          <p>Browse courses from verified industry organisations and universities. Earn digital badges to showcase your skills.</p>
          <a class="btn-my-learning" routerLink="/upskilling/my-learning">
            My Learning
          </a>
        </div>
        <div class="hero-stats" *ngIf="stats()">
          <div class="stat">
            <span class="n">{{ stats()!.totalEnrolled }}</span>
            <span class="l">Enrolled</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="n">{{ stats()!.completed }}</span>
            <span class="l">Completed</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-wrap">
          <i class="ph ph-magnifying-glass"></i>
          <input type="text" [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="Search courses...">
        </div>
        <select [ngModel]="selectedCategory()" (ngModelChange)="selectedCategory.set($event)">
          <option value="">All Categories</option>
          <option *ngFor="let cat of categories()" [value]="cat">{{ cat }}</option>
        </select>
        <select [ngModel]="selectedDifficulty()" (ngModelChange)="selectedDifficulty.set($event)">
          <option value="">All Levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div>
      </div>

      <!-- Empty -->
      <div class="empty-state" *ngIf="!isLoading() && filteredCourses().length === 0">
        <i class="ph ph-books"></i>
        <h3>No courses found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <!-- Course Grid -->
      <div class="courses-grid" *ngIf="!isLoading()">
        <app-course-card
          *ngFor="let course of filteredCourses()"
          [course]="course"
          [isEnrolled]="enrolledIds().has(course.id)"
          [showEnroll]="true"
          (onEnrollClick)="enroll($event)"
          (onViewClick)="viewCourse($event)">
        </app-course-card>
      </div>

      <!-- Course Detail Modal -->
      <div class="modal-overlay" *ngIf="selectedCourse()" (click)="selectedCourse.set(null)">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="selectedCourse.set(null)"><i class="ph ph-x"></i></button>
          <div class="modal-header">
            <div class="modal-org" *ngIf="selectedCourse()!.organisation">
              <span class="org-initial">{{ (selectedCourse()!.organisation?.name || 'O')[0] }}</span>
              <span>{{ selectedCourse()!.organisation?.name }}</span>
            </div>
            <h2>{{ selectedCourse()!.title }}</h2>
            <div class="modal-meta">
              <span class="diff" *ngIf="selectedCourse()!.difficultyLevel"
                    [class]="'diff-' + selectedCourse()!.difficultyLevel!.toLowerCase()">
                {{ selectedCourse()!.difficultyLevel }}
              </span>
              <span *ngIf="selectedCourse()!.durationHours"><i class="ph ph-clock"></i> {{ selectedCourse()!.durationHours }}h</span>
              <span *ngIf="selectedCourse()!.category"><i class="ph ph-tag"></i> {{ selectedCourse()!.category }}</span>
            </div>
          </div>
          <p class="modal-desc">{{ selectedCourse()!.description || 'No description available.' }}</p>
          <div class="modal-actions">
            <button class="btn-enroll-modal"
              [disabled]="enrolledIds().has(selectedCourse()!.id)"
              (click)="enroll(selectedCourse()!); selectedCourse.set(null)">
              {{ enrolledIds().has(selectedCourse()!.id) ? 'Already Enrolled' : 'Enrol Now' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast" [class.show]="toast()">{{ toast() }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .hero {
      display: flex; justify-content: space-between; align-items: center;
      background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
      border-radius: 24px; padding: 40px; margin-bottom: 28px; color: white;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    }
    .hero-text { display: flex; flex-direction: column; gap: 4px; }
    .hero-text h1 { font-size: 2rem; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.02em; }
    .hero-text p { font-size: 0.9rem; opacity: 0.9; margin: 0 0 20px; max-width: 440px; color: #d1fae5; }
    .btn-my-learning {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 10px 20px; border-radius: 12px; font-size: 0.875rem; font-weight: 600;
      background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
      color: white; text-decoration: none; transition: background 0.2s, transform 0.2s;
      backdrop-filter: blur(8px); width: fit-content;
    }
    .btn-my-learning:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
    .hero-stats { display: flex; align-items: center; gap: 0; }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0 28px; }
    .stat .n { font-size: 2.2rem; font-weight: 800; color: white; line-height: 1; }
    .stat .l { font-size: 0.8rem; color: #a7f3d0; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-divider { width: 1px; height: 48px; background: rgba(255,255,255,0.25); }
    .filters { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-wrap {
      flex: 1; min-width: 200px;
      display: flex; align-items: center; gap: 8px;
      border: 1px solid var(--color-input-border); border-radius: 10px;
      padding: 0 12px; background: var(--color-input-bg);
    }
    .search-wrap i { color: var(--color-text-tertiary); }
    .search-wrap input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.875rem; color: var(--color-text); padding: 10px 0; }
    .filters select {
      padding: 10px 12px; border-radius: 10px;
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg); color: var(--color-text);
      font-size: 0.875rem; outline: none; cursor: pointer;
    }
    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 8px; color: var(--color-text-tertiary); }
    .empty-state i { font-size: 3rem; }
    .empty-state h3 { font-size: 1rem; font-weight: 700; margin: 0; color: var(--color-text-secondary); }
    .empty-state p { font-size: 0.875rem; margin: 0; }
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-card { background: var(--color-surface); border-radius: 20px; padding: 28px; max-width: 520px; width: 100%; position: relative; box-shadow: 0 24px 48px rgba(0,0,0,0.2); }
    .modal-close { position: absolute; top: 16px; right: 16px; background: var(--color-surface-secondary); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-text-secondary); font-size: 1rem; }
    .modal-close:hover { background: var(--color-border); }
    .modal-org { display: flex; align-items: center; gap: 7px; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 8px; }
    .org-initial { width: 22px; height: 22px; border-radius: 5px; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
    .modal-header h2 { font-size: 1.2rem; font-weight: 800; color: var(--color-text); margin: 0 0 10px; }
    .modal-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 0.8rem; color: var(--color-text-secondary); }
    .modal-meta span { display: flex; align-items: center; gap: 4px; }
    .modal-desc { font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 20px; }
    .modal-actions { display: flex; justify-content: flex-end; }
    .btn-enroll-modal { padding: 10px 24px; background: var(--color-primary); color: white; border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 700; cursor: pointer; }
    .btn-enroll-modal:hover:not(:disabled) { opacity: 0.9; }
    .btn-enroll-modal:disabled { opacity: 0.5; cursor: not-allowed; }
    .diff { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
    .diff-beginner { background: #d1fae5; color: #065f46; }
    .diff-intermediate { background: #fef3c7; color: #92400e; }
    .diff-advanced { background: #fee2e2; color: #991b1b; }
    @media (max-width: 768px) { .page { padding: 20px; } .hero { flex-direction: column; gap: 28px; align-items: flex-start; } .hero-stats { align-self: stretch; justify-content: center; } }
  `]
})
export class UpskillingComponent implements OnInit {
  isLoading = signal(true);
  courses = signal<Course[]>([]);
  stats = signal<LearnerStats | null>(null);
  toast = signal('');
  search = signal('');
  selectedCategory = signal('');
  selectedDifficulty = signal('');
  selectedCourse = signal<Course | null>(null);

  // Derived from shared service signal — stays in sync when enroll() fires
  enrolledIds = computed(() => new Set(this.upskillingService.enrollments().map(e => e.courseId)));

  categories = computed(() => [...new Set(this.courses().map(c => c.category).filter(Boolean) as string[])]);

  filteredCourses = computed(() =>
    this.courses().filter(c => {
      const q = this.search().toLowerCase();
      if (q && !c.title.toLowerCase().includes(q) && !(c.description ?? '').toLowerCase().includes(q)) return false;
      if (this.selectedCategory() && c.category !== this.selectedCategory()) return false;
      if (this.selectedDifficulty() && c.difficultyLevel !== this.selectedDifficulty()) return false;
      return true;
    })
  );

  constructor(public upskillingService: UpskillingService) {}

  ngOnInit() {
    this.upskillingService.getPublishedCourses().subscribe({
      next: c => { this.courses.set(c); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
    // Load into shared signal (no-op if already loaded)
    this.upskillingService.loadEnrollments();
    this.upskillingService.getMyStats().subscribe({
      next: s => this.stats.set(s),
      error: () => {}
    });
  }

  enroll(course: Course) {
    // enrollInCourse() automatically updates the shared signal via tap()
    this.upskillingService.enrollInCourse({ courseId: course.id }).subscribe({
      next: () => this.showToast(`Enrolled in "${course.title}"!`),
      error: () => this.showToast('Failed to enrol. Please try again.')
    });
  }

  viewCourse(course: Course) {
    this.selectedCourse.set(course);
  }

  private showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
