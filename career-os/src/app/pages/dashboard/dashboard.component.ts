import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { JobService, Job } from '../../services/job.service';
import { ProfileService, QuickTask } from '../../services/profile.service';
import { CareerAnalysisService } from '../../services/career-analysis.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-content">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <!-- Decorative circles -->
        <div class="circle circle-large"></div>
        <div class="circle circle-small"></div>
        
        <div class="banner-left">
          <div class="career-summary-tag">
            <i class="ph-fill ph-sparkle"></i> CAREER SUMMARY
          </div>
          <h1>Welcome back, {{ firstName() }}! 👋</h1>
          <p>Here's what's happening with your career journey today.</p>
        </div>

        <button class="btn-analyze-career" (click)="analyzeCareer()">
          <i class="ph ph-lightning-charge"></i>
          Analyze Career Path
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card emerald">
          <div class="stat-icon">
            <i class="ph ph-file-text"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">24</span>
            <span class="stat-label">Applications</span>
            <span class="stat-change">+3 this week</span>
          </div>
        </div>

        <div class="stat-card blue">
          <div class="stat-icon">
            <i class="ph ph-calendar-check"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">5</span>
            <span class="stat-label">Interviews</span>
            <span class="stat-change">+1 scheduled</span>
          </div>
        </div>

        <div class="stat-card amber">
          <div class="stat-icon">
            <i class="ph ph-lightbulb"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">2</span>
            <span class="stat-label">Offers</span>
            <span class="stat-change">Maintain momentum</span>
          </div>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="content-sections">
        <!-- Recent Activity -->
        <div class="main-section card">
          <div class="card-header">
            <h3>Recent Activity</h3>
            <button class="btn-text">View All</button>
          </div>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-avatar bg-emerald">
                <i class="ph ph-calendar-check"></i>
              </div>
              <div class="activity-details">
                <p class="activity-title">Interview scheduled with <strong>Google</strong></p>
                <div class="activity-time">
                  <i class="ph ph-clock"></i> 2 hours ago
                </div>
              </div>
              <div class="hover-dot"></div>
            </div>
            <div class="activity-item">
              <div class="activity-avatar bg-green">
                <i class="ph ph-paper-plane-tilt"></i>
              </div>
              <div class="activity-details">
                <p class="activity-title">Application sent to <strong>Stripe</strong></p>
                <div class="activity-time">
                  <i class="ph ph-clock"></i> Yesterday
                </div>
              </div>
              <div class="hover-dot"></div>
            </div>
            <div class="activity-item">
              <div class="activity-avatar bg-amber">
                <i class="ph ph-pencil-simple"></i>
              </div>
              <div class="activity-details">
                <p class="activity-title">Resume updated: <strong>Frontend Dev v2</strong></p>
                <div class="activity-time">
                  <i class="ph ph-clock"></i> Oct 24, 2025
                </div>
              </div>
              <div class="hover-dot"></div>
            </div>
          </div>
        </div>

        <!-- Quick Tasks -->
        <div class="side-section card">
          <div class="card-header">
            <h3>Quick Tasks</h3>
            <span class="task-count">{{ tasks.length }} items</span>
          </div>
          <div class="tasks-list">
            <button *ngFor="let task of tasks" class="task-btn" [ngClass]="task.status === 'closed' ? 'done' : 'undone'" (click)="toggleTask(task)">
              <i class="check-icon" [ngClass]="task.status === 'closed' ? 'ph-fill ph-check-circle' : 'ph ph-circle'"></i>
              <span class="task-label">{{ task.description }}</span>
              <span class="priority-badge" [ngClass]="task.priority">{{ task.priority | uppercase }}</span>
            </button>
            
            <div *ngIf="isAddingTask" class="add-task-form">
              <input type="text" [(ngModel)]="newTaskDescription" placeholder="Task description..." class="task-input" (keyup.enter)="saveTask()">
              <div class="task-form-actions">
                <select [(ngModel)]="newTaskPriority" class="priority-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div class="action-btns">
                  <button class="btn-cancel-task" (click)="isAddingTask = false"><i class="ph ph-x"></i></button>
                  <button class="btn-save-task" (click)="saveTask()"><i class="ph ph-check"></i></button>
                </div>
              </div>
            </div>

            <button *ngIf="!isAddingTask" class="add-task-btn" (click)="isAddingTask = true">
              <i class="ph ph-plus"></i> Add task
            </button>
          </div>
        </div>
      </div>

      <!-- Recommended Jobs -->
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
                <div class="logo-group">
                  <div class="company-logo bg-red-600">{{ job.initials }}</div>
                  <div class="company-title-wrap">
                    <p class="company-name">{{ job.company }}</p>
                    <h4 class="job-title">{{ job.title }}</h4>
                  </div>
                </div>
                <div class="header-actions">
                  <span class="new-badge" *ngIf="job.isNew">NEW</span>
                  <button class="btn-bookmark" (click)="toggleBookmark($event, job)">
                    <i [class]="$any(job).isSaved ? 'ph-fill ph-bookmark active-icon' : 'ph ph-bookmark inactive-icon'"></i>
                  </button>
                </div>
              </div>
              
              <div class="job-meta">
                <span class="meta-item"><i class="ph ph-map-pin"></i> {{ job.location }}</span>
                <span class="meta-item"><i class="ph ph-clock"></i> {{ job.employmentType }}</span>
              </div>
              
              <div class="tags-row" *ngIf="job.roleRequirements.length > 0">
                <span class="skill-tag" *ngFor="let skill of job.roleRequirements[0].technicalSkills.slice(0,4)">
                  {{ skill.technicalSkillText }}
                </span>
                <span class="skill-tag" *ngIf="job.roleRequirements[0].technicalSkills.length > 4">
                  +{{ job.roleRequirements[0].technicalSkills.length - 4 }}
                </span>
              </div>
              
              <div class="job-card-footer">
                <span class="salary-range">RM{{ formatNumber(job.minSalary) }} - RM{{ formatNumber(job.maxSalary) }}</span>
                <button class="btn-apply-now" (click)="$event.stopPropagation(); viewJob(job.id)">Apply Now</button>
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
      padding-bottom: 32px;
    }

    /* Typography Defaults for Dashboard */
    h3 { font-size: 18px; font-weight: 500; color: var(--color-text); margin: 0; }
    p { margin: 0; }

    /* 3. Welcome Banner */
    .welcome-banner {
      border-radius: 24px;
      padding: 40px;
      background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 32px;
      color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .circle {
      position: absolute;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    .circle-large {
      width: 256px;
      height: 256px;
      top: -128px;
      right: -64px;
    }

    .circle-small {
      width: 160px;
      height: 160px;
      bottom: -80px;
      left: 33%;
    }

    .banner-left {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .career-summary-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #a7f3d0;
      margin-bottom: 8px;
    }

    .career-summary-tag i { color: #fde047; font-size: 14px; }

    .banner-left h1 { margin: 0; font-size: 2.25rem; font-weight: 800; letter-spacing: -0.02em; color: white; }
    .banner-left p { font-size: 1.0625rem; color: #d1fae5; opacity: 0.9; margin: 8px 0 0 0; }

    .btn-analyze-career {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 12px 20px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      white-space: nowrap;
    }

    .btn-analyze-career:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .btn-analyze-career i {
      font-size: 18px;
    }

    .banner-right {
      position: relative;
      z-index: 10;
    }

    .interview-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .interview-icon-wrapper i { font-size: 24px; color: #a7f3d0; }
    .interview-details { display: flex; flex-direction: column; }
    .interview-label { font-size: 10px; color: #a7f3d0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .interview-time { font-size: 14px; font-weight: 600; color: white; }

    @media (max-width: 768px) {
      .welcome-banner {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
      .banner-right { display: none; }
      .btn-analyze-career {
        width: 100%;
        justify-content: center;
      }
    }

    /* 4. Stats Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
    }

    .stat-card {
      background: var(--color-surface);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      transition: all 0.2s ease-in-out;
    }

    .stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .stat-info { display: flex; flex-direction: column; gap: 4px; }
    .stat-value { font-size: 30px; font-weight: 600; color: var(--color-text); line-height: 1; }
    .stat-label { font-size: 14px; color: var(--color-text-secondary); }
    .stat-change { 
      font-size: 10px; 
      font-weight: 500; 
      padding: 4px 8px; 
      border-radius: 6px; 
      width: fit-content; 
      margin-top: 8px; 
    }

    /* Color Themes */
    .emerald { border: 1px solid #d1fae5; }
    .emerald .stat-icon { background: #d1fae5; color: #059669; }
    .emerald .stat-change { background: #d1fae5; color: #059669; }

    .blue { border: 1px solid #dbeafe; }
    .blue .stat-icon { background: #dbeafe; color: #2563eb; }
    .blue .stat-change { background: #dbeafe; color: #2563eb; }

    .amber { border: 1px solid #fef3c7; }
    .amber .stat-icon { background: #fef3c7; color: #f59e0b; }
    .amber .stat-change { background: #fef3c7; color: #d97706; }

    /* Content Sections Layout */
    .content-sections {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .content-sections { grid-template-columns: 1fr; }
    }

    .card {
      background: var(--color-surface);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      padding: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .btn-text {
      background: none;
      border: none;
      color: #059669;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
    }

    /* 5. Recent Activity */
    .activity-list { display: flex; flex-direction: column; gap: 4px; }
    
    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      transition: background-color 0.2s;
      position: relative;
    }
    .activity-item:hover { background: var(--color-surface-secondary); }
    .activity-item:hover .hover-dot { opacity: 1; }

    .activity-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      flex-shrink: 0;
    }
    .bg-emerald { background: #059669; }
    .bg-green { background: #22c55e; }
    .bg-amber { background: #f59e0b; }

    .activity-details { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .activity-title { font-size: 14px; color: var(--color-text); }
    .activity-title strong { color: var(--color-text); font-weight: 600; }
    .activity-time { font-size: 11px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px; }

    .hover-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #059669;
      opacity: 0;
      transition: opacity 0.2s;
      margin-left: auto;
    }

    /* 6. Quick Tasks */
    .task-count {
      background: var(--color-surface-secondary);
      color: var(--color-text-secondary);
      font-size: 10px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .tasks-list { display: flex; flex-direction: column; gap: 8px; }

    .task-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }

    .task-btn.done {
      background: var(--color-surface-secondary);
      border: 1px solid var(--color-border);
    }
    .task-btn.done .check-icon { color: #059669; font-size: 20px; }
    .task-btn.done .task-label { text-decoration: line-through; color: var(--color-text-secondary); font-size: 14px; flex: 1; opacity: 0.7; }

    .task-btn.undone {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
    }
    .task-btn.undone:hover {
      border-color: rgba(5, 150, 105, 0.3);
      background-color: rgba(5, 150, 105, 0.05);
    }
    .task-btn.undone .check-icon { color: var(--color-text-secondary); font-size: 20px; }
    .task-btn.undone .task-label { color: var(--color-text); font-size: 14px; flex: 1; }

    .priority-badge {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .priority-badge.high { background: #ffe4e6; color: #e11d48; }
    .priority-badge.medium { background: #fef3c7; color: #d97706; }
    .priority-badge.low { background: #d1fae5; color: #059669; }

    .add-task-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border: 1px dashed var(--color-border);
      border-radius: 8px;
      background: transparent;
      color: var(--color-text-secondary);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .add-task-btn:hover {
      border-color: rgba(5, 150, 105, 0.4);
      color: #059669;
    }

    .add-task-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-surface);
    }
    .task-input {
      width: 100%;
      border: none;
      background: transparent;
      color: var(--color-text);
      font-size: 14px;
      outline: none;
    }
    .task-form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    .priority-select {
      background: var(--color-surface-secondary);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 11px;
      outline: none;
    }
    .action-btns {
      display: flex;
      gap: 8px;
    }
    .btn-cancel-task, .btn-save-task {
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    .btn-cancel-task { color: var(--color-text-tertiary); }
    .btn-save-task { color: #059669; background: #ecfdf5; }

    /* 7. Recommended Jobs */
    .recommended-section { display: flex; flex-direction: column; gap: 16px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; }

    .carousel-container {
      display: flex;
      overflow-x: auto;
      gap: 20px;
      padding-bottom: 16px;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }
    .carousel-container::-webkit-scrollbar { display: none; }

    .job-card {
      min-width: 320px;
      max-width: 320px;
      flex: 0 0 auto;
      scroll-snap-align: start;
      background: var(--color-surface);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
    .job-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border-color: rgba(5, 150, 105, 0.3);
    }

    .job-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    
    .logo-group {
      display: flex;
      gap: 12px;
      overflow: hidden;
    }

    .company-logo {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .bg-red-600 { background: #dc2626; }

    .company-title-wrap {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .company-name {
      font-size: 14px;
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .job-title {
      margin: 2px 0 0 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .new-badge {
      background: #d1fae5;
      color: #059669;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .btn-bookmark {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      color: var(--color-text-tertiary);
      transition: all 0.2s;
    }
    .btn-bookmark:hover { background: var(--color-surface-secondary); }
    .active-icon { color: #059669; }

    .job-meta {
      display: flex;
      gap: 12px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--color-text-secondary);
    }

    .tags-row {
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;
      overflow: hidden;
    }
    .skill-tag {
      font-size: 11px;
      font-weight: 500;
      background: var(--color-surface-secondary);
      color: var(--color-text-secondary);
      padding: 2px 8px;
      border-radius: 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .job-card-footer {
      border-top: 1px solid var(--color-border);
      padding-top: 16px;
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .salary-range {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
    }

    .btn-apply-now {
      background: #ecfdf5;
      color: #059669;
      border: none;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-apply-now:hover { background: #d1fae5; }
  `]
})
export class DashboardComponent implements OnInit {
  jobs$: Observable<Job[]>;
  tasks: QuickTask[] = [];
  isAddingTask = false;
  newTaskDescription = '';
  newTaskPriority = 'medium';
  isAnalyzing = false;

  constructor(
    private authService: AuthService, 
    private jobService: JobService,
    private profileService: ProfileService,
    private careerAnalysisService: CareerAnalysisService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.jobs$ = this.jobService.jobs$;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.jobService.loadJobs();
      this.loadTasks();
    }
  }

  loadTasks() {
    this.profileService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile.quickTasks) {
          this.tasks = profile.quickTasks;
        }
      },
      error: (err) => console.error('Failed to load tasks', err)
    });
  }

  firstName() {
    return this.authService.getCurrentUser()?.firstName || 'User';
  }

  viewJob(id?: string) {
    if (id) {
      this.router.navigate(['/jobs', id]);
    }
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  toggleBookmark(event: Event, job: any) {
    event.stopPropagation();
    job.isSaved = !job.isSaved; // Mock toggle for UI purposes
  }

  saveTask() {
    if (!this.newTaskDescription.trim()) return;
    
    const task: QuickTask = {
      description: this.newTaskDescription,
      status: 'added',
      priority: this.newTaskPriority
    };

    this.profileService.addQuickTask(task).subscribe({
      next: (savedTask) => {
        this.tasks.push(savedTask);
        this.isAddingTask = false;
        this.newTaskDescription = '';
        this.newTaskPriority = 'medium';
      },
      error: (err) => console.error('Failed to add task', err)
    });
  }

  toggleTask(task: QuickTask) {
    if (!task.id) return;
    const newStatus = task.status === 'closed' ? 'added' : 'closed';
    
    // Optimistic UI update
    const originalStatus = task.status;
    task.status = newStatus;

    this.profileService.updateQuickTask(task.id, { ...task, status: newStatus }).subscribe({
      error: (err) => {
        console.error('Failed to update task', err);
        task.status = originalStatus; // Revert on failure
      }
    });
  }

  analyzeCareer() {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    this.careerAnalysisService.analyzeCareer().subscribe({
      next: (prediction) => {
        // Navigate to insights page with the prediction data
        this.router.navigate(['/insights'], { state: { prediction } });
        this.isAnalyzing = false;
      },
      error: (err) => {
        console.error('Failed to analyze career', err);
        // Fallback navigation in case of error
        this.router.navigate(['/insights']);
        this.isAnalyzing = false;
      }
    });
  }
}
