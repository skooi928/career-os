import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '../../../services/survey.service';
import { OrganisationService } from '../../../services/organisation.service';
import {
  EmployeeSurvey, SurveyWithCount, SurveyAnalytics,
  AiInsight, AiInsightReport, CATEGORY_LABELS
} from '../../../types/upskilling.types';

type Tab = 'surveys' | 'analytics' | 'insights';

@Component({
  selector: 'app-org-surveys',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1><i class="ph ph-clipboard-text"></i> Employee Feedback Surveys</h1>
      <p>Create anonymous satisfaction surveys and view aggregated insights — employee identities are never revealed.</p>
    </div>
    <button class="btn-primary" (click)="showCreate = !showCreate" *ngIf="activeTab() === 'surveys'">
      <i class="ph ph-plus"></i> New Survey
    </button>
  </div>

  <!-- No org warning -->
  <div class="empty-state" *ngIf="!orgId && !isLoading()">
    <i class="ph ph-buildings empty-icon"></i>
    <h3>No Organisation Found</h3>
    <p>You need to be an ORG_ADMIN or HR member of a verified organisation to manage surveys.</p>
  </div>

  <ng-container *ngIf="orgId">

    <!-- ── CREATE SURVEY FORM ───────────────────────────────────────────── -->
    <div class="card create-form" *ngIf="showCreate && activeTab() === 'surveys'">
      <h3><i class="ph ph-plus-circle"></i> Create New Survey</h3>
      <p class="form-hint">A standard set of 23 evidence-based questions will be auto-populated across 11 well-being categories.</p>
      <div class="field">
        <label>Survey Title <span class="req">*</span></label>
        <input type="text" [(ngModel)]="form.title" placeholder="e.g. Q2 2026 Employee Satisfaction Survey" maxlength="200">
      </div>
      <div class="field">
        <label>Description</label>
        <textarea [(ngModel)]="form.description" rows="3" placeholder="Optional context for employees…"></textarea>
      </div>
      <div class="form-actions">
        <button class="btn-primary" (click)="create()" [disabled]="!form.title.trim() || isSubmitting()">
          <i class="ph ph-floppy-disk"></i> {{ isSubmitting() ? 'Creating…' : 'Create Survey (Draft)' }}
        </button>
        <button class="btn-ghost" (click)="showCreate = false">Cancel</button>
      </div>
    </div>

    <!-- ── SURVEYS LIST ────────────────────────────────────────────────── -->
    <div *ngIf="activeTab() === 'surveys'">
      <div class="spinner-wrap" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="empty-state" *ngIf="!isLoading() && surveys().length === 0">
        <i class="ph ph-clipboard-text empty-icon"></i>
        <h3>No surveys yet</h3>
        <p>Create your first employee feedback survey to get started.</p>
      </div>

      <div class="survey-list" *ngIf="!isLoading()">
        <div class="survey-card card" *ngFor="let sw of surveys()">
          <div class="survey-card-header">
            <div>
              <h3 class="survey-title">{{ sw.survey.title }}</h3>
              <p class="survey-desc" *ngIf="sw.survey.description">{{ sw.survey.description }}</p>
              <div class="survey-meta">
                <span class="status-pill" [class]="statusClass(sw.survey.status)">{{ sw.survey.status }}</span>
                <span class="meta-item"><i class="ph ph-users"></i> {{ sw.responseCount }} responses</span>
                <span class="meta-item"><i class="ph ph-calendar"></i> Created {{ formatDate(sw.survey.createdAt) }}</span>
              </div>
            </div>
            <div class="survey-actions">
              <button class="btn-sm btn-primary" *ngIf="sw.survey.status === 'DRAFT'"
                      (click)="activate(sw.survey.id)" [disabled]="actionLoading() === sw.survey.id">
                <i class="ph ph-play"></i> Activate
              </button>
              <button class="btn-sm btn-danger" *ngIf="sw.survey.status === 'ACTIVE'"
                      (click)="close(sw.survey.id)" [disabled]="actionLoading() === sw.survey.id">
                <i class="ph ph-stop"></i> Close
              </button>
              <button class="btn-sm btn-ghost" (click)="viewAnalytics(sw.survey)">
                <i class="ph ph-chart-bar"></i> Analytics
              </button>
            </div>
          </div>
          <div class="survey-privacy-note">
            <i class="ph ph-shield-check"></i>
            <span>Employee responses are fully anonymous — individual identities are never stored or linked to answers.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ANALYTICS TAB ──────────────────────────────────────────────── -->
    <div *ngIf="activeTab() === 'analytics' && selectedSurveyId()">
      <div class="analytics-nav">
        <button class="btn-ghost btn-sm" (click)="setTab('surveys')"><i class="ph ph-arrow-left"></i> All Surveys</button>
        <span class="analytics-title"><i class="ph ph-chart-bar"></i> {{ selectedTitle() }}</span>
      </div>
      <div class="spinner-wrap" *ngIf="analyticsLoading()"><div class="spinner"></div></div>
      <div class="empty-state" *ngIf="!analyticsLoading() && analytics() && analytics()!.totalResponses === 0">
        <i class="ph ph-chart-bar empty-icon"></i>
        <h3>No responses yet</h3>
        <p>Activate the survey and wait for employees to submit their anonymous feedback.</p>
      </div>

      <ng-container *ngIf="!analyticsLoading() && analytics() && analytics()!.totalResponses > 0">
        <!-- Score cards -->
        <div class="score-grid">
          <div class="score-card overall">
            <div class="score-label">Overall Score</div>
            <div class="score-value">{{ analytics()!.overallScore }}<span class="score-max">/10</span></div>
            <div class="score-bar"><div class="score-fill" [style.width]="analytics()!.overallScore * 10 + '%'" [class]="scoreBarClass(analytics()!.overallScore)"></div></div>
          </div>
          <div class="score-card">
            <div class="score-label">Total Responses</div>
            <div class="score-value">{{ analytics()!.totalResponses }}</div>
          </div>
          <div class="score-card">
            <div class="score-label">Response Rate</div>
            <div class="score-value">{{ analytics()!.responseRate }}<span class="score-max">%</span></div>
          </div>
        </div>

        <!-- Category breakdown -->
        <div class="card category-breakdown">
          <h3><i class="ph ph-list-numbers"></i> Score by Category</h3>
          <div class="category-rows">
            <div class="category-row" *ngFor="let entry of categoryEntries()">
              <div class="cat-label">{{ getCategoryLabel(entry[0]) }}</div>
              <div class="cat-bar-wrap">
                <div class="cat-bar" [style.width]="entry[1] * 10 + '%'" [class]="scoreBarClass(entry[1])"></div>
              </div>
              <div class="cat-score" [class]="scoreTextClass(entry[1])">{{ entry[1] }}</div>
            </div>
          </div>
        </div>

        <!-- Open text responses (deduped) -->
        <div class="card" *ngIf="uniqueTextResponses().length > 0">
          <h3><i class="ph ph-chat-text"></i> Employee Open Responses <span class="anon-badge">Anonymised</span></h3>
          <p class="anon-note">Individual responses cannot be traced to any employee.</p>
          <div class="text-responses">
            <div class="text-response" *ngFor="let resp of uniqueTextResponses()">
              <i class="ph ph-quotes"></i> {{ resp }}
            </div>
          </div>
        </div>

        <!-- ── AI INSIGHTS SECTION ─────────────────────────────────── -->
        <div class="section-divider">
          <i class="ph ph-brain"></i>
          <span>AI-Generated HR Insights</span>
        </div>

        <!-- Generate CTA (shown when no insights yet) -->
        <div class="card ai-cta" *ngIf="!insightReport() && !insightsLoading()">
          <div class="ai-cta-content">
            <i class="ph ph-brain ai-icon"></i>
            <div>
              <h3>Generate AI Insights</h3>
              <p>Let Gemini AI analyse this survey's aggregated data to produce professional HR insights, retention risk predictions, and actionable recommendations.</p>
            </div>
          </div>
          <button class="btn-primary" (click)="triggerInsights()">
            <i class="ph ph-sparkle"></i> Generate Insights
          </button>
        </div>

        <!-- Insights loading -->
        <div class="spinner-wrap" *ngIf="insightsLoading()"><div class="spinner"></div></div>

        <!-- Insights content -->
        <ng-container *ngIf="!insightsLoading() && insightReport() as report">
          <!-- Sentiment + Retention risk side by side -->
          <div class="insight-grid">
            <div class="insight-banner" [ngClass]="sentimentClass(report.overall_sentiment)">
              <div class="sentiment-header">
                <i class="ph ph-smiley" *ngIf="report.overall_sentiment === 'positive'"></i>
                <i class="ph ph-smiley-meh" *ngIf="report.overall_sentiment === 'moderate'"></i>
                <i class="ph ph-smiley-sad" *ngIf="report.overall_sentiment === 'concerning' || report.overall_sentiment === 'critical'"></i>
                <span class="sentiment-label">{{ report.overall_sentiment | titlecase }} Sentiment</span>
              </div>
              <p class="insight-text">{{ report.satisfaction_analysis }}</p>
            </div>
            <div class="risk-card" [ngClass]="riskClass(report.retention_risk)">
              <div class="risk-header">
                <i class="ph ph-warning-circle"></i>
                <span>Retention Risk: <span class="risk-badge" [ngClass]="riskBadgeClass(report.retention_risk)">{{ report.retention_risk | uppercase }}</span></span>
              </div>
              <p class="insight-text">{{ report.retention_risk_explanation }}</p>
            </div>
          </div>

          <!-- Grid: strengths + concerns -->
          <div class="insight-grid">
            <div class="card insight-col strengths">
              <h3><i class="ph ph-thumbs-up"></i> Top Strengths</h3>
              <ul><li *ngFor="let s of report.top_strengths">{{ s }}</li></ul>
            </div>
            <div class="card insight-col concerns">
              <h3><i class="ph ph-warning"></i> Critical Concerns</h3>
              <ul><li *ngFor="let c of report.critical_concerns">{{ c }}</li></ul>
            </div>
          </div>

          <!-- Assessments 3-col -->
          <div class="insight-grid-3">
            <div class="card">
              <h3><i class="ph ph-fire"></i> Burnout & Disengagement</h3>
              <p>{{ report.burnout_indicators }}</p>
            </div>
            <div class="card">
              <h3><i class="ph ph-users-three"></i> Team Morale</h3>
              <p>{{ report.team_morale }}</p>
            </div>
            <div class="card">
              <h3><i class="ph ph-buildings"></i> Culture Assessment</h3>
              <p>{{ report.culture_assessment }}</p>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="card recommendations">
            <h3><i class="ph ph-lightbulb"></i> AI Recommendations</h3>
            <div class="rec-item" *ngFor="let rec of report.recommendations" [class]="'rec-' + rec.priority">
              <div class="rec-priority"><span class="priority-badge">{{ rec.priority | uppercase }}</span></div>
              <div class="rec-body">
                <strong>{{ rec.action }}</strong>
                <p>{{ rec.rationale }}</p>
              </div>
            </div>
          </div>

          <!-- Action plan -->
          <div class="card action-plan">
            <h3><i class="ph ph-calendar-check"></i> Manager 30/60/90-Day Action Plan</h3>
            <p>{{ report.manager_action_plan }}</p>
            <div class="pulse-suggest" *ngIf="report.pulse_survey_suggested">
              <i class="ph ph-bell-ringing"></i> AI recommends scheduling a follow-up pulse survey soon.
            </div>
          </div>

          <div class="insights-footer">
            <p class="ai-generated-note" *ngIf="insightGeneratedAt()">
              <i class="ph ph-robot"></i> Generated by Gemini AI · {{ insightGeneratedAt() }}
            </p>
            <button class="btn-ghost btn-sm" (click)="triggerInsights()" [disabled]="insightsLoading()">
              <i class="ph ph-arrow-clockwise"></i> Regenerate
            </button>
          </div>
        </ng-container>
      </ng-container>
    </div>
  </ng-container>

  <!-- Toast -->
  <div class="toast" *ngIf="toast()" [class.error]="toast()!.startsWith('Error')">{{ toast() }}</div>
</div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 .25rem; }
    .page-header p { color: var(--text-secondary); margin: 0; font-size: .875rem; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: .5rem; }
    .analytics-nav { display: flex; align-items: center; gap: .75rem; margin-bottom: 1rem; }
    .analytics-title { font-weight: 600; font-size: .95rem; color: var(--text); }
    .create-form { border: 2px dashed var(--primary); }
    .form-hint { color: var(--text-secondary); font-size: .8rem; margin: .25rem 0 1rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: .875rem; font-weight: 500; margin-bottom: .4rem; }
    .field input, .field textarea, .field select { width: 100%; padding: .6rem .8rem; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font-size: .875rem; }
    .form-actions { display: flex; gap: .75rem; margin-top: 1rem; }
    .req { color: #ef4444; }
    .survey-list { display: flex; flex-direction: column; gap: .75rem; }
    .survey-card { }
    .survey-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    .survey-title { font-size: 1rem; font-weight: 600; margin: 0 0 .3rem; }
    .survey-desc { font-size: .8rem; color: var(--text-secondary); margin: 0 0 .5rem; }
    .survey-meta { display: flex; gap: .75rem; flex-wrap: wrap; align-items: center; }
    .meta-item { display: flex; align-items: center; gap: .25rem; font-size: .8rem; color: var(--text-secondary); }
    .survey-actions { display: flex; gap: .5rem; flex-shrink: 0; }
    .status-pill { border-radius: 999px; padding: .2rem .7rem; font-size: .75rem; font-weight: 600; }
    .status-DRAFT { background: #f1f5f9; color: #64748b; }
    .status-ACTIVE { background: #dcfce7; color: #16a34a; }
    .status-CLOSED { background: #f0f9ff; color: #0284c7; }
    .survey-privacy-note { display: flex; align-items: center; gap: .5rem; margin-top: .75rem; padding: .5rem .75rem; background: #f0fdf4; border-radius: 8px; font-size: .78rem; color: #15803d; border: 1px solid #bbf7d0; }
    .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: .5rem; margin-bottom: .5rem; }
    .score-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: .75rem 1rem; text-align: center; }
    .score-card.overall { border-color: var(--primary); }
    .score-label { font-size: .78rem; color: var(--text-secondary); margin-bottom: .4rem; }
    .score-value { font-size: 1.75rem; font-weight: 800; color: var(--primary); }
    .score-max { font-size: 1rem; color: var(--text-secondary); }
    .score-bar { height: 6px; background: var(--border); border-radius: 999px; margin-top: .5rem; overflow: hidden; }
    .score-fill { height: 100%; border-radius: 999px; transition: width .5s; }
    .score-high { background: #22c55e; }
    .score-mid { background: #f59e0b; }
    .score-low { background: #ef4444; }
    .category-breakdown h3 { margin: 0 0 .6rem; font-size: .9rem; }
    .category-rows { display: flex; flex-direction: column; gap: .4rem; }
    .category-row { display: grid; grid-template-columns: 180px 1fr 40px; align-items: center; gap: .75rem; }
    .cat-label { font-size: .82rem; color: var(--text-secondary); }
    .cat-bar-wrap { background: var(--border); border-radius: 999px; height: 8px; overflow: hidden; }
    .cat-bar { height: 100%; border-radius: 999px; transition: width .5s; }
    .cat-score { font-size: .875rem; font-weight: 700; text-align: right; }
    .score-text-high { color: #16a34a; }
    .score-text-mid { color: #d97706; }
    .score-text-low { color: #dc2626; }
    .anon-badge { background: #dcfce7; color: #16a34a; border-radius: 999px; padding: .1rem .6rem; font-size: .72rem; margin-left: .5rem; }
    .anon-note { font-size: .78rem; color: var(--text-secondary); margin: 0 0 .5rem; }
    .text-responses { display: flex; flex-direction: column; gap: .35rem; }
    .text-response { display: flex; gap: .5rem; padding: .5rem .75rem; background: var(--bg); border-radius: 8px; border-left: 3px solid var(--primary); font-size: .82rem; font-style: italic; color: var(--text-secondary); }
    .ai-cta { display: flex; justify-content: space-between; align-items: center; gap: 1rem; background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%); border-color: #c7d2fe; }
    .ai-cta-content { display: flex; align-items: center; gap: 1rem; }
    .ai-icon { font-size: 2.5rem; color: #6366f1; }
    .ai-cta h3 { margin: 0 0 .25rem; }
    .ai-cta p { margin: 0; font-size: .85rem; color: var(--text-secondary); }
    .insight-banner { border-radius: 12px; padding: .75rem 1rem; margin-bottom: 0; }
    .sentiment-positive { background: #f0fdf4; border: 1px solid #bbf7d0; color: #14532d; }
    .sentiment-moderate { background: #fffbeb; border: 1px solid #fde68a; color: #78350f; }
    .sentiment-concerning { background: #fff7ed; border: 1px solid #fed7aa; color: #7c2d12; }
    .sentiment-critical { background: #fef2f2; border: 1px solid #fecaca; color: #7f1d1d; }
    :host-context([data-theme='dark']) .sentiment-positive { background: #052e16; border-color: #166534; color: #bbf7d0; }
    :host-context([data-theme='dark']) .sentiment-moderate { background: #1c1400; border-color: #92400e; color: #fde68a; }
    :host-context([data-theme='dark']) .sentiment-concerning { background: #1c0f00; border-color: #9a3412; color: #fed7aa; }
    :host-context([data-theme='dark']) .sentiment-critical { background: #1c0000; border-color: #991b1b; color: #fecaca; }
    .sentiment-header { display: flex; align-items: center; gap: .4rem; font-weight: 700; font-size: .9rem; margin-bottom: .3rem; }
    .insight-text { margin: 0; font-size: .82rem; line-height: 1.5; }
    .risk-card { border-radius: 12px; padding: .75rem 1rem; margin-bottom: 0; }
    .risk-low { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a5f; }
    .risk-moderate { background: #fffbeb; border: 1px solid #fde68a; color: #78350f; }
    .risk-high { background: #fff7ed; border: 1px solid #fed7aa; color: #7c2d12; }
    .risk-critical { background: #fef2f2; border: 1px solid #fecaca; color: #7f1d1d; }
    :host-context([data-theme='dark']) .risk-low { background: #0c1a2e; border-color: #1d4ed8; color: #bfdbfe; }
    :host-context([data-theme='dark']) .risk-moderate { background: #1c1400; border-color: #92400e; color: #fde68a; }
    :host-context([data-theme='dark']) .risk-high { background: #1c0f00; border-color: #9a3412; color: #fed7aa; }
    :host-context([data-theme='dark']) .risk-critical { background: #1c0000; border-color: #991b1b; color: #fecaca; }
    .risk-header { display: flex; align-items: center; gap: .4rem; font-weight: 700; font-size: .9rem; margin-bottom: .3rem; }
    .risk-badge { font-size: .8rem; font-weight: 800; margin-left: .25rem; }
    .risk-badge-low { color: #0ea5e9; }
    .risk-badge-moderate { color: #f59e0b; }
    .risk-badge-high { color: #f97316; }
    .risk-badge-critical { color: #f87171; }
    .insight-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; margin-bottom: .5rem; }
    .insight-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .5rem; margin-bottom: .5rem; }
    @media(max-width: 768px) { .insight-grid-3 { grid-template-columns: 1fr; } }
    @media(max-width: 640px) { .insight-grid { grid-template-columns: 1fr; } }
    .insight-col h3 { margin: 0 0 .4rem; font-size: .88rem; }
    .insight-col ul { margin: 0; padding-left: 1.1rem; }
    .insight-col ul li { margin-bottom: .2rem; font-size: .82rem; }
    .card h3 { font-size: .9rem; margin: 0 0 .4rem; }
    .card p { font-size: .83rem; margin: 0; line-height: 1.5; }
    .strengths { border-color: #bbf7d0; }
    .concerns { border-color: #fecaca; }
    .recommendations h3 { margin: 0 0 .5rem; }
    .rec-item { display: flex; gap: .5rem; padding: .5rem .75rem; border-radius: 8px; margin-bottom: .3rem; }
    .rec-high { background: #fff7ed; color: #9a3412; }
    .rec-medium { background: #fefce8; color: #854d0e; }
    .rec-low { background: #eff6ff; color: #1e40af; }
    :host-context([data-theme='dark']) .rec-high { background: #1c0f00; color: #fed7aa; }
    :host-context([data-theme='dark']) .rec-medium { background: #1c1400; color: #fde68a; }
    :host-context([data-theme='dark']) .rec-low { background: #0c1a2e; color: #bfdbfe; }
    .rec-priority { flex-shrink: 0; }
    .priority-badge { border-radius: 999px; padding: .2rem .6rem; font-size: .72rem; font-weight: 700; }
    .rec-high .priority-badge { background: #fef2f2; color: #dc2626; }
    .rec-medium .priority-badge { background: #fefce8; color: #d97706; }
    .rec-low .priority-badge { background: #eff6ff; color: #2563eb; }
    .rec-body strong { display: block; margin-bottom: .15rem; font-size: .83rem; }
    .rec-body p { margin: 0; font-size: .78rem; color: var(--text-secondary); }
    .action-plan p { font-size: .83rem; line-height: 1.5; }
    .pulse-suggest { display: flex; align-items: center; gap: .5rem; margin-top: .75rem; padding: .6rem .75rem; background: #eff6ff; border-radius: 8px; font-size: .82rem; color: #2563eb; }
    .ai-generated-note { font-size: .78rem; color: var(--text-secondary); text-align: center; margin-top: 1rem; }
    .section-divider { display: flex; align-items: center; gap: .75rem; margin: 1.25rem 0 .75rem; font-size: .78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .05em; }
    .section-divider::before, .section-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
    .section-divider i { font-size: 1.1rem; color: #6366f1; }
    .insights-footer { display: flex; align-items: center; justify-content: space-between; margin-top: .5rem; }
    .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .spinner-wrap { text-align: center; padding: 2rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: #1e293b; color: #fff; padding: .75rem 1.25rem; border-radius: 8px; font-size: .875rem; z-index: 9999; }
    .toast.error { background: #dc2626; }
    .btn-primary { background: var(--primary); color: #fff; border: none; border-radius: 8px; padding: .6rem 1.2rem; cursor: pointer; font-size: .875rem; display: flex; align-items: center; gap: .4rem; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-ghost { background: transparent; border: 1px solid var(--border); border-radius: 8px; padding: .6rem 1.2rem; cursor: pointer; font-size: .875rem; color: var(--text); }
    .btn-sm { padding: .35rem .75rem; font-size: .78rem; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; gap: .3rem; }
    .btn-sm.btn-primary { background: var(--primary); color: #fff; }
    .btn-sm.btn-danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .btn-sm.btn-ghost { background: var(--bg); border: 1px solid var(--border); color: var(--text); }
  `]
})
export class OrgSurveysComponent implements OnInit {
  private surveyService;
  private orgService;

  constructor(s: SurveyService, o: OrganisationService) {
    this.surveyService = s;
    this.orgService = o;
  }

  activeTab = signal<Tab>('surveys');
  isLoading = signal(true);
  isSubmitting = signal(false);
  analyticsLoading = signal(false);
  insightsLoading = signal(false);
  actionLoading = signal<string | null>(null);
  toast = signal<string | null>(null);

  orgId = '';
  surveys = signal<SurveyWithCount[]>([]);
  selectedSurveyId = signal<string | null>(null);
  selectedTitle = signal('');
  analytics = signal<SurveyAnalytics | null>(null);
  insightReport = signal<AiInsightReport | null>(null);
  insightGeneratedAt = signal<string | null>(null);

  showCreate = false;
  form = { title: '', description: '' };

  ngOnInit() {
    this.orgService.getMyOrganisations().subscribe({
      next: orgs => {
        const active = orgs.find(o => o.verificationStatus === 'VERIFIED') ?? orgs[0];
        if (active) { this.orgId = active.id; this.loadSurveys(); }
        else this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadSurveys() {
    this.isLoading.set(true);
    this.surveyService.getOrgSurveysManage(this.orgId).subscribe({
      next: list => {
        this.surveys.set(list);
        this.isLoading.set(false);
        // Auto-select first survey so Analytics/AI Insights tabs are immediately usable
        if (!this.selectedSurveyId() && list.length > 0) {
          const first = list[0].survey;
          this.selectedSurveyId.set(first.id);
          this.selectedTitle.set(first.title.substring(0, 20) + (first.title.length > 20 ? '…' : ''));
        }
      },
      error: () => { this.isLoading.set(false); this.showToast('Error loading surveys'); }
    });
  }

  create() {
    if (!this.form.title.trim()) return;
    this.isSubmitting.set(true);
    this.surveyService.createSurvey(this.orgId, this.form.title, this.form.description).subscribe({
      next: () => { this.form = { title: '', description: '' }; this.showCreate = false; this.isSubmitting.set(false); this.loadSurveys(); this.showToast('Survey created with 23 default questions!'); },
      error: () => { this.isSubmitting.set(false); this.showToast('Error creating survey'); }
    });
  }

  activate(id: string) {
    this.actionLoading.set(id);
    this.surveyService.activateSurvey(id).subscribe({
      next: () => { this.actionLoading.set(null); this.loadSurveys(); this.showToast('Survey activated — employees can now respond'); },
      error: () => { this.actionLoading.set(null); this.showToast('Error activating survey'); }
    });
  }

  close(id: string) {
    if (!confirm('Close this survey? No more responses will be accepted.')) return;
    this.actionLoading.set(id);
    this.surveyService.closeSurvey(id).subscribe({
      next: () => { this.actionLoading.set(null); this.loadSurveys(); this.showToast('Survey closed'); },
      error: () => { this.actionLoading.set(null); this.showToast('Error closing survey'); }
    });
  }

  viewAnalytics(survey: any) {
    this.selectedSurveyId.set(survey.id);
    this.selectedTitle.set(survey.title.substring(0, 20) + (survey.title.length > 20 ? '…' : ''));
    this.setTab('analytics');
    this.analyticsLoading.set(true);
    this.surveyService.getAnalytics(survey.id).subscribe({
      next: a => { this.analytics.set(a); this.analyticsLoading.set(false); },
      error: () => { this.analyticsLoading.set(false); this.showToast('Error loading analytics'); }
    });
    this.surveyService.getLatestInsight(survey.id).subscribe({
      next: insight => {
        try {
          this.insightReport.set(JSON.parse(insight.insightJson));
          this.insightGeneratedAt.set(new Date(insight.generatedAt).toLocaleString());
        } catch { /* no insight yet */ }
      },
      error: () => {}
    });
  }

  triggerInsights() {
    if (!this.selectedSurveyId()) return;
    this.insightsLoading.set(true);
    this.surveyService.generateInsights(this.selectedSurveyId()!).subscribe({
      next: res => {
        try { this.insightReport.set(JSON.parse(res.insightJson)); }
        catch { this.insightReport.set(res.insightJson as any); }
        this.insightsLoading.set(false);
        this.showToast('AI insights generated!');
      },
      error: () => { this.insightsLoading.set(false); this.showToast('Error generating insights'); }
    });
  }

  setTab(t: Tab) { this.activeTab.set(t); }

  categoryEntries() {
    const a = this.analytics();
    if (!a) return [];
    return Object.entries(a.scoreByCategory).sort((x, y) => x[1] - y[1]);
  }

  uniqueTextResponses(): string[] {
    const a = this.analytics();
    if (!a) return [];
    return [...new Set(a.openTextResponses.filter(r => r && r.trim()))];
  }

  getCategoryLabel(key: string): string {
    return (CATEGORY_LABELS as any)[key] ?? key.replace(/_/g, ' ');
  }

  scoreBarClass(s: number): string {
    return s >= 8 ? 'score-high' : s >= 6 ? 'score-mid' : 'score-low';
  }
  scoreTextClass(s: number): string {
    return 'cat-score ' + (s >= 8 ? 'score-text-high' : s >= 6 ? 'score-text-mid' : 'score-text-low');
  }
  statusClass(s: string): string { return 'status-pill status-' + s; }
  sentimentClass(s: string): string { return 'insight-banner sentiment-' + s; }
  riskClass(r: string): string { return 'risk-card risk-' + r; }
  riskBadgeClass(r: string): string { return 'risk-badge-' + r; }
  formatDate(d: string): string { return new Date(d).toLocaleDateString(); }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(null), 3500); }
}
