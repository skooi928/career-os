import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganisationService } from '../../../services/organisation.service';
import { UpskillingService } from '../../../services/upskilling.service';
import { BadgeService } from '../../../services/badge.service';
import { JobService, Job } from '../../../services/job.service';
import { CourseCardComponent } from '../../../components/course-card/course-card.component';
import { StatusPillComponent } from '../../../components/status-pill/status-pill.component';
import { BadgeCardComponent } from '../../../components/badge-card/badge-card.component';
import { Organisation, Course, Badge } from '../../../types/upskilling.types';

@Component({
  selector: 'app-org-public',
  standalone: true,
  imports: [CommonModule, CourseCardComponent, StatusPillComponent, BadgeCardComponent],
  template: `
    <div *ngIf="org(); else loadingTpl">
      <div class="org-hero">
        <div class="org-identity">
          <div class="org-logo" *ngIf="org()!.logoUrl; else logoPlaceholder">
            <img [src]="org()!.logoUrl" [alt]="org()!.name">
          </div>
          <ng-template #logoPlaceholder>
            <div class="logo-ph">{{ org()!.name[0] }}</div>
          </ng-template>
          <div class="org-meta">
            <div class="org-name-row">
              <h1>{{ org()!.name }}</h1>
              <app-status-pill [status]="org()!.type"></app-status-pill>
              <app-status-pill [status]="org()!.verificationStatus"></app-status-pill>
            </div>
            <p class="website" *ngIf="org()!.website"><i class="ph ph-globe"></i>
              <a [href]="org()!.website" target="_blank" rel="noopener noreferrer">{{ org()!.website }}</a>
            </p>
            <p class="desc">{{ org()!.description }}</p>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button [class.active]="tab() === 'courses'" (click)="tab.set('courses')">
          <i class="ph ph-chalkboard-teacher"></i> Courses ({{ courses().length }})
        </button>
        <button [class.active]="tab() === 'jobs'" (click)="tab.set('jobs')">
          <i class="ph ph-briefcase"></i> Jobs ({{ filteredJobs().length }})
        </button>
        <button [class.active]="tab() === 'badges'" (click)="tab.set('badges')" *ngIf="badges().length > 0">
          <i class="ph ph-medal"></i> Badges ({{ badges().length }})
        </button>
      </div>

      <div class="tab-body" [ngSwitch]="tab()">
        <!-- Courses Tab -->
        <ng-container *ngSwitchCase="'courses'">
          <div class="empty-tab" *ngIf="courses().length === 0">
            <i class="ph ph-books"></i>
            <p>No published courses</p>
          </div>
          <div class="courses-grid" *ngIf="courses().length > 0">
            <app-course-card *ngFor="let c of courses()" [course]="c" [showEnroll]="false"></app-course-card>
          </div>
        </ng-container>

        <!-- Jobs Tab -->
        <ng-container *ngSwitchCase="'jobs'">
          <div class="empty-tab" *ngIf="filteredJobs().length === 0">
            <i class="ph ph-briefcase"></i>
            <p>No jobs posted yet</p>
          </div>
          <div class="jobs-grid" *ngIf="filteredJobs().length > 0">
            <div class="job-card" *ngFor="let job of filteredJobs()" (click)="viewJob(job.id)">
              <div class="job-card-header">
                <div class="logo-group">
                  <div class="company-logo bg-primary">{{ job.initials }}</div>
                  <div class="company-title-wrap">
                    <p class="company-name">{{ job.company }}</p>
                    <h4 class="job-title">{{ job.title }}</h4>
                  </div>
                </div>
                <div class="header-actions">
                  <span class="new-badge" *ngIf="job.isNew">NEW</span>
                </div>
              </div>
              
              <div class="job-meta">
                <span class="meta-item"><i class="ph ph-map-pin"></i> {{ job.location }}</span>
                <span class="meta-item"><i class="ph ph-clock"></i> {{ job.employmentType }}</span>
              </div>
              
              <div class="job-description">
                {{ truncate(job.roleRequirements[0]?.jobDescription, 120) }}
              </div>

              <div class="tags-row" *ngIf="job.roleRequirements && job.roleRequirements.length > 0 && job.roleRequirements[0].technicalSkills">
                <span class="skill-tag" *ngFor="let skill of job.roleRequirements[0].technicalSkills.slice(0, 3)">
                  {{ skill.technicalSkillText }}
                </span>
                <span class="skill-tag" *ngIf="job.roleRequirements[0].technicalSkills.length > 3">
                  +{{ job.roleRequirements[0].technicalSkills.length - 3 }}
                </span>
              </div>
              
              <div class="job-card-footer">
                <span class="salary-range">RM{{ formatNumber(job.minSalary) }} - RM{{ formatNumber(job.maxSalary) }}</span>
                <button class="btn-apply-now" (click)="$event.stopPropagation(); viewJob(job.id)">View Details</button>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Badges Tab -->
        <ng-container *ngSwitchCase="'badges'">
          <div class="empty-tab" *ngIf="badges().length === 0">
            <i class="ph ph-medal"></i>
            <p>No badges created yet</p>
          </div>
          <div class="badges-grid" *ngIf="badges().length > 0">
            <app-badge-card *ngFor="let b of badges()"
              [name]="b.name"
              [description]="b.description"
              [imageUrl]="b.badgeImageUrl"
              [orgName]="org()?.name"
              [skillTag]="b.skillTag"
              status="VERIFIED">
            </app-badge-card>
          </div>
        </ng-container>
      </div>
    </div>
    <ng-template #loadingTpl>
      <div class="loading-full"><div class="spinner"></div></div>
    </ng-template>
  `,
  styles: [`
    .org-hero { background: var(--color-surface); border-bottom: 1px solid var(--color-border); padding: 32px 40px; }
    .org-identity { display: flex; align-items: flex-start; gap: 20px; }
    .org-logo img, .logo-ph { width: 72px; height: 72px; border-radius: 16px; object-fit: contain; flex-shrink: 0; }
    .logo-ph { background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; }
    .org-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 6px; }
    .org-name-row h1 { font-size: 1.5rem; font-weight: 800; color: var(--color-text); margin: 0; }
    .website { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--color-primary); margin: 0 0 8px; }
    .website a { color: inherit; text-decoration: none; }
    .desc { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; max-width: 600px; }
    .tabs { display: flex; gap: 4px; padding: 16px 40px 0; border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
    .tabs button { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border: none; background: transparent; color: var(--color-text-secondary); font-size: 0.875rem; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s; }
    .tabs button.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: 700; }
    .tab-body { padding: 28px 40px; }
    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .empty-tab { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 8px; color: var(--color-text-tertiary); }
    .empty-tab i { font-size: 2.5rem; }
    .loading-full { display: flex; justify-content: center; align-items: center; padding: 80px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* Jobs styles */
    .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .job-card { background: var(--color-surface); border-radius: 16px; border: 1px solid var(--color-border); padding: 24px; display: flex; flex-direction: column; gap: 16px; cursor: pointer; transition: all 0.2s ease-in-out; }
    .job-card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-color: rgba(5, 150, 105, 0.3); transform: translateY(-2px); }
    .job-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .logo-group { display: flex; gap: 12px; overflow: hidden; }
    .company-logo { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: 700; flex-shrink: 0; }
    .bg-primary { background: #059669; }
    .company-title-wrap { display: flex; flex-direction: column; overflow: hidden; }
    .company-name { font-size: 14px; color: var(--color-text-secondary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .job-title { margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .new-badge { background: #d1fae5; color: #059669; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 9999px; }
    .job-meta { display: flex; gap: 16px; }
    .meta-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--color-text-secondary); }
    .job-description { font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.5; }
    .tags-row { display: flex; flex-wrap: nowrap; gap: 8px; overflow: hidden; }
    .skill-tag { font-size: 11px; font-weight: 600; background: var(--color-surface-secondary); color: var(--color-text-secondary); padding: 4px 10px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; }
    .job-card-footer { border-top: 1px solid var(--color-border); padding-top: 20px; margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
    .salary-range { font-size: 15px; font-weight: 700; color: var(--color-text); }
    .btn-apply-now { background: #ecfdf5; color: #059669; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
    .btn-apply-now:hover { background: #d1fae5; }
    
    @media (max-width: 768px) { .org-hero { padding: 20px; } .tabs { padding: 12px 20px 0; } .tab-body { padding: 20px; } }
  `]
})
export class OrgPublicComponent implements OnInit {
  org = signal<Organisation | null>(null);
  courses = signal<Course[]>([]);
  badges = signal<Badge[]>([]);
  tab = signal<'courses' | 'jobs' | 'badges'>('courses');

