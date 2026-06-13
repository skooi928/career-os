import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { BadgeService } from '../../../services/badge.service';
import { OrganisationService } from '../../../services/organisation.service';
import {
  IndustryProject, ProjectRequiredBadge, ProjectApplication,
  Badge, CreateProjectRequest
} from '../../../types/upskilling.types';

@Component({
  selector: 'app-org-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Manage Projects</h1><p>Create and manage industry projects for candidates</p></div>
        <button class="btn-primary" (click)="showCreate = !showCreate"><i class="ph ph-plus"></i> New Project</button>
      </div>

      <!-- Create form -->
      <div class="card create-card" *ngIf="showCreate">
        <h3>Create New Project</h3>
        <form (ngSubmit)="createProject()" #f="ngForm">
          <div class="form-row">
            <div class="field">
              <label>Title <span class="req">*</span></label>
              <input type="text" [(ngModel)]="form.title" name="title" required placeholder="Project title">
            </div>
            <div class="field">
              <label>Deadline</label>
              <input type="date" [(ngModel)]="form.deadline" name="deadline">
            </div>
          </div>
          <div class="field">
            <label>Description</label>
            <textarea [(ngModel)]="form.description" name="desc" rows="3" placeholder="Describe the project scope and goals"></textarea>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Recommended Skills <span style="font-size:0.73rem;color:var(--color-text-tertiary);font-weight:400;">(nice to have — shown to candidates but does not block applying)</span></label>
              <input type="text" [(ngModel)]="form.skillsRequired" name="skills" placeholder="e.g. Python, AWS, React (comma-separated)">
            </div>
            <div class="field">
              <label>Max Candidates</label>
              <input type="number" [(ngModel)]="form.maxCandidates" name="max" min="1" placeholder="5">
            </div>
          </div>

          <!-- Required badges in create form -->
          <div class="field">
            <label>
              <i class="ph ph-medal" style="color:#d97706;"></i>
              Required Badges
              <span style="font-size:0.68rem;font-weight:700;background:#fef3c7;color:#92400e;border:1px solid #f59e0b;border-radius:4px;padding:1px 6px;margin-left:6px;">MUST HAVE</span>
              <span style="font-size:0.73rem;color:var(--color-text-tertiary);font-weight:400;margin-left:4px;">(candidates must hold all these badges to apply)</span>
            </label>
            <div class="form-badge-picker">
              <select class="form-badge-select" (change)="addFormBadge($any($event.target).value); $any($event.target).value = ''">
                <option value="">+ Add a badge requirement…</option>
                <option *ngFor="let b of availableFormBadges()" [value]="b.id">{{ b.name }}</option>
              </select>
            </div>
            <div class="form-badge-chips" *ngIf="formBadgeIds.length">
              <span class="form-badge-chip" *ngFor="let id of formBadgeIds">
                <i class="ph ph-medal"></i>
                {{ getBadgeName(id) }}
                <button type="button" class="rm-btn" (click)="removeFormBadge(id)">×</button>
              </span>
            </div>
            <div class="form-no-badges" *ngIf="!formBadgeIds.length">
              <i class="ph ph-users"></i> No badges selected — project will be open to all
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="showCreate = false">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="isSaving() || !f.valid">
              {{ isSaving() ? 'Creating…' : 'Create Project' }}
            </button>
          </div>
        </form>
      </div>

      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="empty-state card" *ngIf="!isLoading() && projects().length === 0">
        <i class="ph ph-briefcase" style="font-size:2.5rem;color:var(--color-primary);display:block;margin-bottom:12px;"></i>
        <p style="color:var(--color-text-secondary);margin:0;">No projects yet. Create your first one!</p>
      </div>

      <!-- Projects list -->
      <div class="projects-list" *ngIf="!isLoading()">
        <div class="project-row card" *ngFor="let p of projects()">
          <div class="proj-info">
            <div class="proj-title-row">
              <h3>{{ p.title }}</h3>
              <span class="status-pill" [class]="'status-' + p.status.toLowerCase()">{{ p.status }}</span>
            </div>
            <p class="proj-desc">{{ p.description }}</p>
            <div class="meta-row">
              <span *ngIf="p.skillsRequired"><i class="ph ph-wrench"></i> {{ p.skillsRequired }}</span>
              <span><i class="ph ph-users"></i> Max {{ p.maxCandidates }}</span>
              <span *ngIf="p.deadline"><i class="ph ph-calendar"></i> {{ p.deadline | date:'mediumDate' }}</span>
            </div>
          </div>

          <!-- Required badges section -->
          <div class="badges-section">
            <div class="badges-header">
              <span class="section-label"><i class="ph ph-medal"></i> Required Badges <span style="font-size:0.68rem;font-weight:700;background:#fef3c7;color:#92400e;border:1px solid #f59e0b;border-radius:4px;padding:1px 5px;margin-left:4px;">MUST HAVE</span></span>
              <button class="btn-add-badge" (click)="toggleBadgePanel(p.id)">
                <i class="ph ph-plus"></i> Add
              </button>
            </div>
            <div class="badge-list" *ngIf="requiredBadges[p.id]?.length; else noBadges">
              <span class="badge-chip" *ngFor="let rb of requiredBadges[p.id]">
                {{ rb.badge?.name || rb.badgeId }}
                <button class="rm-btn" (click)="removeRequiredBadge(p.id, rb.badgeId)">×</button>
              </span>
            </div>
            <ng-template #noBadges><span class="no-badges"><i class="ph ph-info"></i> No badge requirements — open to all candidates. Add badges to enforce eligibility.</span></ng-template>

            <div class="badge-picker" *ngIf="badgePanelId() === p.id">
              <select #badgeSel class="badge-select">
                <option value="">Select badge…</option>
                <option *ngFor="let b of orgBadges()" [value]="b.id">{{ b.name }}</option>
              </select>
              <button class="btn-sm-primary" (click)="addRequiredBadge(p.id, badgeSel.value)">Add</button>
              <button class="btn-sm" (click)="badgePanelId.set(null)">Cancel</button>
            </div>
          </div>

          <!-- Applicants -->
          <div class="applicants-section" *ngIf="applications[p.id]?.length">
            <div class="section-label"><i class="ph ph-users-three"></i> Applicants ({{ applications[p.id].length }})</div>
            <div class="app-row" *ngFor="let app of applications[p.id]">
              <span class="app-user">{{ app.userId }}</span>
              <span class="app-status" [class]="'app-' + app.status.toLowerCase()">{{ app.status }}</span>
              <div class="app-btns" *ngIf="app.status === 'PENDING'">
                <button class="btn-accept" (click)="reviewApp(p.id, app.id, 'ACCEPTED')">Accept</button>
                <button class="btn-reject" (click)="reviewApp(p.id, app.id, 'REJECTED')">Reject</button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="proj-actions">
            <button class="btn-view-apps" (click)="loadApplications(p.id)">
              <i class="ph ph-users"></i> View Applicants
            </button>
            <button class="btn-publish" *ngIf="p.status === 'DRAFT'" (click)="publishProject(p.id)">
              <i class="ph ph-rocket-launch"></i> Publish
            </button>
            <button class="btn-close" *ngIf="p.status === 'OPEN'" (click)="closeProject(p.id)">
              <i class="ph ph-lock"></i> Close
            </button>
            <button class="btn-delete" (click)="deleteProject(p.id)">
              <i class="ph ph-trash"></i>
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
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 20px; margin-bottom: 16px; }
    .create-card h3 { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0 0 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { margin-bottom: 12px; }
    .field label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--color-text); margin-bottom: 5px; }
    .req { color: #ef4444; }
    .field input, .field select, .field textarea { width: 100%; padding: 9px 12px; border-radius: 9px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; box-sizing: border-box; font-family: inherit; }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--color-primary); }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
    .btn-primary { display: flex; align-items: center; gap: 6px; padding: 9px 20px; background: var(--color-primary); color: white; border: none; border-radius: 9px; font-size: 0.875rem; font-weight: 700; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel { padding: 9px 16px; border-radius: 9px; border: 1px solid var(--color-border); background: transparent; color: var(--color-text-secondary); font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 48px; }
    /* Project row */
    .project-row { display: flex; flex-direction: column; gap: 14px; }
    .proj-title-row { display: flex; align-items: center; gap: 10px; }
    .proj-title-row h3 { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0; }
    .status-pill { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
    .status-draft { background: #f3f4f6; color: #6b7280; }
    .status-open { background: #d1fae5; color: #065f46; }
    .status-closed { background: #fee2e2; color: #991b1b; }
    .proj-desc { font-size: 0.83rem; color: var(--color-text-secondary); margin: 0; }
    .meta-row { display: flex; gap: 16px; font-size: 0.78rem; color: var(--color-text-tertiary); align-items: center; flex-wrap: wrap; }
    .meta-row span { display: flex; align-items: center; gap: 4px; }
    /* Badges */
    .badges-section { display: flex; flex-direction: column; gap: 8px; padding: 12px; background: var(--color-bg); border-radius: 10px; border: 1px solid var(--color-border); }
    .badges-header { display: flex; align-items: center; justify-content: space-between; }
    .section-label { font-size: 0.82rem; font-weight: 600; color: var(--color-text); display: flex; align-items: center; gap: 5px; }
    .btn-add-badge { padding: 4px 10px; background: var(--color-secondary); color: var(--color-primary); border: none; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; }
    .badge-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .badge-chip { display: flex; align-items: center; gap: 5px; padding: 3px 10px; background: #fef3c7; color: #92400e; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
    .rm-btn { background: none; border: none; color: #d97706; cursor: pointer; font-size: 0.9rem; padding: 0; line-height: 1; }
    .no-badges { font-size: 0.78rem; color: var(--color-text-tertiary); font-style: italic; }
    .badge-picker { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .badge-select { padding: 6px 10px; border-radius: 7px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.82rem; }
    .btn-sm-primary { padding: 5px 12px; background: var(--color-primary); color: white; border: none; border-radius: 7px; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
    .btn-sm { padding: 5px 10px; border: 1px solid var(--color-border); background: transparent; color: var(--color-text-secondary); border-radius: 7px; font-size: 0.78rem; cursor: pointer; }
    /* Applicants */
    .applicants-section { display: flex; flex-direction: column; gap: 6px; }
    .app-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--color-bg); border-radius: 8px; border: 1px solid var(--color-border); flex-wrap: wrap; }
    .app-user { flex: 1; font-size: 0.8rem; color: var(--color-text); font-family: monospace; overflow: hidden; text-overflow: ellipsis; }
    .app-status { padding: 2px 8px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
    .app-pending { background: #fef3c7; color: #92400e; }
    .app-accepted { background: #d1fae5; color: #065f46; }
    .app-rejected { background: #fee2e2; color: #991b1b; }
    .app-withdrawn { background: #f3f4f6; color: #6b7280; }
    .app-btns { display: flex; gap: 5px; }
    .btn-accept { padding: 4px 10px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .btn-reject { padding: 4px 10px; background: #dc2626; color: white; border: none; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    /* Project actions */
    .proj-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .btn-view-apps { display: flex; align-items: center; gap: 5px; padding: 7px 14px; background: transparent; border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-secondary); font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .btn-publish { display: flex; align-items: center; gap: 5px; padding: 7px 14px; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
    .btn-close { display: flex; align-items: center; gap: 5px; padding: 7px 14px; background: #d97706; color: white; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
    .btn-delete { padding: 7px 10px; background: transparent; border: 1px solid #fca5a5; border-radius: 8px; color: #dc2626; cursor: pointer; font-size: 0.9rem; }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    .form-badge-picker { margin-bottom: 8px; }
    .form-badge-select { width: 100%; padding: 9px 12px; border-radius: 9px; border: 1px solid #f59e0b; background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; box-sizing: border-box; cursor: pointer; }
    .form-badge-select:focus { border-color: #d97706; box-shadow: 0 0 0 3px #fef3c74d; }
    .form-badge-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .form-badge-chip { display: flex; align-items: center; gap: 5px; padding: 5px 12px; background: #fef3c7; color: #92400e; border-radius: 20px; font-size: 0.78rem; font-weight: 600; border: 1px solid #f59e0b; }
    .form-badge-chip .rm-btn { background: none; border: none; color: #d97706; cursor: pointer; font-size: 1rem; padding: 0; line-height: 1; margin-left: 2px; }
    .form-no-badges { font-size: 0.78rem; color: var(--color-text-tertiary); font-style: italic; display: flex; align-items: center; gap: 5px; padding: 4px 0; }
    @media (max-width: 768px) { .page { padding: 20px; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class OrgProjectsComponent implements OnInit {
  isLoading = signal(true);
  projects = signal<IndustryProject[]>([]);
  orgBadges = signal<Badge[]>([]);
  isSaving = signal(false);
  toast = signal('');
  showCreate = false;
  orgId = '';
  badgePanelId = signal<string | null>(null);
  requiredBadges: Record<string, ProjectRequiredBadge[]> = {};
  applications: Record<string, ProjectApplication[]> = {};

  form: CreateProjectRequest = { title: '', description: '', skillsRequired: '', maxCandidates: 5 };
  formBadgeIds: string[] = [];

  availableFormBadges = () => this.orgBadges().filter(b => !this.formBadgeIds.includes(b.id));
  getBadgeName(id: string) { return this.orgBadges().find(b => b.id === id)?.name ?? id; }
  addFormBadge(id: string) { if (id && !this.formBadgeIds.includes(id)) this.formBadgeIds = [...this.formBadgeIds, id]; }
  removeFormBadge(id: string) { this.formBadgeIds = this.formBadgeIds.filter(b => b !== id); }

  constructor(
    private projectService: ProjectService,
    private badgeService: BadgeService,
    private orgService: OrganisationService
  ) {}

  ngOnInit() {
    this.orgService.getMyOrganisations().subscribe({
      next: orgs => {
        const active = orgs.find(o => o.verificationStatus === 'VERIFIED') ?? orgs[0];
        if (!active) { this.isLoading.set(false); return; }
        this.orgId = active.id;
        this.loadProjects();
        this.badgeService.getAllBadges().subscribe({ next: b => this.orgBadges.set(b), error: () => {} });
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadProjects() {
    this.projectService.getOrgProjects(this.orgId).subscribe({
      next: projects => {
        this.projects.set(projects);
        this.isLoading.set(false);
        projects.forEach(p => this.loadRequiredBadges(p.id));
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadRequiredBadges(projectId: string) {
    this.projectService.getRequiredBadges(projectId).subscribe({
      next: badges => this.requiredBadges[projectId] = badges,
      error: () => {}
    });
  }

  loadApplications(projectId: string) {
    this.projectService.getProjectApplications(projectId).subscribe({
      next: apps => this.applications[projectId] = apps,
      error: () => {}
    });
  }

  createProject() {
    if (!this.form.title || !this.orgId) return;
    this.isSaving.set(true);
    this.projectService.createProject(this.orgId, this.form).subscribe({
      next: p => {
        this.projects.update(l => [p, ...l]);
        this.requiredBadges[p.id] = [];
        // Link any badges selected in the form
        const badgesToLink = [...this.formBadgeIds];
        this.form = { title: '', description: '', skillsRequired: '', maxCandidates: 5 };
        this.formBadgeIds = [];
        this.showCreate = false;
        this.isSaving.set(false);
        if (badgesToLink.length) {
          badgesToLink.forEach(badgeId =>
            this.projectService.addRequiredBadge(p.id, badgeId).subscribe({
              next: rb => this.requiredBadges[p.id] = [...(this.requiredBadges[p.id] || []), rb],
              error: () => {}
            })
          );
          this.showToast(`Project created with ${badgesToLink.length} badge requirement${badgesToLink.length > 1 ? 's' : ''}!`);
        } else {
          this.showToast('Project created!');
        }
      },
      error: () => { this.isSaving.set(false); this.showToast('Failed to create project.'); }
    });
  }

  publishProject(id: string) {
    this.projectService.publishProject(id).subscribe({
      next: updated => { this.projects.update(l => l.map(p => p.id === id ? updated : p)); this.showToast('Project published!'); },
      error: () => this.showToast('Failed to publish.')
    });
  }

  closeProject(id: string) {
    this.projectService.closeProject(id).subscribe({
      next: updated => { this.projects.update(l => l.map(p => p.id === id ? updated : p)); this.showToast('Project closed.'); },
      error: () => this.showToast('Failed to close.')
    });
  }

  deleteProject(id: string) {
    if (!confirm('Delete this project?')) return;
    this.projectService.deleteProject(id).subscribe({
      next: () => { this.projects.update(l => l.filter(p => p.id !== id)); this.showToast('Project deleted.'); },
      error: () => this.showToast('Failed to delete.')
    });
  }

  toggleBadgePanel(projectId: string) {
    this.badgePanelId.set(this.badgePanelId() === projectId ? null : projectId);
  }

  addRequiredBadge(projectId: string, badgeId: string) {
    if (!badgeId) return;
    this.projectService.addRequiredBadge(projectId, badgeId).subscribe({
      next: rb => {
        this.requiredBadges[projectId] = [...(this.requiredBadges[projectId] || []), rb];
        this.badgePanelId.set(null);
        this.showToast('Badge requirement added.');
      },
      error: () => this.showToast('Failed to add badge.')
    });
  }

  removeRequiredBadge(projectId: string, badgeId: string) {
    this.projectService.removeRequiredBadge(projectId, badgeId).subscribe({
      next: () => {
        this.requiredBadges[projectId] = this.requiredBadges[projectId]?.filter(r => r.badgeId !== badgeId);
        this.showToast('Badge requirement removed.');
      },
      error: () => this.showToast('Failed to remove badge.')
    });
  }

  reviewApp(projectId: string, appId: string, status: string) {
    this.projectService.reviewApplication(appId, status).subscribe({
      next: updated => {
        this.applications[projectId] = this.applications[projectId].map(a => a.id === appId ? updated : a);
        this.showToast(`Application ${status.toLowerCase()}.`);
      },
      error: () => this.showToast('Failed to update application.')
    });
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3000); }
}
