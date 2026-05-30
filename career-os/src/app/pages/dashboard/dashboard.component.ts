import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { JobService, Job } from '../../services/job.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-content">
      <div class="welcome-banner">
        <div class="banner-text">
          <h1>Welcome back, {{ firstName() }}! 👋</h1>
          <p>Here's what's happening with your career journey today.</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon applications">
            <i class="ph ph-briefcase"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Applications</span>
            <span class="stat-value">24</span>
            <span class="stat-change positive">+3 this week</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon interviews">
            <i class="ph ph-calendar"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Interviews</span>
            <span class="stat-value">5</span>
            <span class="stat-change positive">+1 scheduled</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon offers">
            <i class="ph ph-medal"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Offers</span>
            <span class="stat-value">2</span>
            <span class="stat-change">Maintain momentum</span>
          </div>
        </div>
      </div>

      <div class="content-sections">
        <div class="main-section card">
          <div class="card-header">
            <h3>Recent Activity</h3>
            <button class="btn-text">View All</button>
          </div>
          <div class="activity-list">
            <div class="activity-item">
              <div class="dot active"></div>
              <div class="activity-details">
                <p class="activity-title">Interview scheduled with <strong>Google</strong></p>
                <p class="activity-time">2 hours ago</p>
              </div>
            </div>
            <div class="activity-item">
              <div class="dot"></div>
              <div class="activity-details">
                <p class="activity-title">Application sent to <strong>Stripe</strong></p>
                <p class="activity-time">Yesterday</p>
              </div>
            </div>
            <div class="activity-item">
              <div class="dot"></div>
              <div class="activity-details">
                <p class="activity-title">Resume updated: <strong>Frontend Dev v2</strong></p>
                <p class="activity-time">Oct 24, 2025</p>
              </div>
            </div>
          </div>
        </div>

        <div class="side-section card">
          <div class="card-header">
            <h3>Quick Tasks</h3>
          </div>
          <div class="tasks-list">
            <div class="task-item">
              <input type="checkbox" id="t1" checked>
              <label for="t1">Apply to 5 jobs</label>
            </div>
            <div class="task-item">
              <input type="checkbox" id="t2">
              <label for="t2">Follow up with recruiter</label>
            </div>
            <div class="task-item">
              <input type="checkbox" id="t3">
              <label for="t3">Update portfolio</label>
            </div>
          </div>
        </div>
      </div>

      <div class="recommended-section">
        <div class="section-header">
          <h3>Recommended Jobs</h3>
          <button class="btn-text" *ngIf="(jobs$ | async)?.length">View All</button>
        </div>
        
        <ng-container *ngIf="(jobs$ | async) as jobs">
          <div class="empty-state" *ngIf="jobs.length === 0">
            <i class="ph ph-briefcase empty-icon"></i>
            <h4>No recommended jobs available yet</h4>
            <p>Employers haven't posted any jobs that match your profile.</p>
          </div>

          <div class="carousel-container" *ngIf="jobs.length > 0">
            <div class="job-card" *ngFor="let job of jobs" (click)="viewJob(job.id)">
              <div class="job-card-header">
                <div class="company-logo">{{ job.initials }}</div>
                <span class="badge new-badge" *ngIf="job.isNew">New</span>
              </div>
              
              <div class="job-card-body">
                <h4 class="job-title">{{ job.title }}</h4>
                <p class="company-name">{{ job.company }}</p>
                
                <div class="job-meta">
                  <span class="meta-item"><i class="ph ph-map-pin"></i> {{ job.location }}</span>
                  <span class="badge employment-badge">{{ job.employmentType }}</span>
                </div>
              </div>
              
              <div class="job-card-footer">
                <div class="salary-range">RM{{ job.minSalary }} - RM{{ job.maxSalary }}</div>
                <div class="skills-row" *ngIf="job.roleRequirements.length > 0">
                  <span class="skill-tag" *ngFor="let skill of job.roleRequirements[0].technicalSkills">{{ skill.technicalSkillText }}</span>
                </div>
                <div class="job-footer-meta">
                  <span class="deadline">Apply by {{ job.deadline }}</span>
                  <span class="vacancies">{{ job.vacancies }} vacancy(s)</span>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .welcome-banner {
      background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
      padding: 40px;
      border-radius: 24px;
      color: white;
      box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.4);
    }

    .welcome-banner h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .welcome-banner p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: var(--color-surface);
      padding: 24px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      border: 1px solid var(--color-border);
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      border-color: rgba(16, 185, 129, 0.2);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-icon.applications { background: rgba(16, 185, 129, 0.1); color: var(--color-primary); }
    .stat-icon.interviews { background: rgba(59, 130, 246, 0.1); color: var(--color-info); }
    .stat-icon.offers { background: rgba(168, 85, 247, 0.1); color: #a855f7; }

    .stat-info { display: flex; flex-direction: column; }
    .stat-label { font-size: 0.875rem; color: var(--color-text-secondary); font-weight: 500; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--color-text); margin: 4px 0; }
    .stat-change { font-size: 0.75rem; color: var(--color-text-tertiary); }
    .stat-change.positive { color: var(--color-success); }

    .content-sections {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .content-sections { grid-template-columns: 1fr; }
    }

    .card {
      background: var(--color-surface);
      border-radius: 20px;
      padding: 24px;
      border: 1px solid var(--color-border);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .card-header h3 { margin: 0; font-size: 1.125rem; font-weight: 600; color: var(--color-text); }
    .btn-text { background: none; border: none; color: var(--color-primary); font-weight: 600; cursor: pointer; }

    .activity-list, .tasks-list { display: flex; flex-direction: column; gap: 16px; }

    .activity-item { display: flex; gap: 16px; align-items: flex-start; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-text-tertiary); margin-top: 6px; flex-shrink: 0; }
    .dot.active { background: var(--color-primary); box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
    
    .activity-title { margin: 0; font-size: 0.9375rem; color: var(--color-text); }
    .activity-time { margin: 4px 0 0 0; font-size: 0.8125rem; color: var(--color-text-tertiary); }

    .task-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--color-surface-secondary);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      cursor: pointer;
    }

    .task-item input { accent-color: var(--color-primary); width: 18px; height: 18px; }
    .task-item label { cursor: pointer; font-size: 0.9375rem; color: var(--color-text-secondary); }
    .task-item input:checked + label { text-decoration: line-through; opacity: 0.4; }

    /* Recommended Jobs Styles */
    .recommended-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      background: var(--color-surface);
      border: 1px dashed var(--color-border);
      border-radius: 16px;
      color: var(--color-text-secondary);
      text-align: center;
    }

    .empty-icon {
      font-size: 3rem;
      color: var(--color-text-tertiary);
      margin-bottom: 16px;
    }

    .empty-state h4 {
      margin: 0;
      color: var(--color-text);
      font-size: 1.125rem;
    }

    .empty-state p {
      margin: 8px 0 0 0;
      font-size: 0.9375rem;
    }

    .carousel-container {
      display: flex;
      overflow-x: auto;
      gap: 20px;
      padding-bottom: 12px;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }

    .carousel-container::-webkit-scrollbar {
      display: none;
    }

    .job-card {
      min-width: 320px;
      max-width: 320px;
      flex: 0 0 auto;
      scroll-snap-align: start;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.2s ease-in-out;
    }

    .job-card:hover {
      transform: translateY(-4px);
      border-color: rgba(16, 185, 129, 0.3);
      box-shadow: 0 10px 25px -10px rgba(16, 185, 129, 0.15);
    }

    .job-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .company-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--color-surface-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: var(--color-text);
      font-size: 1.125rem;
      border: 1px solid var(--color-border);
    }

    .badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .new-badge {
      background: rgba(59, 130, 246, 0.1);
      color: var(--color-info);
    }

    .employment-badge {
      background: var(--color-surface-secondary);
      color: var(--color-text-secondary);
    }

    .job-card-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .job-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .company-name {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .job-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
    }

    .meta-item {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .job-card-footer {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px dashed var(--color-border);
    }

    .salary-range {
      font-weight: 600;
      color: var(--color-primary);
      font-size: 0.9375rem;
    }

    .skills-row {
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;
      overflow: hidden;
    }

    .skill-tag {
      font-size: 0.75rem;
      padding: 4px 8px;
      border-radius: 6px;
      background: var(--color-surface-secondary);
      color: var(--color-text-tertiary);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .job-footer-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
    }
  `]
})
export class DashboardComponent implements OnInit {
  jobs$: Observable<Job[]>;

  constructor(
    private authService: AuthService, 
    private jobService: JobService,
    private router: Router
  ) {
    this.jobs$ = this.jobService.jobs$;
  }

  ngOnInit() {
    this.jobService.loadJobs();
  }

  firstName() {
    return this.authService.getCurrentUser()?.firstName || 'User';
  }

  viewJob(id?: string) {
    if (id) {
      this.router.navigate(['/jobs', id]);
    }
  }
}