  orgMemberUserIds = signal<Set<string>>(new Set());
  allJobs = signal<Job[]>([]);

  filteredJobs = computed(() => {
    const orgData = this.org();
    if (!orgData) return [];
    const memberIds = this.orgMemberUserIds();
    const orgNameLower = orgData.name.toLowerCase();
    return this.allJobs().filter(job => {
      if (job.employerId && memberIds.has(job.employerId)) return true;
      if (job.company && job.company.toLowerCase() === orgNameLower) return true;
      return false;
    });
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orgService: OrganisationService,
    private upskillingService: UpskillingService,
    private badgeService: BadgeService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.orgService.getOrganisationById(id).subscribe({ next: o => this.org.set(o), error: () => {} });
    // Use the global published-courses endpoint and filter by org — avoids needing a member token
    this.upskillingService.getPublishedCourses().subscribe({
      next: all => this.courses.set(all.filter(c => c.organisationId === id)),
      error: () => {}
    });
    this.badgeService.getOrgBadges(id).subscribe({ next: b => this.badges.set(b), error: () => {} });

    // Fetch members and filter jobs
    this.orgService.getMembers(id).subscribe({
      next: members => {
        const memberUserIds = new Set(members.map(m => m.userId));
        this.orgMemberUserIds.set(memberUserIds);
      },
      error: () => {}
    });

    this.jobService.loadJobs();
    this.jobService.jobs$.subscribe({
      next: jobs => this.allJobs.set(jobs),
      error: () => {}
    });
  }

  viewJob(jobId: string | undefined) {
    if (jobId) {
      this.router.navigate(['/jobs', jobId]);
    }
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-MY').format(num);
  }

  truncate(text: string | undefined, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}
