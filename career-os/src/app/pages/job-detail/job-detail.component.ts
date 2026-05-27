import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService, Job } from '../../services/job.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="job-detail-container" *ngIf="job; else loading">
      
      <!-- Back Button -->
      <button class="btn-back" (click)="goBack()">
        <i class="ph ph-arrow-left"></i> Back to Jobs
      </button>

      <!-- Header Section -->
      <div class="header-card card">
        <div class="company-logo">
          {{ job.initials || 'CO' }}
        </div>
        <div class="header-content">
          <div class="title-row">
            <h1 class="job-title">{{ job.title }}</h1>
            <button class="btn-apply" (click)="applyForJob()">
              Apply Now <i class="ph-bold ph-paper-plane-right"></i>
            </button>
          </div>
          <div class="company-info">
            <span class="company-name"><i class="ph ph-buildings"></i> {{ job.company }}</span>
            <span class="location"><i class="ph ph-map-pin"></i> {{ job.location }}</span>
            <span class="posted-date"><i class="ph ph-calendar-blank"></i> Posted {{ formatDate(job.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Facts Section -->
      <div class="quick-facts">
        <div class="fact-card">
          <i class="ph ph-briefcase"></i>
          <div class="fact-content">
            <span class="fact-label">Employment Type</span>
            <span class="fact-value">{{ job.employmentType }}</span>
          </div>
        </div>
        <div class="fact-card">
          <i class="ph ph-currency-circle-dollar"></i>
          <div class="fact-content">
            <span class="fact-label">Salary Range (RM)</span>
            <span class="fact-value">{{ job.minSalary }} - {{ job.maxSalary }}</span>
          </div>
        </div>
        <div class="fact-card">
          <i class="ph ph-hourglass"></i>
          <div class="fact-content">
            <span class="fact-label">Application Deadline</span>
            <span class="fact-value">{{ job.deadline }}</span>
          </div>
        </div>
        <div class="fact-card">
          <i class="ph ph-users"></i>
          <div class="fact-content">
            <span class="fact-label">Vacancies</span>
            <span class="fact-value">{{ job.vacancies }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="main-content" *ngFor="let req of job.roleRequirements">
        
        <div class="content-section card">
          <h2><i class="ph-fill ph-file-text text-primary"></i> Job Description</h2>
          <p class="description-text">{{ req.jobDescription }}</p>
        </div>

        <div class="content-section card">
          <h2><i class="ph-fill ph-star text-primary"></i> Role Requirements</h2>
          <div class="requirement-list">
            <div class="req-item">
              <span class="req-label">Seniority Level:</span>
              <span class="req-value badge">{{ req.seniorityLevel }}</span>
            </div>
            <div class="req-item">
              <span class="req-label">Experience Required:</span>
              <span class="req-value badge">{{ req.requiredExperienceYears }} Years</span>
            </div>
          </div>
        </div>

        <div class="content-section card">
          <h2><i class="ph-fill ph-lightning text-primary"></i> Required Skills</h2>
          <div class="skills-container">
            <span class="skill-tag" *ngFor="let skill of req.skills">
              {{ skill.skillText }}
            </span>
          </div>
        </div>
      </div>

    </div>

    <ng-template #loading>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading job details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .job-detail-container {
      max-width: 900px;
      margin: 0 auto;
      padding-bottom: 60px;
    }

    .card {
      background: var(--color-surface);
      border-radius: 20px;
      border: 1px solid var(--color-border);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    /* Back Button */
    .btn-back {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      font-weight: 600;
      font-size: 0.9375rem;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      margin-bottom: 24px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: var(--color-hover);
      color: var(--color-text);
      transform: translateX(-4px);
    }

    /* Header Section */
    .header-card {
      padding: 32px;
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }

    .header-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, var(--color-primary), #047857);
    }

    .company-logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
      color: white;
      font-size: 2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
      flex-shrink: 0;
      box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.4);
    }

    .header-content {
      flex: 1;
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 16px;
    }

    .job-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-text);
      line-height: 1.2;
    }

    .btn-apply {
      background: var(--color-primary);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .btn-apply:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.4);
      background: #059669;
    }

    .company-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      color: var(--color-text-secondary);
      font-size: 0.9375rem;
      font-weight: 500;
    }

    .company-info span {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Quick Facts */
    .quick-facts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .fact-card {
      background: var(--color-surface);
      padding: 20px;
      border-radius: 16px;
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s;
    }

    .fact-card:hover {
      transform: translateY(-2px);
    }

    .fact-card i {
      font-size: 1.75rem;
      color: var(--color-primary);
      background: rgba(16, 185, 129, 0.1);
      padding: 12px;
      border-radius: 12px;
    }

    .fact-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .fact-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-tertiary);
      font-weight: 700;
    }

    .fact-value {
      font-weight: 600;
      color: var(--color-text);
      font-size: 0.9375rem;
    }

    /* Main Content */
    .main-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .content-section {
      padding: 32px;
    }

    .content-section h2 {
      margin: 0 0 20px 0;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--color-text);
    }

    .text-primary {
      color: var(--color-primary);
    }

    .description-text {
      color: var(--color-text-secondary);
      line-height: 1.8;
      font-size: 1rem;
      white-space: pre-line;
      margin: 0;
    }

    .requirement-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .req-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--color-background);
      border-radius: 12px;
    }

    .req-label {
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .badge {
      background: rgba(16, 185, 129, 0.1);
      color: var(--color-primary);
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .skill-tag {
      background: var(--color-background);
      color: var(--color-text);
      border: 1px solid var(--color-border);
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.9375rem;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .skill-tag:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      transform: translateY(-2px);
    }

    .bottom-action {
      margin-top: 40px;
      text-align: center;
    }

    .btn-apply-large {
      background: var(--color-primary);
      color: white;
      border: none;
      padding: 16px 48px;
      border-radius: 16px;
      font-weight: 700;
      font-size: 1.125rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.4);
    }

    .btn-apply-large:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -8px rgba(16, 185, 129, 0.6);
      background: #059669;
    }

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

    @media (max-width: 768px) {
      .header-card {
        flex-direction: column;
      }
      .title-row {
        flex-direction: column;
        align-items: flex-start;
      }
      .btn-apply {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private location: Location
  ) {}

  ngOnInit() {
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

  applyForJob() {
    // In the future, this will link to the application submission flow
    alert('Application started! This feature will be implemented in the next phase.');
  }
}
