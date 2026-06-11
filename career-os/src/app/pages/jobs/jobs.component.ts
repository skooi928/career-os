import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService, Job } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { ApplicationService } from '../../services/application.service';
import { combineLatest, Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, startWith, tap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="jobs-page-wrapper">
      <div class="page-header">
        <div class="header-content">
          <h1>Find Your Dream Job</h1>
          <p>Discover thousands of opportunities that match your skills.</p>
        </div>
        <div class="search-container" *ngIf="activeTab === 'explore'">
          <div class="search-bar">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearchInput()" (keyup.enter)="onSearch()" placeholder="Search jobs, companies, skills...">
            <button class="btn-primary" (click)="onSearch()">Search</button>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="jobs-layout-tabs">
        <button class="tab-btn" [class.active]="activeTab === 'explore'" (click)="setTab('explore')">
          <i class="ph ph-magnifying-glass"></i> Explore Jobs
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'applied'" (click)="setTab('applied')">
          <i class="ph ph-paper-plane-tilt"></i> Applied History
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'saved'" (click)="setTab('saved')">
          <i class="ph ph-bookmark"></i> Saved Jobs
        </button>
      </div>

      <!-- EXPLORE TAB -->
      <div class="jobs-layout" *ngIf="activeTab === 'explore'">
        <div class="filters-column">
          <div class="card p-4 filter-card">
            <h3>Filters</h3>
            
            <div *ngIf="searchQuery" class="mt-4 filter-section">
              <span class="active-filter-badge">
                Keyword: {{ searchQuery }}
                <i class="ph ph-x cursor-pointer" (click)="clearSearch()"></i>
              </span>
            </div>

            <div class="filter-section mt-4">
              <h4>Employment Type</h4>
              <div class="filter-options">
                <label class="filter-checkbox" *ngFor="let type of availableEmploymentTypes">
                  <input type="checkbox" [checked]="selectedEmploymentTypes.has(type)" (change)="toggleEmploymentType(type)">
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-label">{{ type }}</span>
                </label>
              </div>
            </div>

            <div class="filter-section mt-4" *ngIf="availableLocations.length > 0">
              <h4>Location</h4>
              <div class="filter-options">
                <label class="filter-checkbox" *ngFor="let loc of availableLocations">
                  <input type="checkbox" [checked]="selectedLocations.has(loc)" (change)="toggleLocation(loc)">
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-label">{{ loc }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="main-column">
          <div class="results-header">
            <h3>Showing results {{ searchQuery ? 'for "' + searchQuery + '"' : '' }}</h3>
            <span class="results-count">{{ (filteredJobs$ | async)?.length || 0 }} jobs found</span>
          </div>

          <div *ngIf="loadingJobs" class="loading-state-jobs">
            <div class="spinner"></div>
            <p>Finding the best jobs for you...</p>
          </div>

          <ng-container *ngIf="!loadingJobs">
            <div class="empty-state" *ngIf="(filteredJobs$ | async)?.length === 0">
              <i class="ph ph-magnifying-glass empty-icon"></i>
              <h4>No jobs found</h4>
              <p>We couldn't find any jobs matching your search criteria.</p>
              <button class="btn-secondary mt-4" (click)="clearSearch()">Clear Search</button>
            </div>

            <div class="jobs-grid" *ngIf="filteredJobs$ | async as jobs">
              <div class="job-card" *ngFor="let job of jobs" (click)="viewJob(job.id)">
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
                    <button class="btn-bookmark" (click)="toggleBookmark($event, job)">
                      <i [class]="job.isSaved ? 'ph-fill ph-bookmark active-icon' : 'ph ph-bookmark inactive-icon'"></i>
                    </button>
                  </div>
                </div>
                
                <div class="job-meta">
                  <span class="meta-item"><i class="ph ph-map-pin"></i> {{ job.location }}</span>
                  <span class="meta-item"><i class="ph ph-clock"></i> {{ job.employmentType }}</span>
                  <span class="meta-item"><i class="ph ph-users"></i> {{ job.applicantsCount || 0 }} {{ job.applicantsCount === 1 ? 'applicant' : 'applicants' }}</span>
                </div>
                
                <div class="job-description">
                  {{ truncate(job.roleRequirements[0]?.jobDescription, 120) }}
                </div>

                <div class="tags-row" *ngIf="job.roleRequirements?.length && job.roleRequirements[0].technicalSkills">
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
        </div>
      </div>

      <!-- APPLIED HISTORY TAB -->
      <div class="history-layout" *ngIf="activeTab === 'applied'">
        <div *ngIf="loadingJobs" class="loading-state-jobs">
          <div class="spinner"></div>
          <p>Loading your applied jobs...</p>
        </div>

        <ng-container *ngIf="!loadingJobs">
          <div class="empty-state" *ngIf="appliedHistory.length === 0">
            <i class="ph ph-paper-plane-tilt empty-icon"></i>
            <h4>No applications yet</h4>
            <p>You haven't applied to any jobs yet. Start exploring opportunities!</p>
            <button class="btn-primary mt-4" (click)="setTab('explore')">Explore Jobs</button>
          </div>

          <div class="jobs-grid" *ngIf="appliedHistory.length > 0">
            <div class="job-card" *ngFor="let item of appliedHistory" (click)="viewJob(item.job.id)">
              <div class="job-card-header">
                <div class="logo-group">
                  <div class="company-logo bg-primary">{{ item.job.initials }}</div>
                  <div class="company-title-wrap">
                    <p class="company-name">{{ item.job.company }}</p>
                    <h4 class="job-title">{{ item.job.title }}</h4>
                  </div>
                </div>
                <div class="header-actions">
                  <span class="status-badge" [ngClass]="getStatusBadgeClass(item.application.status)">
                    {{ getStatusLabel(item.application.status) }}
                  </span>
                </div>
              </div>
              
              <div class="job-meta">
                <span class="meta-item"><i class="ph ph-map-pin"></i> {{ item.job.location }}</span>
                <span class="meta-item"><i class="ph ph-clock"></i> {{ item.job.employmentType }}</span>
                <span class="meta-item"><i class="ph ph-users"></i> {{ item.job.applicantsCount || 0 }} {{ item.job.applicantsCount === 1 ? 'applicant' : 'applicants' }}</span>
                <span class="meta-item"><i class="ph ph-calendar"></i> Applied {{ formatDate(item.application.appliedAt) }}</span>
              </div>
              
              <div class="job-card-footer">
                <span class="salary-range">RM{{ formatNumber(item.job.minSalary) }} - RM{{ formatNumber(item.job.maxSalary) }}</span>
                <button class="btn-apply-now" (click)="$event.stopPropagation(); viewJob(item.job.id)">View Details</button>
              </div>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- SAVED JOBS TAB -->
      <div class="saved-layout" *ngIf="activeTab === 'saved'">
        <div *ngIf="loadingJobs" class="loading-state-jobs">
          <div class="spinner"></div>
          <p>Loading your saved jobs...</p>
        </div>

        <ng-container *ngIf="!loadingJobs">
          <div class="empty-state" *ngIf="(savedJobs$ | async)?.length === 0">
            <i class="ph ph-bookmark empty-icon"></i>
            <h4>No saved jobs</h4>
            <p>You haven't saved any jobs yet. Bookmark jobs to view them later.</p>
            <button class="btn-primary mt-4" (click)="setTab('explore')">Explore Jobs</button>
          </div>

          <div class="jobs-grid" *ngIf="savedJobs$ | async as savedList">
            <div class="job-card" *ngFor="let job of savedList" (click)="viewJob(job.id)">
              <div class="job-card-header">
                <div class="logo-group">
                  <div class="company-logo bg-primary">{{ job.initials }}</div>
                  <div class="company-title-wrap">
                    <p class="company-name">{{ job.company }}</p>
                    <h4 class="job-title">{{ job.title }}</h4>
                  </div>
                </div>
                <div class="header-actions">
                  <button class="btn-bookmark" (click)="toggleBookmark($event, job)">
                    <i class="ph-fill ph-bookmark active-icon"></i>
                  </button>
                </div>
              </div>
              
              <div class="job-meta">
                <span class="meta-item"><i class="ph ph-map-pin"></i> {{ job.location }}</span>
                <span class="meta-item"><i class="ph ph-clock"></i> {{ job.employmentType }}</span>
                <span class="meta-item"><i class="ph ph-users"></i> {{ job.applicantsCount || 0 }} {{ job.applicantsCount === 1 ? 'applicant' : 'applicants' }}</span>
              </div>
              
              <div class="job-card-footer">
                <span class="salary-range">RM{{ formatNumber(job.minSalary) }} - RM{{ formatNumber(job.maxSalary) }}</span>
                <button class="btn-apply-now" (click)="$event.stopPropagation(); viewJob(job.id)">View Details</button>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .jobs-page-wrapper {
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding-bottom: 32px;
    }

    .page-header {
      background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
      border-radius: 24px;
      padding: 30px;
      color: white;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      text-align: center;
    }

    .header-content h1 {
      margin: 0;
      font-size: 2.25rem;
      font-weight: 800;
    }

    .header-content p {
      margin: 8px 0 0 0;
      font-size: 1.0625rem;
      opacity: 0.9;
    }

    .search-container {
      width: 100%;
      max-width: 600px;
    }

    .search-bar {
      display: flex;
      background: white;
      padding: 8px;
      border-radius: 16px;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .search-bar i.ph-magnifying-glass {
      color: #64748b;
      font-size: 1.25rem;
      margin-left: 12px;
    }

    .search-bar input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1rem;
      color: #0f172a;
      background: transparent;
    }

    .search-bar .btn-primary {
      padding: 12px 24px;
      border-radius: 12px;
    }

    .jobs-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 32px;
      align-items: start;
    }

    @media (max-width: 992px) {
      .jobs-layout {
        grid-template-columns: 1fr;
      }
    }

    .filters-column {
      position: sticky;
      top: 0px;
      z-index: 10;
    }

    .filters-column .card {
      background: var(--color-surface);
      border-radius: 16px;
      border: 1px solid var(--color-border);
      padding: 24px;
    }

    .filters-column h3 {
      margin: 0;
      font-size: 1.125rem;
      color: var(--color-text);
    }

    .mt-2 { margin-top: 8px; }
    .mt-4 { margin-top: 16px; }
    .text-sm { font-size: 0.875rem; }
    .text-secondary { color: var(--color-text-secondary); }

    .active-filter-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--color-primary);
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .cursor-pointer { cursor: pointer; }

    .filter-section h4 {
      margin: 0 0 12px 0;
      font-size: 1rem;
      color: var(--color-text);
      font-weight: 600;
    }

    .filter-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .filter-checkbox input {
      display: none;
    }

    .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-border);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .filter-checkbox input:checked + .checkbox-custom {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    .filter-checkbox input:checked + .checkbox-custom::after {
      content: '\\2714';
      color: white;
      font-size: 12px;
    }

    .checkbox-label {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
    }

    .filter-checkbox:hover .checkbox-label {
      color: var(--color-text);
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .results-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--color-text);
    }

    .results-count {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .job-card {
      background: var(--color-surface);
      border-radius: 16px;
      border: 1px solid var(--color-border);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .job-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border-color: rgba(5, 150, 105, 0.3);
      transform: translateY(-2px);
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
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .bg-primary { background: #059669; }

    .company-title-wrap {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .company-name {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .job-title {
      margin: 4px 0 0 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .new-badge {
      background: #d1fae5;
      color: #059669;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 9999px;
    }

    .job-meta {
      display: flex;
      gap: 16px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .job-description {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .tags-row {
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;
      overflow: hidden;
    }
    .skill-tag {
      font-size: 11px;
      font-weight: 600;
      background: var(--color-surface-secondary);
      color: var(--color-text-secondary);
      padding: 4px 10px;
      border-radius: 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .job-card-footer {
      border-top: 1px solid var(--color-border);
      padding-top: 20px;
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .salary-range {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-text);
    }

    .btn-apply-now {
      background: #ecfdf5;
      color: #059669;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-apply-now:hover { background: #d1fae5; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      text-align: center;
      background: var(--color-surface);
      border-radius: 16px;
      border: 1px solid var(--color-border);
    }

    .empty-icon {
      font-size: 48px;
      color: var(--color-border);
      margin-bottom: 16px;
    }

    .empty-state h4 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--color-text);
    }

    .empty-state p {
      margin: 8px 0 0 0;
      color: var(--color-text-secondary);
    }

    /* Tabs styling */
    .jobs-layout-tabs {
      display: flex;
      gap: 12px;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 8px;
    }
    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: none;
      border: none;
      border-radius: 8px;
      color: var(--color-text-secondary);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
    .tab-btn:hover {
      background-color: var(--color-surface-secondary);
      color: var(--color-text);
    }
    .tab-btn.active {
      background-color: #ECFDF5;
      color: #059669;
    }

    /* Bookmark button styling */
    .btn-bookmark {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .btn-bookmark:hover {
      transform: scale(1.1);
    }
    .active-icon {
      color: #059669;
    }
    .inactive-icon {
      color: #94a3b8;
    }

    /* Status badges styling */
    .status-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      width: fit-content;
      display: inline-block;
    }
    .badge-success { background-color: #d1fae5; color: #059669; }
    .badge-pending-interview { background-color: #fef3c7; color: #d97706; }
    .badge-pending-review { background-color: #dbeafe; color: #2563eb; }
    .badge-rejected { background-color: #ffe4e6; color: #e11d48; }

    /* Loading State */
    .loading-state-jobs {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      color: var(--color-text-secondary);
      background: var(--color-surface);
      border-radius: 16px;
      border: 1px solid var(--color-border);
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
  `]
})
export class JobsComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  filteredJobs$!: Observable<Job[]>;
  private searchSubject = new BehaviorSubject<string>('');
  private urlUpdateTimeout: any;
  loadingJobs = true;
  private destroy$ = new Subject<void>();

  availableLocations: string[] = [];
  availableEmploymentTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance'];

  selectedEmploymentTypes: Set<string> = new Set();
  selectedLocations: Set<string> = new Set();

  filterChange$ = new BehaviorSubject<void>(undefined);

  appliedHistory: any[] = [];
  activeTab: string = 'explore';
  savedJobs$!: Observable<Job[]>;

  constructor(
    public jobService: JobService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private applicationService: ApplicationService
  ) {
    this.savedJobs$ = this.jobService.jobs$.pipe(
      map(jobs => jobs.filter(j => j.isSaved))
    );
  }

  ngOnInit() {
    // Load jobs if not loaded
    this.jobService.loadJobs();
    this.loadAppliedHistory();

    this.jobService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loadingJobs = loading;
      });

    // Listen to query parameters for tab switching and search query
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      } else {
        this.activeTab = 'explore';
      }

      const q = params['q'] || '';
      if (q !== this.searchQuery) {
        this.searchQuery = q;
        this.searchSubject.next(q);
      }
    });

    this.filteredJobs$ = combineLatest([
      this.jobService.jobs$.pipe(
        tap(jobs => {
          const locs = new Set<string>();
          jobs.forEach(j => {
            if (j.location) locs.add(j.location);
          });
          this.availableLocations = Array.from(locs).sort();
        })
      ),
      this.searchSubject.asObservable(),
      this.filterChange$
    ]).pipe(
      map(([jobs, query, _]) => {
        if (this.searchQuery !== query) {
          this.searchQuery = query;
        }
        let filtered = jobs;

        // 1. Search Query
        if (query) {
          const lowercaseQuery = query.toLowerCase();
          filtered = filtered.filter(job => {
            if (
              job.title.toLowerCase().includes(lowercaseQuery) ||
              job.company.toLowerCase().includes(lowercaseQuery) ||
              job.location.toLowerCase().includes(lowercaseQuery)
            ) {
              return true;
            }

            if (job.roleRequirements && job.roleRequirements[0]) {
              if (job.roleRequirements[0].jobDescription.toLowerCase().includes(lowercaseQuery)) {
                return true;
              }
              if (job.roleRequirements[0].technicalSkills) {
                return job.roleRequirements[0].technicalSkills.some(skill =>
                  skill.technicalSkillText.toLowerCase().includes(lowercaseQuery)
                );
              }
            }
            return false;
          });
        }

        // 2. Employment Type Filter
        if (this.selectedEmploymentTypes.size > 0) {
          filtered = filtered.filter(job => this.selectedEmploymentTypes.has(job.employmentType));
        }

        // 3. Location Filter
        if (this.selectedLocations.size > 0) {
          filtered = filtered.filter(job => this.selectedLocations.has(job.location));
        }

        return filtered;
      })
    );
  }

  toggleEmploymentType(type: string) {
    if (this.selectedEmploymentTypes.has(type)) {
      this.selectedEmploymentTypes.delete(type);
    } else {
      this.selectedEmploymentTypes.add(type);
    }
    this.filterChange$.next();
  }

  toggleLocation(loc: string) {
    if (this.selectedLocations.has(loc)) {
      this.selectedLocations.delete(loc);
    } else {
      this.selectedLocations.add(loc);
    }
    this.filterChange$.next();
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);

    if (this.urlUpdateTimeout) {
      clearTimeout(this.urlUpdateTimeout);
    }

    this.urlUpdateTimeout = setTimeout(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: this.searchQuery || null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }, 400);
  }

  onSearch() {
    if (this.urlUpdateTimeout) {
      clearTimeout(this.urlUpdateTimeout);
    }
    this.searchSubject.next(this.searchQuery);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.searchQuery || null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchSubject.next('');
    if (this.urlUpdateTimeout) {
      clearTimeout(this.urlUpdateTimeout);
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
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

  setTab(tabName: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabName },
      queryParamsHandling: 'merge'
    });
  }

  loadAppliedHistory() {
    const candidateId = this.authService.getCurrentUser()?.userId;
    if (!candidateId) return;

    combineLatest([
      this.applicationService.getApplicationsByCandidate(candidateId),
      this.jobService.jobs$
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([applications, jobs]) => {
        const jobMap = new Map(jobs.map(j => [j.id, j]));
        this.appliedHistory = applications.map(app => ({
          application: app,
          job: jobMap.get(app.jobId)!
        })).filter(item => item.job !== undefined);
      },
      error: (err) => console.error('Failed to load applied history', err)
    });
  }

  toggleBookmark(event: Event, job: Job) {
    event.stopPropagation();
    if (job.isSaved) {
      this.jobService.unsaveJob(job.id!).subscribe(() => {
        job.isSaved = false;
        this.jobService.loadJobs();
      });
    } else {
      this.jobService.saveJob(job.id!).subscribe(() => {
        job.isSaved = true;
        this.jobService.loadJobs();
      });
    }
  }

  getStatusBadgeClass(status?: string): string {
    if (!status) return 'badge-pending-review';
    switch (status.toUpperCase()) {
      case 'OFFERED':
      case 'ACCEPTED':
        return 'badge-success';
      case 'INTERVIEWING':
        return 'badge-pending-interview';
      case 'REJECTED':
        return 'badge-rejected';
      default:
        return 'badge-pending-review';
    }
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'Pending Review';
    switch (status.toUpperCase()) {
      case 'OFFERED':
      case 'ACCEPTED':
        return 'Success';
      case 'INTERVIEWING':
        return 'Pending Interview';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Pending Review';
    }
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
