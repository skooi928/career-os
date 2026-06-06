import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService, Job } from '../../services/job.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="job-detail-content" *ngIf="job; else loading">
      <!-- Back Navigation (Outside Banner) -->
      <div class="back-nav-container">
        <button class="btn-back" (click)="goBack()">
          <i class="ph ph-arrow-left"></i> Back to Jobs
        </button>
      </div>

      <!-- Header Banner -->
      <header class="job-banner">
        
        <div class="banner-content-row">
          <!-- Main Info -->
          <div class="banner-main">
            <div class="company-logo">
              {{ job.initials || 'CO' }}
            </div>
            <div class="banner-info">
              <div class="tags">
                <span class="badge-new" *ngIf="job.isNew">New</span>
                <span class="posted-date">Posted {{ formatDate(job.createdAt) }}</span>
              </div>
              <h1 class="job-title">{{ job.title }}</h1>
              <div class="company-meta">
                <span><i class="ph ph-buildings"></i> {{ job.company }}</span>
                <span><i class="ph ph-map-pin"></i> {{ job.location }}</span>
                <span><i class="ph ph-briefcase"></i> {{ job.employmentType }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="banner-actions">
            <button class="btn-action-banner"><i class="ph ph-bookmark"></i> Save</button>
            <button class="btn-action-banner"><i class="ph ph-share-network"></i> Share</button>
            <button class="btn-apply-banner" (click)="applyForJob()">Apply Now <i class="ph-bold ph-arrow-right"></i></button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <ul class="job-tabs">
          <li [class.active]="activeTab === 'overview'" (click)="setActiveTab('overview')">Overview</li>
          <li [class.active]="activeTab === 'requirements'" (click)="setActiveTab('requirements')">Requirements</li>
          <li [class.active]="activeTab === 'benefits'" (click)="setActiveTab('benefits')">Benefits</li>
          <li [class.active]="activeTab === 'company'" (click)="setActiveTab('company')">Company</li>
        </ul>
      </header>

      <!-- Main Layout -->
      <main class="job-content-layout">
        
        <!-- Left Column -->
        <div class="main-column">
          
          <!-- Quick Facts Strip -->
          <div class="quick-facts-strip">
            <div class="fact-item">
              <div class="fact-icon"><i class="ph ph-currency-circle-dollar text-green"></i></div>
              <div class="fact-text">
                <span class="label">Salary (RM)</span>
                <span class="value">{{ formatNumber(job.minSalary) }} – {{ formatNumber(job.maxSalary) }}</span>
              </div>
            </div>
            <div class="fact-item">
              <div class="fact-icon"><i class="ph ph-calendar-blank text-blue"></i></div>
              <div class="fact-text">
                <span class="label">Deadline</span>
                <span class="value">{{ job.deadline }}</span>
              </div>
            </div>
            <div class="fact-item">
              <div class="fact-icon"><i class="ph ph-users text-purple"></i></div>
              <div class="fact-text">
                <span class="label">Vacancies</span>
                <span class="value">{{ job.vacancies }} Positions</span>
              </div>
            </div>
            <div class="fact-item">
              <div class="fact-icon"><i class="ph ph-clock text-orange"></i></div>
              <div class="fact-text">
                <span class="label">Seniority</span>
                <span class="value">{{ getSeniorityLevel() }}</span>
              </div>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="tab-content card" [ngSwitch]="activeTab">
            
            <!-- OVERVIEW TAB -->
            <div *ngSwitchCase="'overview'" class="tab-pane">
              <h2>Job Overview</h2>
              <div class="overview-body" *ngIf="job.roleRequirements && job.roleRequirements.length > 0">
                <p class="description-text">{{ job.roleRequirements[0].jobDescription }}</p>
              </div>
              <div *ngIf="!job.roleRequirements || job.roleRequirements.length === 0">
                <p class="text-muted">No description provided.</p>
              </div>
            </div>

            <!-- REQUIREMENTS TAB -->
            <div *ngSwitchCase="'requirements'" class="tab-pane">
              <h2>Requirements</h2>
              <ng-container *ngIf="job.roleRequirements && job.roleRequirements.length > 0">
                <div *ngFor="let req of job.roleRequirements">
                  
                  <h3 class="req-title"><i class="ph-fill ph-check-circle text-primary"></i> Must Have</h3>
                  <ul class="bullet-list" *ngIf="req.mustHaveRequirements && req.mustHaveRequirements.length > 0">
                    <li *ngFor="let mustHave of req.mustHaveRequirements">{{ mustHave.requirementText }}</li>
                  </ul>
                  
                  <h3 class="req-title mt-4"><i class="ph-fill ph-code text-primary"></i> Technical Skills</h3>
                  <div class="skills-grid" *ngIf="req.technicalSkills && req.technicalSkills.length > 0">
                    <span class="skill-tag" *ngFor="let skill of req.technicalSkills">
                      {{ skill.technicalSkillText }}
                    </span>
                  </div>

                </div>
              </ng-container>
            </div>

            <!-- BENEFITS TAB -->
            <div *ngSwitchCase="'benefits'" class="tab-pane">
              <h2>What You'll Get</h2>
              
              <div class="benefits-grid" *ngIf="job.benefits && job.benefits.length > 0; else noBenefits">
                <div class="benefit-card" *ngFor="let benefit of job.benefits">
                  <div class="benefit-icon">
                    <i [class]="getBenefitIcon(benefit.benefitText)"></i>
                  </div>
                  <div class="benefit-text">
                    <h4 class="benefit-title">{{ getBenefitTitle(benefit.benefitText) }}</h4>
                    <p class="benefit-desc">{{ getBenefitSubtitle(benefit.benefitText) }}</p>
                  </div>
                </div>
              </div>
              <ng-template #noBenefits>
                <p class="text-muted">No benefits specified.</p>
              </ng-template>
            </div>

            <!-- COMPANY TAB -->
            <div *ngSwitchCase="'company'" class="tab-pane empty-state">
              <i class="ph-light ph-buildings"></i>
              <h3>Company Profile</h3>
              <p>Company profile details will be displayed here in the future.</p>
            </div>

          </div>
        </div>

        <!-- Right Column (Sidebar) -->
        <aside class="sidebar-column">
          
          <!-- Similar Jobs (Mocked) -->
          <div class="similar-jobs-card card">
            <h3>Similar Jobs</h3>
            <div class="similar-job-item">
              <div class="sj-logo bg-green">G</div>
              <div class="sj-info">
                <h4>Marketing Manager</h4>
                <p>Grab • RM7K–9K</p>
              </div>
            </div>
            <div class="similar-job-item">
              <div class="sj-logo bg-orange">S</div>
              <div class="sj-info">
                <h4>Growth Marketing Lead</h4>
                <p>Shopee • RM8K–11K</p>
              </div>
            </div>
            <div class="similar-job-item">
              <div class="sj-logo bg-blue">A</div>
              <div class="sj-info">
                <h4>Digital Strategist</h4>
                <p>Axiata • RM5K–7K</p>
              </div>
            </div>
          </div>

        </aside>

      </main>

    </div>

    <ng-template #loading>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading job details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    /* Define variables specifically for this view if needed */
    :host {
      --color-banner-bg: #11815A;
      --color-banner-text: #FFFFFF;
    }

    .job-detail-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* Header Banner */
    .job-banner {
      background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
      padding: 24px 32px;
      border-radius: 20px;
      color: white;
      box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.4);
      position: relative;
    }

    .banner-content-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .btn-back {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      font-weight: 500;
      font-size: 0.9375rem;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: color 0.2s;
    }
    .btn-back:hover {
      color: var(--color-text);
    }

    .banner-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn-action-banner {
      background: rgba(255,255,255,0.2);
      border: none;
      color: #FFF;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .btn-action-banner:hover {
      background: rgba(255,255,255,0.3);
    }

    .btn-apply-banner {
      background: #FFF;
      color: var(--color-banner-bg);
      border: none;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.2s;
    }
    .btn-apply-banner:hover {
      transform: translateY(-2px);
    }

    .banner-main {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-bottom: 24px;
    }

    .company-logo {
      width: 56px;
      height: 56px;
      background: #E11D48; /* Red logo like the mockup */
      color: white;
      font-size: 1.5rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .banner-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tags {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge-new {
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .posted-date {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.8);
    }

    .job-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .company-meta {
      display: flex;
      gap: 24px;
      font-size: 0.9375rem;
      color: rgba(255,255,255,0.9);
      font-weight: 500;
    }
    .company-meta span {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Tabs */
    .job-tabs {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      gap: 8px;
    }
    .job-tabs li {
      padding: 12px 24px;
      font-weight: 600;
      cursor: pointer;
      color: rgba(255,255,255,0.8);
      border-radius: 8px 8px 0 0;
      transition: all 0.2s;
    }
    .job-tabs li:hover {
      color: #FFF;
      background: rgba(255,255,255,0.1);
    }
    .job-tabs li.active {
      background: var(--color-background);
      color: var(--color-text);
    }

    /* Main Layout */
    .job-content-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 32px;
      margin-top: 32px;
      align-items: start;
    }

    /* Left Column */
    .quick-facts-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .fact-item {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .fact-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: var(--color-background);
    }
    
    .text-green { color: #10B981; background: rgba(16,185,129,0.1) !important;}
    .text-blue { color: #3B82F6; background: rgba(59,130,246,0.1) !important;}
    .text-purple { color: #8B5CF6; background: rgba(139,92,246,0.1) !important;}
    .text-orange { color: #F59E0B; background: rgba(245,158,11,0.1) !important;}

    .fact-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .fact-text .label {
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
      font-weight: 600;
    }
    .fact-text .value {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--color-text);
    }

    /* Card Utilities */
    .card {
      background: var(--color-surface);
      border-radius: 16px;
      border: 1px solid var(--color-border);
      padding: 32px;
      box-shadow: 0 2px 8px -2px rgba(0,0,0,0.04);
    }

    /* Tab Pane Content */
    .tab-pane h2 {
      margin: 0 0 24px 0;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--color-text);
    }

    .description-text {
      color: var(--color-text-secondary);
      line-height: 1.8;
      font-size: 1.0625rem;
      white-space: pre-line;
      margin: 0;
    }

    .req-title {
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: var(--color-text);
    }

    .bullet-list {
      padding-left: 20px;
      margin-bottom: 24px;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }
    .bullet-list li {
      margin-bottom: 8px;
    }

    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .skill-tag {
      background: var(--color-background);
      color: var(--color-text);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 500;
      border: 1px solid var(--color-border);
    }

    /* Benefits Grid */
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .benefit-card {
      background: var(--color-background);
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .benefit-icon {
      width: 48px;
      height: 48px;
      background: rgba(16, 185, 129, 0.1);
      color: #10B981;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .benefit-title {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text);
    }
    .benefit-desc {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      color: var(--color-text-secondary);
      text-align: center;
    }
    .empty-state i {
      font-size: 4rem;
      color: var(--color-text-tertiary);
      margin-bottom: 16px;
    }
    .empty-state h3 {
      margin: 0 0 8px 0;
      color: var(--color-text);
    }

    /* Sidebar */
    .sidebar-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .summary-card {
      padding: 24px;
    }

    .salary-highlight {
      margin-bottom: 24px;
    }
    .salary-highlight h2 {
      margin: 0 0 4px 0;
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-text);
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .salary-max {
      font-size: 1.25rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }
    .salary-subtitle {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .summary-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--color-border);
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9375rem;
    }
    .summary-item .label {
      color: var(--color-text-secondary);
    }
    .summary-item .value {
      font-weight: 600;
      color: var(--color-text);
    }

    .btn-apply-large {
      width: 100%;
      background: #10B981;
      color: white;
      border: none;
      padding: 14px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      margin-bottom: 12px;
      transition: background 0.2s;
    }
    .btn-apply-large:hover {
      background: #059669;
    }

    .btn-save-large {
      width: 100%;
      background: transparent;
      color: var(--color-text);
      border: 1px solid var(--color-border);
      padding: 14px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-save-large:hover {
      background: var(--color-background);
    }

    /* Similar Jobs */
    .similar-jobs-card {
      padding: 24px;
    }
    .similar-jobs-card h3 {
      margin: 0 0 20px 0;
      font-size: 1.125rem;
    }
    
    .similar-job-item {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
      cursor: pointer;
    }
    .similar-job-item:last-child {
      margin-bottom: 0;
    }
    
    .sj-logo {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      color: white;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125rem;
      flex-shrink: 0;
    }
    .bg-green { background: #10B981; }
    .bg-orange { background: #F97316; }
    .bg-blue { background: #3B82F6; }

    .sj-info h4 {
      margin: 0 0 4px 0;
      font-size: 0.9375rem;
      color: var(--color-text);
    }
    .sj-info p {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--color-text-secondary);
    }

    /* Utilities */
    .text-primary { color: var(--color-primary); }
    .mt-4 { margin-top: 1rem; }
    .text-muted { color: var(--color-text-tertiary); }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 0;
      color: var(--color-text-secondary);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(16, 185, 129, 0.2);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive Design */
    @media (max-width: 992px) {
      .job-content-layout {
        grid-template-columns: 1fr;
      }
      .quick-facts-strip {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 768px) {
      .banner-main {
        flex-direction: column;
        align-items: flex-start;
      }
      .quick-facts-strip {
        grid-template-columns: 1fr;
      }
      .benefits-grid {
        grid-template-columns: 1fr;
      }
      .company-meta {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  activeTab: string = 'overview';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getBenefitIcon(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('health') || lower.includes('medical') || lower.includes('insurance')) return 'ph ph-heart';
    if (lower.includes('remote') || lower.includes('hybrid') || lower.includes('work')) return 'ph ph-laptop';
    if (lower.includes('budget') || lower.includes('allowance') || lower.includes('salary') || lower.includes('bonus')) return 'ph ph-currency-circle-dollar';
    if (lower.includes('wellness') || lower.includes('gym') || lower.includes('mental')) return 'ph ph-coffee';
    if (lower.includes('leave') || lower.includes('vacation') || lower.includes('time off')) return 'ph ph-calendar-star';
    if (lower.includes('growth') || lower.includes('career') || lower.includes('development')) return 'ph ph-trend-up';
    if (lower.includes('food') || lower.includes('lunch') || lower.includes('pantry')) return 'ph ph-pizza';
    return 'ph ph-check-circle';
  }

  getBenefitTitle(text: string): string {
    if (text.includes(':')) return text.split(':')[0].trim();
    if (text.includes('-')) return text.split('-')[0].trim();
    
    const words = text.split(' ');
    if (words.length <= 4) return text;
    
    const lower = text.toLowerCase();
    if (lower.includes('health')) return 'Health Insurance';
    if (lower.includes('budget')) return 'Learning Budget';
    if (lower.includes('remote') || lower.includes('flexible')) return 'Remote Flexibility';
    if (lower.includes('wellness')) return 'Wellness Perks';
    if (lower.includes('salary')) return 'Competitive Salary';
    if (lower.includes('growth')) return 'Career Growth';
    
    return words.slice(0, 3).join(' ') + '...';
  }

  getBenefitSubtitle(text: string): string {
    if (text.includes(':')) return text.split(':').slice(1).join(':').trim();
    if (text.includes('-')) return text.split('-').slice(1).join('-').trim();
    
    return text;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.jobService.getJobById(id).subscribe({
          next: (data) => {
            this.job = data;
          },
          error: (err) => {
            console.error('Failed to load job', err);
            alert('Failed to load job details.');
            this.goBack();
          }
        });
      }
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  goBack() {
    this.location.back();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  formatNumber(num: number): string {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US');
  }

  getSeniorityLevel(): string {
    if (this.job && this.job.roleRequirements && this.job.roleRequirements.length > 0) {
      return this.job.roleRequirements[0].seniorityLevel || 'Not Specified';
    }
    return 'Not Specified';
  }

  getExperienceYears(): string {
    if (this.job && this.job.roleRequirements && this.job.roleRequirements.length > 0) {
      return `${this.job.roleRequirements[0].requiredExperienceYears} Years`;
    }
    return 'Not Specified';
  }

  applyForJob() {
    if (this.job && this.job.id) {
      this.router.navigate(['/jobs', this.job.id, 'apply']);
    }
  }
}
