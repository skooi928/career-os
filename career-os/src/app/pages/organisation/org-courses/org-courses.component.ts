import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpskillingService } from '../../../services/upskilling.service';
import { OrganisationService } from '../../../services/organisation.service';
import { BadgeService } from '../../../services/badge.service';
import { Course, Badge, CreateCourseRequest } from '../../../types/upskilling.types';

@Component({
  selector: 'app-org-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Manage Courses</h1><p>Create and publish courses for applicants</p></div>
        <button class="btn-primary" (click)="showCreate = !showCreate"><i class="ph ph-plus"></i> New Course</button>
      </div>

      <div class="create-form card" *ngIf="showCreate">
        <h3>Create New Course</h3>
        <form (ngSubmit)="createCourse()" #f="ngForm">
          <div class="form-row">
            <div class="field"><label>Title <span class="req">*</span></label><input type="text" [(ngModel)]="form.title" name="title" required placeholder="Course title"></div>
            <div class="field"><label>Category</label><input type="text" [(ngModel)]="form.category" name="cat" placeholder="e.g. Technology"></div>
          </div>
          <div class="field"><label>Description</label><textarea [(ngModel)]="form.description" name="desc" rows="3" placeholder="Course description"></textarea></div>
          <div class="form-row">
            <div class="field"><label>Difficulty</label><select [(ngModel)]="form.difficultyLevel" name="diff"><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option></select></div>
            <div class="field"><label>Duration (hours)</label><input type="number" [(ngModel)]="form.durationHours" name="dur" placeholder="20" min="1"></div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showCreate = false">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="isSubmitting() || !f.valid">{{ isSubmitting() ? 'Creating…' : 'Create Course' }}</button>
          </div>
        </form>
      </div>

      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="courses-table card" *ngIf="!isLoading()">
        <div class="table-header">{{ courses().length }} course{{ courses().length !== 1 ? 's' : '' }}</div>
        <div class="empty-table" *ngIf="courses().length === 0"><i class="ph ph-chalkboard-teacher"></i><p>No courses yet. Create your first one!</p></div>
        <table *ngIf="courses().length > 0">
          <thead><tr><th>Title</th><th>Category</th><th>Difficulty</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of courses()">
              <td><span class="course-title">{{ c.title }}</span><span class="course-desc">{{ c.description }}</span></td>
              <td>{{ c.category || '—' }}</td>
              <td><span class="diff" [class]="'diff-' + c.difficultyLevel!.toLowerCase()">{{ c.difficultyLevel }}</span></td>
              <td>{{ c.durationHours ? c.durationHours + 'h' : '—' }}</td>
              <td><span class="status-dot" [class.published]="c.isPublished">{{ c.isPublished ? 'Published' : 'Draft' }}</span></td>
              <td>
                <div class="row-actions">
                  <button class="act-btn publish" *ngIf="!c.isPublished" (click)="publishCourse(c)">Publish</button>
                  <button class="act-btn delete" (click)="deleteCourse(c)"><i class="ph ph-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="toast" [class.show]="toast()">{{ toast() }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; }
    .page-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
    .btn-primary { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--color-primary); color: white; border: none; border-radius: 9px; font-weight: 600; font-size: 0.875rem; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { padding: 10px 16px; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 9px; font-weight: 600; font-size: 0.875rem; cursor: pointer; }
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 22px; margin-bottom: 22px; }
    .create-form h3 { font-size: 0.95rem; font-weight: 700; color: var(--color-text); margin: 0 0 18px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { margin-bottom: 14px; }
    .field label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--color-text); margin-bottom: 5px; }
    .req { color: #ef4444; }
    .field input, .field select, .field textarea { width: 100%; padding: 9px 12px; border-radius: 9px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; box-sizing: border-box; font-family: inherit; }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px; }
    .table-header { font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 14px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; }
    thead th { text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; padding: 9px 10px; border-bottom: 1px solid var(--color-border); }
    tbody tr { border-bottom: 1px solid var(--color-border); }
    tbody tr:last-child { border-bottom: none; }
    tbody td { padding: 13px 10px; font-size: 0.875rem; color: var(--color-text); vertical-align: middle; }
    .course-title { display: block; font-weight: 600; }
    .course-desc { display: block; font-size: 0.75rem; color: var(--color-text-tertiary); max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .diff { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
    .diff-beginner { background: #d1fae5; color: #065f46; }
    .diff-intermediate { background: #fef3c7; color: #92400e; }
    .diff-advanced { background: #fee2e2; color: #991b1b; }
    .status-dot { font-size: 0.75rem; font-weight: 600; padding: 3px 9px; border-radius: 999px; background: #f3f4f6; color: #6b7280; }
    .status-dot.published { background: #d1fae5; color: #065f46; }
    .row-actions { display: flex; gap: 6px; }
    .act-btn { padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none; }
    .act-btn.publish { background: var(--color-primary); color: white; }
    .act-btn.delete { background: #fee2e2; color: #ef4444; }
    .act-btn:hover { opacity: 0.85; }
    .empty-table { display: flex; flex-direction: column; align-items: center; padding: 36px; gap: 7px; color: var(--color-text-tertiary); }
    .empty-table i { font-size: 2.2rem; }
    .loading-state { display: flex; justify-content: center; padding: 40px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 768px) { .page { padding: 20px; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class OrgCoursesComponent implements OnInit {
  isLoading = signal(true);
  courses = signal<Course[]>([]);
  badges = signal<Badge[]>([]);
  isSubmitting = signal(false);
  toast = signal('');
  showCreate = false;
  orgId = '';
  form: CreateCourseRequest = { title: '', description: '', category: '', difficultyLevel: 'BEGINNER' };

  constructor(private upskillingService: UpskillingService, private orgService: OrganisationService, private badgeService: BadgeService) {}

  ngOnInit() {
    this.orgService.getMyOrganisations().subscribe({
      next: orgs => {
        const active = orgs.find(o => o.verificationStatus === 'VERIFIED') ?? orgs[0] ?? null;
        if (active) { this.orgId = active.id; this.loadCourses(); this.loadBadges(); } else { this.isLoading.set(false); }
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadCourses() { this.upskillingService.getOrgCourses(this.orgId).subscribe({ next: c => { this.courses.set(c); this.isLoading.set(false); }, error: () => this.isLoading.set(false) }); }
  loadBadges() { this.badgeService.getOrgBadges(this.orgId).subscribe({ next: b => this.badges.set(b), error: () => {} }); }

  createCourse() {
    if (!this.form.title || !this.orgId) return;
    this.isSubmitting.set(true);
    this.upskillingService.createCourse(this.orgId, this.form).subscribe({
      next: c => { this.courses.update(l => [c, ...l]); this.form = { title: '', description: '', category: '', difficultyLevel: 'BEGINNER' }; this.showCreate = false; this.isSubmitting.set(false); this.showToast('Course created!'); },
      error: () => { this.isSubmitting.set(false); this.showToast('Failed to create course.'); }
    });
  }

  publishCourse(c: Course) {
    this.upskillingService.publishCourse(this.orgId, c.id).subscribe({ next: u => { this.courses.update(l => l.map(x => x.id === u.id ? u : x)); this.showToast('Course published!'); }, error: () => this.showToast('Failed to publish.') });
  }

  deleteCourse(c: Course) {
    if (!confirm(`Delete "${c.title}"?`)) return;
    this.upskillingService.deleteCourse(this.orgId, c.id).subscribe({ next: () => { this.courses.update(l => l.filter(x => x.id !== c.id)); this.showToast('Course deleted.'); }, error: () => this.showToast('Failed to delete.') });
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3000); }
}
