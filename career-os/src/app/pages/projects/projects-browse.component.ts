import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { IndustryProject, ProjectRequiredBadge, EligibilityResult } from '../../types/upskilling.types';

@Component({
  selector: 'app-projects-browse',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Industry Projects</h1>
          <p>Apply for real-world projects posted by industry organisations</p>
        </div>
        <a routerLink="/upskilling" class="btn-secondary"><i class="ph ph-graduation-cap"></i> Earn Badges</a>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar card">
        <input class="search-input" type="text" placeholder="Search projects..." [(ngModel)]="search" (ngModelChange)="filterProjects()">
        <span class="results-count">{{ filtered().length }} project{{ filtered().length !== 1 ? 's' : '' }}</span>
      </div>

      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="empty-state card" *ngIf="!isLoading() && filtered().length === 0">
        <i class="ph ph-briefcase" style="font-size:2.5rem;color:var(--color-primary);display:block;margin-bottom:12px;"></i>
        <p style="color:var(--color-text-secondary);margin:0;">No open projects right now. Check back soon!</p>
      </div>

      <div class="projects-grid" *ngIf="!isLoading()">
        <div class="project-card card" *ngFor="let p of filtered()">
          <div class="proj-top">
            <div class="org-chip">
              <div class="org-initial">{{ p.organisation?.name?.[0] || 'O' }}</div>
              <span>{{ p.organisation?.name || 'Organisation' }}</span>
            </div>
            <span class="deadline-chip" *ngIf="p.deadline">
              <i class="ph ph-calendar"></i> {{ p.deadline | date:'mediumDate' }}
            </span>
          </div>

          <h3 class="proj-title">{{ p.title }}</h3>
          <p class="proj-desc">{{ p.description }}</p>

          <!-- Required badges (MANDATORY gate) -->
          <div class="badge-req-section" *ngIf="requiredBadges[p.id] !== undefined">
            <div class="req-label mandatory-label"><i class="ph ph-medal"></i> Required Badges <span class="must-tag">MUST HAVE</span></div>
            <div class="badge-chips" *ngIf="requiredBadges[p.id]?.length; else openToAll">
              <span class="badge-chip" *ngFor="let rb of requiredBadges[p.id]">
                {{ rb.badge?.name || rb.badgeId }}
              </span>
            </div>
            <ng-template #openToAll>
              <span style="font-size:0.75rem;color:var(--color-text-tertiary);"><i class="ph ph-users"></i> Open to all — no badge requirements</span>
            </ng-template>
          </div>

          <!-- Recommended skills (DISPLAY ONLY) -->
          <div class="skills-req-section" *ngIf="p.skillsRequired">
            <div class="req-label recommended-label"><i class="ph ph-lightbulb"></i> Recommended Skills <span class="nice-tag">NICE TO HAVE</span></div>
            <div class="skill-chips">
              <span class="skill-chip" *ngFor="let s of p.skillsRequired.split(',')">
                {{ s.trim() }}
              </span>
            </div>
          </div>

          <!-- Eligibility panel (candidate only) -->
          <div class="elig-panel" *ngIf="isCandidate() && eligibility[p.id] as el">
            <div class="elig-ok" *ngIf="el.eligible">
              <i class="ph ph-check-circle"></i> You meet all badge requirements!
            </div>
            <div class="elig-fail" *ngIf="!el.eligible">
              <div class="elig-fail-title"><i class="ph ph-warning-circle"></i> Missing required badges:</div>
              <div class="missing-badges">
                <span class="missing-chip" *ngFor="let b of el.missingBadges">{{ b.name }}</span>
              </div>
              <div class="rec-courses" *ngIf="el.recommendedCourses?.length">
                <div class="rec-label">Enrol to earn them:</div>
                <a routerLink="/upskilling" class="rec-course-link" *ngFor="let c of el.recommendedCourses">
                  <i class="ph ph-arrow-right"></i> {{ c.title }}
                </a>
              </div>
            </div>
          </div>

          <div class="proj-actions" *ngIf="isCandidate()">
            <button class="btn-check" (click)="checkEligibility(p)" [disabled]="checkingId() === p.id">
              <i class="ph ph-shield-check"></i> {{ checkingId() === p.id ? 'Checking…' : 'Check Eligibility' }}
            </button>
            <button class="btn-apply"
                    *ngIf="eligibility[p.id]?.eligible && myApplicationIds()[p.id] !== true"
                    (click)="apply(p)" [disabled]="applyingId() === p.id">
              <i class="ph ph-paper-plane-tilt"></i> {{ applyingId() === p.id ? 'Applying…' : 'Apply' }}
            </button>
            <span class="applied-badge" *ngIf="myApplicationIds()[p.id] === true">
              <i class="ph ph-check"></i> Applied
            </span>
          </div>

          <!-- Employer view: read-only badge -->
          <div class="proj-actions" *ngIf="!isCandidate()">
            <span class="employer-chip"><i class="ph ph-eye"></i> View only — manage via Manage Projects</span>
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
    .btn-secondary { display: flex; align-items: center; gap: 6px; padding: 9px 16px; background: var(--color-secondary); color: var(--color-primary); border-radius: 9px; text-decoration: none; font-size: 0.85rem; font-weight: 600; border: none; cursor: pointer; }
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 20px; }
    .filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 14px 18px; }
    .search-input { flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; }
    .search-input:focus { border-color: var(--color-primary); }
    .results-count { font-size: 0.8rem; color: var(--color-text-secondary); font-weight: 500; white-space: nowrap; }
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 48px 24px; }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 18px; }
    .project-card { display: flex; flex-direction: column; gap: 10px; }
    .proj-top { display: flex; align-items: center; justify-content: space-between; }
    .org-chip { display: flex; align-items: center; gap: 7px; }
    .org-initial { width: 26px; height: 26px; border-radius: 6px; background: var(--color-secondary); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; flex-shrink: 0; }
    .org-chip span { font-size: 0.78rem; color: var(--color-text-secondary); font-weight: 500; }
    .deadline-chip { font-size: 0.75rem; color: var(--color-text-tertiary); display: flex; align-items: center; gap: 4px; }
    .proj-title { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0; }
    .proj-desc { font-size: 0.83rem; color: var(--color-text-secondary); margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .badge-req-section, .skills-req-section { display: flex; flex-direction: column; gap: 6px; }
    .req-label { font-size: 0.78rem; font-weight: 600; color: var(--color-text); display: flex; align-items: center; gap: 5px; }
    .mandatory-label { color: #92400e; }
    .recommended-label { color: var(--color-text-secondary); }
    .must-tag { font-size: 0.62rem; font-weight: 700; background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; border-radius: 4px; padding: 1px 5px; letter-spacing: 0.03em; }
    .nice-tag { font-size: 0.62rem; font-weight: 700; background: var(--color-surface-secondary); color: var(--color-text-tertiary); border: 1px solid var(--color-border); border-radius: 4px; padding: 1px 5px; letter-spacing: 0.03em; }
    .badge-chips, .skill-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .badge-chip { padding: 3px 10px; background: #fef3c7; color: #92400e; border-radius: 20px; font-size: 0.72rem; font-weight: 600; border: 1px solid #f59e0b; }
    .skill-chip { padding: 3px 10px; background: var(--color-surface-secondary); color: var(--color-text-secondary); border-radius: 20px; font-size: 0.72rem; font-weight: 500; border: 1px dashed var(--color-border); }
    /* Eligibility */
    .elig-panel { border-radius: 10px; overflow: hidden; font-size: 0.82rem; }
    .elig-ok { background: #d1fae5; color: #065f46; padding: 8px 12px; border-radius: 8px; display: flex; align-items: center; gap: 6px; font-weight: 600; }
    .elig-fail { background: #fee2e2; color: #991b1b; padding: 10px 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 6px; }
    .elig-fail-title { display: flex; align-items: center; gap: 5px; font-weight: 600; }
    .missing-badges { display: flex; flex-wrap: wrap; gap: 5px; }
    .missing-chip { padding: 2px 8px; background: #fecaca; color: #7f1d1d; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
    .rec-courses { display: flex; flex-direction: column; gap: 3px; border-top: 1px solid #fca5a5; padding-top: 6px; margin-top: 2px; }
    .rec-label { font-size: 0.75rem; font-weight: 600; color: #b91c1c; }
    .rec-course-link { display: flex; align-items: center; gap: 4px; color: #b91c1c; text-decoration: underline; font-size: 0.78rem; cursor: pointer; }
    /* Actions */
    .proj-actions { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .btn-check { display: flex; align-items: center; gap: 5px; padding: 7px 14px; background: transparent; border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-secondary); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-check:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
    .btn-check:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-apply { display: flex; align-items: center; gap: 5px; padding: 7px 16px; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
    .btn-apply:hover:not(:disabled) { opacity: 0.9; }
    .btn-apply:disabled { opacity: 0.5; cursor: not-allowed; }
    .applied-badge { display: flex; align-items: center; gap: 4px; padding: 7px 12px; background: #d1fae5; color: #065f46; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
    .employer-chip { font-size: 0.75rem; color: var(--color-text-tertiary); display: flex; align-items: center; gap: 5px; }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 768px) { .page { padding: 20px; } .projects-grid { grid-template-columns: 1fr; } }
  `]
})
export class ProjectsBrowseComponent implements OnInit {
  isLoading = signal(true);
  projects = signal<IndustryProject[]>([]);
  filtered = signal<IndustryProject[]>([]);
  search = '';
  checkingId = signal<string | null>(null);
  applyingId = signal<string | null>(null);
  toast = signal('');
  requiredBadges: Record<string, any[]> = {};
  eligibility: Record<string, EligibilityResult> = {};
  myApplicationIds = signal<Record<string, boolean>>({});

  isCandidate = computed(() => {
    const role = this.authService.getCurrentUser()?.role;
    return !role || role === 'candidate';
  });

  constructor(private projectService: ProjectService, private authService: AuthService) {}

  ngOnInit() {
    this.projectService.getOpenProjects().subscribe({
      next: projects => {
        this.projects.set(projects);
        this.filtered.set(projects);
        this.isLoading.set(false);
        projects.forEach(p => this.loadRequiredBadges(p.id));
      },
      error: () => this.isLoading.set(false)
    });

    // Only load applications for candidates
    if (this.isCandidate()) {
      this.projectService.getMyApplications().subscribe({
        next: apps => {
          const map: Record<string, boolean> = {};
          apps.filter(a => a.status !== 'WITHDRAWN').forEach(a => map[a.projectId] = true);
          this.myApplicationIds.set(map);
        },
        error: () => {}
      });
    }
  }

  loadRequiredBadges(projectId: string) {
    this.projectService.getRequiredBadges(projectId).subscribe({
      next: badges => this.requiredBadges[projectId] = badges,
      error: () => this.requiredBadges[projectId] = []  // mark as loaded (empty)
    });
  }

  filterProjects() {
    const q = this.search.toLowerCase();
    this.filtered.set(q ? this.projects().filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.organisation?.name?.toLowerCase().includes(q)
    ) : this.projects());
  }

  checkEligibility(p: IndustryProject) {
    this.checkingId.set(p.id);
    this.projectService.checkEligibility(p.id).subscribe({
      next: result => { this.eligibility[p.id] = result; this.checkingId.set(null); },
      error: () => this.checkingId.set(null)
    });
  }

  apply(p: IndustryProject) {
    this.applyingId.set(p.id);
    this.projectService.applyToProject(p.id).subscribe({
      next: () => {
        this.myApplicationIds.update(m => ({ ...m, [p.id]: true }));
        this.applyingId.set(null);
        this.showToast('Application submitted!');
      },
      error: err => {
        this.applyingId.set(null);
        this.showToast(err.error?.message || 'Failed to apply');
      }
    });
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3500); }
}
