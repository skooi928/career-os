import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FairPayService, FairPayResult, FairPayHistoryEntry } from '../../services/fair-pay.service';

@Component({
  selector: 'app-fair-pay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fair-pay-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-icon"><i class="ph ph-currency-circle-dollar"></i></div>
        <div>
          <h1>Fair Pay</h1>
          <p class="subtitle">AI-powered salary benchmarking based on real market data</p>
        </div>
      </div>

      <!-- Search Form -->
      <div class="search-card card">
        <h2 class="section-title"><i class="ph ph-magnifying-glass"></i> Analyse Salary</h2>
        <div class="search-grid">
          <div class="input-group">
            <label>Job Title <span class="required">*</span></label>
            <input
              type="text"
              [(ngModel)]="jobTitle"
              placeholder="e.g. Software Engineer, Data Analyst"
              class="input-field"
              (keydown.enter)="runAnalysis()"
            />
          </div>
          <div class="input-group">
            <label>Location</label>
            <input
              type="text"
              [(ngModel)]="location"
              placeholder="e.g. Kuala Lumpur, Remote"
              class="input-field"
            />
          </div>
          <div class="input-group">
            <label>Employment Type</label>
            <select [(ngModel)]="employmentType" class="input-field">
              <option value="">Any</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div class="input-group btn-group">
            <button class="btn-analyze" (click)="runAnalysis()" [disabled]="loading() || !jobTitle.trim()">
              @if (loading()) {
                <i class="ph ph-spinner"></i> Analysing...
              } @else {
                <i class="ph ph-sparkle"></i> Analyse Salary
              }
            </button>
          </div>
        </div>
        @if (error()) {
          <div class="error-banner">
            <i class="ph ph-warning-circle"></i> {{ error() }}
          </div>
        }
      </div>

      @if (result()) {
        <!-- AI Badge -->
        <div class="ai-badge" [class.offline]="!result()!.ai_available">
          <i class="ph" [class.ph-robot]="result()!.ai_available" [class.ph-database]="!result()!.ai_available"></i>
          {{ result()!.ai_available ? 'AI-powered analysis' : 'Market data estimate (AI offline)' }}
        </div>

        <!-- Salary Range Cards -->
        <div class="salary-grid">
          <div class="salary-card min">
            <span class="salary-label">Minimum</span>
            <span class="salary-amount">{{ result()!.currency }} {{ result()!.min_salary | number }}</span>
            <span class="salary-unit">/month</span>
          </div>
          <div class="salary-card avg">
            <span class="salary-label">Average</span>
            <span class="salary-amount">{{ result()!.currency }} {{ result()!.avg_salary | number }}</span>
            <span class="salary-unit">/month</span>
            <span class="avg-badge">Market Median</span>
          </div>
          <div class="salary-card max">
            <span class="salary-label">Maximum</span>
            <span class="salary-amount">{{ result()!.currency }} {{ result()!.max_salary | number }}</span>
            <span class="salary-unit">/month</span>
          </div>
        </div>

        <!-- Metrics Row -->
        <div class="metrics-row">
          <!-- Competitiveness Score -->
          <div class="metric-card card">
            <h3><i class="ph ph-gauge"></i> Market Competitiveness</h3>
            <div class="score-display">
              <div class="score-circle" [class]="scoreClass()">
                <span class="score-number">{{ result()!.market_competitiveness_score }}</span>
                <span class="score-max">/100</span>
              </div>
              <p class="score-label">{{ scoreLabel() }}</p>
            </div>
            <div class="score-bar">
              <div class="score-fill" [style.width.%]="result()!.market_competitiveness_score" [class]="scoreClass()"></div>
            </div>
          </div>

          <!-- Percentile -->
          <div class="metric-card card">
            <h3><i class="ph ph-users-three"></i> Your Market Position</h3>
            <div class="score-display">
              <div class="score-circle percentile">
                <span class="score-number">{{ result()!.percentile }}</span>
                <span class="score-max">th</span>
              </div>
              <p class="score-label">Percentile vs similar professionals</p>
            </div>
            <div class="score-bar">
              <div class="score-fill percentile" [style.width.%]="result()!.percentile"></div>
            </div>
          </div>

          <!-- Benefits Value -->
          <div class="metric-card card">
            <h3><i class="ph ph-gift"></i> Benefits Value</h3>
            <div class="benefit-value">
              <span class="benefit-amount">{{ result()!.currency }} {{ result()!.benefits_value_estimate | number }}</span>
              <span class="benefit-unit">/month estimated</span>
            </div>
            <div class="compensation-breakdown">
              <div class="breakdown-row">
                <span>Base Salary</span>
                <span>{{ result()!.currency }} {{ result()!.compensation_breakdown.base | number }}</span>
              </div>
              <div class="breakdown-row">
                <span>Benefits</span>
                <span>{{ result()!.currency }} {{ result()!.compensation_breakdown.benefits | number }}</span>
              </div>
              <div class="breakdown-row total">
                <span>Total Package</span>
                <span>{{ result()!.currency }} {{ result()!.compensation_breakdown.total_package | number }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Explanation -->
        <div class="card explanation-card">
          <h3><i class="ph ph-lightbulb"></i> Why This Range?</h3>
          <p>{{ result()!.salary_explanation }}</p>
        </div>

        <!-- Comparison Summary -->
        <div class="card comparison-card">
          <h3><i class="ph ph-arrows-left-right"></i> Profile vs Market</h3>
          <p>{{ result()!.comparison_summary }}</p>
        </div>

        <!-- Skills & Certs to Increase Salary -->
        <div class="boost-grid">
          <!-- Skills -->
          <div class="card boost-card">
            <h3><i class="ph ph-trend-up"></i> Skills That Boost Salary</h3>
            @if (result()!.skills_to_increase_salary.length === 0) {
              <p class="empty-msg">No skill recommendations available.</p>
            } @else {
              <div class="skill-list">
                @for (skill of result()!.skills_to_increase_salary; track skill.skill) {
                  <div class="skill-row">
                    <div class="skill-info">
                      <span class="skill-name">{{ skill.skill }}</span>
                      <span class="skill-impact">{{ skill.impact }}</span>
                    </div>
                    <span class="impact-badge">+</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Certifications -->
          <div class="card boost-card">
            <h3><i class="ph ph-certificate"></i> Certifications to Pursue</h3>
            @if (result()!.certifications_to_increase_salary.length === 0) {
              <p class="empty-msg">No certification recommendations available.</p>
            } @else {
              <div class="cert-list">
                @for (cert of result()!.certifications_to_increase_salary; track cert) {
                  <div class="cert-row">
                    <i class="ph ph-seal-check"></i>
                    <span>{{ cert }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- History -->
      @if (history().length > 0) {
        <div class="card history-card">
          <h3><i class="ph ph-clock-counter-clockwise"></i> Recent Analyses</h3>
          <div class="history-list">
            @for (entry of history(); track entry.id) {
              <div class="history-row" (click)="loadHistoryEntry(entry)">
                <div class="history-info">
                  <span class="history-title">{{ entry.jobTitle }}</span>
                  <span class="history-meta">{{ entry.location || 'Any location' }} · {{ entry.employmentType || 'Any type' }}</span>
                </div>
                <div class="history-salary">
                  <span>{{ entry.result.currency }} {{ entry.result.avg_salary | number }}/mo</span>
                  <span class="history-date">{{ entry.createdAt | date:'dd MMM yyyy' }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .fair-pay-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: var(--accent, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      color: #fff;
      flex-shrink: 0;
    }
    .page-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0; color: var(--text); }
    .subtitle { margin: 0.25rem 0 0; color: var(--text-secondary, #64748b); font-size: 0.9rem; }

    .card {
      background: var(--card-bg, #fff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 16px;
      padding: 1.5rem;
    }

    /* Search */
    .search-card { }
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 1rem;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .search-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr auto;
      gap: 1rem;
      align-items: end;
    }
    @media (max-width: 768px) {
      .search-grid { grid-template-columns: 1fr; }
    }
    .input-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .input-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary, #64748b); text-transform: uppercase; letter-spacing: 0.04em; }
    .required { color: #ef4444; }
    .input-field {
      padding: 0.6rem 0.9rem;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 10px;
      background: var(--input-bg, #f8fafc);
      color: var(--text);
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .input-field:focus { border-color: var(--accent, #6366f1); }
    .btn-group { justify-content: flex-end; }
    .btn-analyze {
      padding: 0.65rem 1.5rem;
      background: var(--accent, #6366f1);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
    .btn-analyze:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-banner {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      color: #ef4444;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* AI badge */
    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.9rem;
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #ede9fe;
      color: #7c3aed;
      align-self: flex-start;
    }
    .ai-badge.offline {
      background: #f1f5f9;
      color: #64748b;
    }

    /* Salary Grid */
    .salary-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 640px) { .salary-grid { grid-template-columns: 1fr; } }
    .salary-card {
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      border: 1px solid var(--border, #e2e8f0);
    }
    .salary-card.min { background: #f0fdf4; border-color: #86efac; }
    .salary-card.avg { background: #eff6ff; border-color: #93c5fd; transform: scale(1.03); box-shadow: 0 4px 20px rgba(99,102,241,0.12); }
    .salary-card.max { background: #faf5ff; border-color: #c4b5fd; }
    .salary-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 0.5rem; }
    .salary-amount { font-size: 1.5rem; font-weight: 800; color: #0f172a; line-height: 1; }
    .salary-unit { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
    .avg-badge {
      margin-top: 0.75rem;
      background: #2563eb;
      color: #fff;
      border-radius: 99px;
      padding: 0.2rem 0.7rem;
      font-size: 0.7rem;
      font-weight: 700;
    }

    /* Metrics Row */
    .metrics-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 768px) { .metrics-row { grid-template-columns: 1fr; } }
    .metric-card h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .score-display { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
    .score-circle {
      width: 72px; height: 72px;
      border-radius: 50%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-weight: 800;
      flex-shrink: 0;
      border: 3px solid;
      line-height: 1;
    }
    .score-circle.high { border-color: #22c55e; color: #16a34a; }
    .score-circle.medium { border-color: #f59e0b; color: #d97706; }
    .score-circle.low { border-color: #ef4444; color: #dc2626; }
    .score-circle.percentile { border-color: #6366f1; color: #4f46e5; }
    .score-number { font-size: 1.4rem; font-weight: 800; line-height: 1; }
    .score-max { font-size: 0.6rem; font-weight: 500; opacity: 0.75; line-height: 1.4; }
    .score-label { font-size: 0.8rem; color: var(--text-secondary, #64748b); }
    .score-bar { height: 6px; background: var(--border, #e2e8f0); border-radius: 3px; overflow: hidden; }
    .score-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
    .score-fill.high { background: #22c55e; }
    .score-fill.medium { background: #f59e0b; }
    .score-fill.low { background: #ef4444; }
    .score-fill.percentile { background: #6366f1; }

    .benefit-value { display: flex; align-items: baseline; gap: 0.4rem; margin-bottom: 1rem; }
    .benefit-amount { font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .benefit-unit { font-size: 0.75rem; color: #64748b; }
    .compensation-breakdown { display: flex; flex-direction: column; gap: 0.4rem; }
    .breakdown-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary, #64748b); }
    .breakdown-row.total { font-weight: 700; color: var(--text); border-top: 1px solid var(--border, #e2e8f0); padding-top: 0.4rem; margin-top: 0.2rem; }

    /* Explanation & Comparison */
    .explanation-card h3, .comparison-card h3 {
      font-size: 0.95rem; font-weight: 600; color: var(--text);
      margin: 0 0 0.75rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .explanation-card p, .comparison-card p {
      font-size: 0.9rem; color: var(--text-secondary, #475569); line-height: 1.6; margin: 0;
    }

    /* Boost Grid */
    .boost-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 640px) { .boost-grid { grid-template-columns: 1fr; } }
    .boost-card h3 {
      font-size: 0.9rem; font-weight: 600; color: var(--text);
      margin: 0 0 1rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .skill-list, .cert-list { display: flex; flex-direction: column; gap: 0.6rem; }
    .skill-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.6rem 0.75rem;
      background: var(--bg-subtle, #f8fafc);
      border-radius: 10px;
      border: 1px solid var(--border, #e2e8f0);
    }
    .skill-info { display: flex; flex-direction: column; gap: 0.1rem; }
    .skill-name { font-size: 0.875rem; font-weight: 600; color: var(--text); }
    .skill-impact { font-size: 0.75rem; color: #22c55e; font-weight: 500; }
    .impact-badge {
      width: 24px; height: 24px;
      background: #dcfce7; color: #16a34a;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem;
      flex-shrink: 0;
    }
    .cert-row {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.6rem 0.75rem;
      background: var(--bg-subtle, #f8fafc);
      border-radius: 10px;
      border: 1px solid var(--border, #e2e8f0);
      font-size: 0.875rem;
      color: var(--text);
    }
    .cert-row i { color: #6366f1; font-size: 1.1rem; }
    .empty-msg { font-size: 0.85rem; color: #94a3b8; }

    /* History */
    .history-card h3 {
      font-size: 0.95rem; font-weight: 600; color: var(--text);
      margin: 0 0 1rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .history-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .history-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1px solid var(--border, #e2e8f0);
      cursor: pointer;
      transition: background 0.15s;
    }
    .history-row:hover { background: var(--bg-subtle, #f8fafc); }
    .history-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .history-title { font-size: 0.9rem; font-weight: 600; color: var(--text); }
    .history-meta { font-size: 0.75rem; color: #94a3b8; }
    .history-salary { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; }
    .history-salary span { font-size: 0.875rem; font-weight: 600; color: var(--text); }
    .history-date { font-size: 0.75rem; color: #94a3b8; font-weight: 400; }

    /* Dark mode */
    :host-context([data-theme='dark']) .card {
      background: #1e293b;
      border-color: #334155;
    }
    :host-context([data-theme='dark']) .input-field {
      background: #0f172a;
      border-color: #334155;
      color: #f1f5f9;
    }
    :host-context([data-theme='dark']) .salary-card.min { background: #052e16; border-color: #166534; }
    :host-context([data-theme='dark']) .salary-card.avg { background: #0c1a3a; border-color: #1e40af; }
    :host-context([data-theme='dark']) .salary-card.max { background: #1e1b4b; border-color: #4338ca; }
    :host-context([data-theme='dark']) .salary-amount { color: #f1f5f9; }
    :host-context([data-theme='dark']) .skill-row,
    :host-context([data-theme='dark']) .cert-row {
      background: #0f172a;
      border-color: #334155;
    }
    :host-context([data-theme='dark']) .history-row { border-color: #334155; }
    :host-context([data-theme='dark']) .history-row:hover { background: #0f172a; }
    :host-context([data-theme='dark']) .error-banner { background: #450a0a; border-color: #7f1d1d; color: #fca5a5; }
    :host-context([data-theme='dark']) .ai-badge { background: #2e1065; color: #c4b5fd; }
    :host-context([data-theme='dark']) .ai-badge.offline { background: #1e293b; color: #94a3b8; }
  `]
})
export class FairPayComponent implements OnInit {
  private readonly fairPayService = inject(FairPayService);

  jobTitle = '';
  location = '';
  employmentType = '';

  loading = signal(false);
  error = signal<string | null>(null);
  result = signal<FairPayResult | null>(null);
  history = signal<FairPayHistoryEntry[]>([]);

  scoreClass = computed(() => {
    const score = this.result()?.market_competitiveness_score ?? 0;
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  });

  scoreLabel = computed(() => {
    const score = this.result()?.market_competitiveness_score ?? 0;
    if (score >= 80) return 'Highly competitive market';
    if (score >= 60) return 'Above average demand';
    if (score >= 40) return 'Moderate market demand';
    return 'Below average demand';
  });

  ngOnInit(): void {
    this.fairPayService.getHistory().subscribe({
      next: (h) => this.history.set(h),
      error: () => {}
    });
  }

  runAnalysis(): void {
    if (!this.jobTitle.trim()) return;
    this.loading.set(true);
    this.error.set(null);
    this.fairPayService.analyze(this.jobTitle.trim(), this.location.trim(), this.employmentType).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
        // Refresh history
        this.fairPayService.getHistory().subscribe({ next: (h) => this.history.set(h), error: () => {} });
      },
      error: (err) => {
        this.error.set('Analysis failed. Please try again or check that all services are running.');
        this.loading.set(false);
      }
    });
  }

  loadHistoryEntry(entry: FairPayHistoryEntry): void {
    this.jobTitle = entry.jobTitle;
    this.location = entry.location || '';
    this.employmentType = entry.employmentType || '';
    this.result.set(entry.result);
  }
}
