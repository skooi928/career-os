import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '../../services/survey.service';
import { OrganisationService } from '../../services/organisation.service';
import {
  EmployeeSurvey, SurveyQuestion, AnswerInput, CATEGORY_LABELS, QuestionCategory
} from '../../types/upskilling.types';

type ViewState = 'list' | 'taking' | 'done';

@Component({
  selector: 'app-employee-surveys',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">

  <!-- ── LIST VIEW ──────────────────────────────────────────────────────── -->
  <ng-container *ngIf="view() === 'list'">
    <div class="page-header">
      <div>
        <h1><i class="ph ph-clipboard-text"></i> Workplace Surveys</h1>
        <p>Your organisation wants to hear from you. All responses are completely anonymous — your identity is never stored.</p>
      </div>
    </div>

    <div class="privacy-banner">
      <i class="ph ph-shield-check"></i>
      <div>
        <strong>Your Privacy is Protected</strong>
        <p>Responses are stored anonymously with no link to your identity. Managers only see aggregated scores — never individual answers.</p>
      </div>
    </div>

    <div class="spinner-wrap" *ngIf="isLoading()"><div class="spinner"></div></div>

    <div class="empty-state" *ngIf="!isLoading() && !orgId">
      <i class="ph ph-buildings empty-icon"></i>
      <h3>No Organisation Found</h3>
      <p>You must be a member of a verified organisation to access surveys.</p>
    </div>

    <div class="empty-state" *ngIf="!isLoading() && orgId && surveys().length === 0">
      <i class="ph ph-check-circle empty-icon"></i>
      <h3>All caught up!</h3>
      <p>No active surveys require your input at the moment. Check back later.</p>
    </div>

    <div class="survey-list" *ngIf="!isLoading() && surveys().length > 0">
      <div class="survey-card card" *ngFor="let s of surveys()">
        <div class="survey-info">
          <h3>{{ s.title }}</h3>
          <p *ngIf="s.description">{{ s.description }}</p>
          <div class="survey-meta">
            <span class="meta-item"><i class="ph ph-clock"></i> Takes ~10 minutes</span>
            <span class="meta-item"><i class="ph ph-list-numbers"></i> 23 questions</span>
            <span class="badge-anon"><i class="ph ph-lock-simple"></i> Anonymous</span>
          </div>
        </div>
        <button class="btn-primary" (click)="startSurvey(s)">
          <i class="ph ph-arrow-right"></i> Start Survey
        </button>
      </div>
    </div>
  </ng-container>

  <!-- ── SURVEY FORM ─────────────────────────────────────────────────────── -->
  <ng-container *ngIf="view() === 'taking'">
    <div class="survey-header">
      <button class="btn-back" (click)="view.set('list')"><i class="ph ph-arrow-left"></i> Back</button>
      <div>
        <h1>{{ currentSurvey()?.title }}</h1>
        <p>{{ currentSurvey()?.description }}</p>
      </div>
    </div>

    <div class="progress-bar-wrap">
      <div class="progress-info">
        <span>Question {{ currentQuestionIndex() + 1 }} of {{ questions().length }}</span>
        <span>{{ progressPercent() }}% complete</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" [style.width]="progressPercent() + '%'"></div></div>
    </div>

    <div class="anon-reminder">
      <i class="ph ph-shield-check"></i> Your response is completely anonymous
    </div>

    <!-- Questions grouped by category sections -->
    <div *ngFor="let section of sections()">
      <div class="section-header">
        <span class="section-icon">{{ categoryIcon(section.category) }}</span>
        <h2>{{ getCategoryLabel(section.category) }}</h2>
      </div>

      <div class="question-card card" *ngFor="let q of section.questions; let qi = index">
        <div class="question-text">{{ q.orderIndex }}. {{ q.questionText }}</div>

        <!-- RATING 1–10 -->
        <ng-container *ngIf="q.questionType === 'RATING'">
          <div class="rating-scale">
            <span class="scale-label">Not at all</span>
            <div class="rating-buttons">
              <button *ngFor="let n of ratingNums"
                      [class.selected]="getAnswer(q.id)?.ratingValue === n"
                      [class]="ratingBtnClass(n, getAnswer(q.id)?.ratingValue)"
                      (click)="setRating(q.id, n)">{{ n }}</button>
            </div>
            <span class="scale-label right">Absolutely</span>
          </div>
        </ng-container>

        <!-- SCALE 1–5 -->
        <ng-container *ngIf="q.questionType === 'SCALE'">
          <div class="rating-scale">
            <span class="scale-label">1</span>
            <div class="rating-buttons">
              <button *ngFor="let n of scaleNums"
                      [class.selected]="getAnswer(q.id)?.ratingValue === n"
                      [class]="ratingBtnClass(n * 2, getAnswer(q.id)?.ratingValue ? getAnswer(q.id)!.ratingValue! * 2 : null)"
                      (click)="setRating(q.id, n)">{{ n }}</button>
            </div>
            <span class="scale-label right">5</span>
          </div>
        </ng-container>

        <!-- TEXT -->
        <ng-container *ngIf="q.questionType === 'TEXT'">
          <textarea class="text-input" rows="4"
                    [placeholder]="'Share your thoughts (optional)…'"
                    [(ngModel)]="textMap[q.id]"
                    (input)="setTextAnswer(q.id, textMap[q.id])"></textarea>
        </ng-container>
      </div>
    </div>

    <!-- Validation notice -->
    <div class="validation-notice" *ngIf="showValidation()">
      <i class="ph ph-warning-circle"></i> Please answer all rating/scale questions before submitting.
    </div>

    <!-- Submit -->
    <div class="submit-area">
      <button class="btn-primary btn-submit" (click)="submit()" [disabled]="isSubmitting()">
        <i class="ph ph-paper-plane-tilt"></i>
        {{ isSubmitting() ? 'Submitting anonymously…' : 'Submit My Anonymous Response' }}
      </button>
      <p class="submit-note">Your answers will be aggregated with others. No one can trace this back to you.</p>
    </div>
  </ng-container>

  <!-- ── DONE VIEW ──────────────────────────────────────────────────────── -->
  <ng-container *ngIf="view() === 'done'">
    <div class="done-screen">
      <div class="done-icon">🎉</div>
      <h2>Thank You for Your Feedback!</h2>
      <p>Your anonymous response has been submitted. Your input helps leadership make data-driven improvements to your workplace.</p>
      <div class="done-facts">
        <div class="done-fact"><i class="ph ph-shield-check"></i> Fully anonymous — no identity stored</div>
        <div class="done-fact"><i class="ph ph-chart-bar"></i> Only aggregated scores are shown to managers</div>
        <div class="done-fact"><i class="ph ph-brain"></i> Gemini AI will generate actionable insights from responses</div>
      </div>
      <button class="btn-primary" (click)="view.set('list')">
        <i class="ph ph-arrow-left"></i> Back to Surveys
      </button>
    </div>
  </ng-container>

  <!-- Toast -->
  <div class="toast" *ngIf="toast()" [class.error]="toast()!.startsWith('Error')">{{ toast() }}</div>
</div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 860px; margin: 0 auto; }
    .page-header { margin-bottom: 1rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 .25rem; }
    .page-header p { color: var(--text-secondary); margin: 0; }
    .privacy-banner { display: flex; gap: 1rem; align-items: flex-start; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
    .privacy-banner strong { display: block; margin-bottom: .2rem; color: #15803d; }
    .privacy-banner p { margin: 0; font-size: .85rem; color: #166534; }
    .privacy-banner i { font-size: 1.5rem; color: #16a34a; flex-shrink: 0; margin-top: .1rem; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
    .survey-list { display: flex; flex-direction: column; gap: .75rem; }
    .survey-card { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .survey-info h3 { margin: 0 0 .25rem; font-size: 1rem; font-weight: 600; }
    .survey-info p { margin: 0 0 .5rem; font-size: .85rem; color: var(--text-secondary); }
    .survey-meta { display: flex; gap: .75rem; flex-wrap: wrap; }
    .meta-item { display: flex; align-items: center; gap: .3rem; font-size: .78rem; color: var(--text-secondary); }
    .badge-anon { display: flex; align-items: center; gap: .25rem; background: #dcfce7; color: #15803d; border-radius: 999px; padding: .15rem .6rem; font-size: .75rem; font-weight: 600; }
    .survey-header { margin-bottom: 1.25rem; }
    .survey-header h1 { font-size: 1.3rem; font-weight: 700; margin: .4rem 0 .2rem; }
    .survey-header p { color: var(--text-secondary); font-size: .875rem; margin: 0; }
    .btn-back { display: flex; align-items: center; gap: .4rem; background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: .85rem; padding: 0; margin-bottom: .5rem; }
    .progress-bar-wrap { margin-bottom: 1rem; }
    .progress-info { display: flex; justify-content: space-between; font-size: .78rem; color: var(--text-secondary); margin-bottom: .3rem; }
    .progress-bar { height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 999px; transition: width .4s; }
    .anon-reminder { display: flex; align-items: center; gap: .4rem; font-size: .78rem; color: #16a34a; margin-bottom: 1.25rem; }
    .section-header { display: flex; align-items: center; gap: .6rem; margin: 1.5rem 0 .75rem; }
    .section-icon { font-size: 1.4rem; }
    .section-header h2 { margin: 0; font-size: 1rem; font-weight: 700; color: var(--primary); }
    .question-card { margin-bottom: .75rem; }
    .question-text { font-size: .9rem; font-weight: 500; margin-bottom: .85rem; line-height: 1.5; }
    .rating-scale { display: flex; align-items: center; gap: .75rem; }
    .scale-label { font-size: .75rem; color: var(--text-secondary); white-space: nowrap; }
    .scale-label.right { text-align: right; }
    .rating-buttons { display: flex; gap: .35rem; flex-wrap: wrap; }
    .rating-buttons button { width: 36px; height: 36px; border-radius: 8px; border: 2px solid var(--border); background: var(--bg); cursor: pointer; font-size: .82rem; font-weight: 600; transition: all .15s; color: var(--text); }
    .rating-buttons button:hover { border-color: var(--primary); color: var(--primary); }
    .rating-buttons button.selected { background: var(--primary); color: #fff; border-color: var(--primary); }
    .rating-buttons button.btn-high { border-color: #22c55e; }
    .rating-buttons button.btn-mid { border-color: #f59e0b; }
    .rating-buttons button.btn-low { border-color: #ef4444; }
    .text-input { width: 100%; padding: .6rem .8rem; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font-size: .875rem; resize: vertical; box-sizing: border-box; }
    .validation-notice { display: flex; align-items: center; gap: .5rem; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: .75rem 1rem; margin-bottom: 1rem; font-size: .875rem; }
    .submit-area { text-align: center; padding: 1.5rem 0; }
    .btn-submit { font-size: 1rem; padding: .85rem 2rem; border-radius: 10px; }
    .submit-note { font-size: .78rem; color: var(--text-secondary); margin-top: .6rem; }
    .done-screen { text-align: center; padding: 3rem 1rem; max-width: 520px; margin: 0 auto; }
    .done-icon { font-size: 4rem; margin-bottom: 1rem; }
    .done-screen h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: .75rem; }
    .done-screen p { color: var(--text-secondary); margin-bottom: 1.5rem; }
    .done-facts { display: flex; flex-direction: column; gap: .6rem; margin-bottom: 2rem; text-align: left; }
    .done-fact { display: flex; align-items: center; gap: .6rem; font-size: .875rem; color: var(--text-secondary); }
    .done-fact i { color: var(--primary); }
    .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .spinner-wrap { text-align: center; padding: 2rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: #1e293b; color: #fff; padding: .75rem 1.25rem; border-radius: 8px; font-size: .875rem; z-index: 9999; }
    .toast.error { background: #dc2626; }
    .btn-primary { background: var(--primary); color: #fff; border: none; border-radius: 8px; padding: .6rem 1.2rem; cursor: pointer; font-size: .875rem; display: inline-flex; align-items: center; gap: .4rem; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
  `]
})
export class EmployeeSurveysComponent implements OnInit {
  private surveyService;
  private orgService;

  constructor(s: SurveyService, o: OrganisationService) {
    this.surveyService = s;
    this.orgService = o;
  }

  view = signal<ViewState>('list');
  isLoading = signal(true);
  isSubmitting = signal(false);
  showValidation = signal(false);
  toast = signal<string | null>(null);

  orgId = '';
  surveys = signal<EmployeeSurvey[]>([]);
  currentSurvey = signal<EmployeeSurvey | null>(null);
  questions = signal<SurveyQuestion[]>([]);

  // answers map: questionId -> AnswerInput
  private answersMap: Map<string, AnswerInput> = new Map();
  textMap: Record<string, string> = {};

  readonly ratingNums = [1,2,3,4,5,6,7,8,9,10];
  readonly scaleNums  = [1,2,3,4,5];

  currentQuestionIndex = signal(0);
  progressPercent = computed(() => {
    const total = this.questions().length;
    if (total === 0) return 0;
    const answered = Array.from(this.answersMap.values())
      .filter(a => a.ratingValue != null || (a.textAnswer && a.textAnswer.trim())).length;
    return Math.round(answered / total * 100);
  });

  sections = computed(() => {
    const cats = Object.keys(CATEGORY_LABELS) as QuestionCategory[];
    return cats
      .map(cat => ({
        category: cat,
        questions: this.questions().filter(q => q.category === cat)
      }))
      .filter(s => s.questions.length > 0);
  });

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
    this.surveyService.getActiveSurveys(this.orgId).subscribe({
      next: list => { this.surveys.set(list); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.showToast('Error loading surveys'); }
    });
  }

  startSurvey(survey: EmployeeSurvey) {
    this.currentSurvey.set(survey);
    this.answersMap.clear();
    this.textMap = {};
    this.showValidation.set(false);
    this.surveyService.getQuestions(survey.id).subscribe({
      next: qs => {
        this.questions.set(qs);
        this.view.set('taking');
      },
      error: () => this.showToast('Error loading survey questions')
    });
  }

  getAnswer(questionId: string): AnswerInput | undefined {
    return this.answersMap.get(questionId);
  }

  setRating(questionId: string, value: number) {
    this.answersMap.set(questionId, { questionId, ratingValue: value, textAnswer: null });
    this.showValidation.set(false);
  }

  setTextAnswer(questionId: string, text: string) {
    const existing = this.answersMap.get(questionId) ?? { questionId, ratingValue: null };
    this.answersMap.set(questionId, { ...existing, textAnswer: text || null });
  }

  ratingBtnClass(normalised: number, selectedNormalised: number | null | undefined): string {
    if (normalised >= 8) return 'btn-high';
    if (normalised >= 5) return 'btn-mid';
    return 'btn-low';
  }

  submit() {
    const survey = this.currentSurvey();
    if (!survey) return;

    // Validate all non-TEXT questions are answered
    const ratingQuestions = this.questions().filter(q => q.questionType !== 'TEXT');
    const missing = ratingQuestions.some(q => !this.answersMap.has(q.id) || this.answersMap.get(q.id)?.ratingValue == null);
    if (missing) { this.showValidation.set(true); return; }

    this.isSubmitting.set(true);
    const answers: AnswerInput[] = Array.from(this.answersMap.values());
    this.surveyService.submitResponse(survey.id, answers).subscribe({
      next: () => { this.isSubmitting.set(false); this.view.set('done'); },
      error: (err) => {
        this.isSubmitting.set(false);
        this.showToast('Error: ' + (err?.error?.message ?? 'Could not submit response'));
      }
    });
  }

  getCategoryLabel(cat: QuestionCategory): string {
    return CATEGORY_LABELS[cat] ?? cat.replace(/_/g, ' ');
  }

  categoryIcon(cat: QuestionCategory): string {
    const icons: Record<string, string> = {
      JOB_SATISFACTION: '😊', WORK_ENVIRONMENT: '🏢', WORK_LIFE_BALANCE: '⚖️',
      TEAM_COLLABORATION: '🤝', COMMUNICATION: '💬', LEADERSHIP: '🎯',
      CAREER_GROWTH: '📈', COMPENSATION: '💰', MENTAL_WELLBEING: '🧠',
      EMPLOYEE_ENGAGEMENT: '🔥', RETENTION_LIKELIHOOD: '🏠'
    };
    return icons[cat] ?? '📋';
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(null), 3500); }
}
