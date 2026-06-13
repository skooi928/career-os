import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockInterviewService, StartSessionRequest, MockInterviewSession, InterviewQuestion, InterviewEvaluation } from '../../services/mock-interview.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mock-interview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      
      <!-- STEP 1: SETUP -->
      <div *ngIf="currentStep === 'setup'" class="fade-in">
        <div class="page-header">
          <div class="header-content">
            <h1>Start Your Mock Interview</h1>
            <p>Personalize your AI interviewer to match your exact career goals.</p>
          </div>
          <div class="header-icon">
            <i class="ph-fill ph-robot"></i>
          </div>
        </div>

        <div class="card p-8 mt-8">
          <div class="form-grid">
            <div class="form-group">
              <label>Target Role</label>
              <input type="text" [(ngModel)]="setupData.targetRole" placeholder="e.g. Senior Frontend Engineer" class="form-input">
            </div>
            
            <div class="form-group">
              <label>Industry</label>
              <input type="text" [(ngModel)]="setupData.industry" placeholder="e.g. Fintech, E-commerce" class="form-input">
            </div>

            <div class="form-group">
              <label>Department</label>
              <input type="text" [(ngModel)]="setupData.department" placeholder="e.g. Engineering, Design" class="form-input">
            </div>

            <div class="form-group">
              <label>Seniority Level</label>
              <select [(ngModel)]="setupData.seniorityLevel" class="form-input">
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead/Manager">Lead / Manager</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Interview Mode</label>
              <div class="mode-cards">
                <div class="mode-card" [class.active]="setupData.interviewMode === 'text'" (click)="setupData.interviewMode = 'text'">
                  <i class="ph ph-chat-text"></i>
                  <div class="mode-info">
                    <h3>Text</h3>
                    <p>Fast, chat-based assessment.</p>
                  </div>
                </div>
                <div class="mode-card" [class.active]="setupData.interviewMode === 'audio'" (click)="setupData.interviewMode = 'audio'">
                  <i class="ph ph-microphone"></i>
                  <div class="mode-info">
                    <h3>Audio</h3>
                    <p>Speech-to-text assessment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions mt-8">
            <button class="btn-primary btn-large" (click)="startInterview()" [disabled]="isLoading || !setupData.targetRole || !setupData.industry">
              <i class="ph" [ngClass]="isLoading ? 'ph-spinner fa-spin' : 'ph-rocket-launch'"></i>
              {{ isLoading ? 'Generating Questions...' : 'Start Interview' }}
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 2: INTERVIEWING -->
      <div *ngIf="currentStep === 'interviewing'" class="fade-in">
        <div class="page-header compact-header">
          <div class="header-content">
            <h1>Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</h1>
            <p>Answer the question clearly and confidently.</p>
          </div>
          <div class="timer" [class.warning]="timeLeft < 30">
            <i class="ph ph-timer"></i> {{ formatTime(timeLeft) }}
          </div>
        </div>

        <div class="card p-8 mt-8">
          <div class="question-display" *ngIf="currentQuestion">
            <span class="q-tag">{{ currentQuestion.questionTag }}</span>
            <h2>{{ currentQuestion.questionText }}</h2>
          </div>

          <!-- Text Mode Input -->
          <div class="answer-section" *ngIf="setupData.interviewMode === 'text'">
            <textarea [(ngModel)]="currentAnswerText" (ngModelChange)="onTyping()" placeholder="Type your answer here... Be as detailed as possible." class="form-input textarea-large"></textarea>
          </div>

          <!-- Audio Mode Input -->
          <div class="answer-section audio-mode" *ngIf="setupData.interviewMode === 'audio'">
            <div class="mic-visualizer" [class.recording]="isRecording">
              <div class="ring ring-1"></div>
              <div class="ring ring-2"></div>
              <div class="ring ring-3"></div>
              <button class="mic-btn" (click)="toggleRecording()">
                <i class="ph" [ngClass]="isRecording ? 'ph-stop' : 'ph-microphone'"></i>
              </button>
            </div>
            <p class="recording-status">{{ isRecording ? 'Listening... Speak now' : 'Click microphone to start recording' }}</p>
            
            <div class="live-transcript" *ngIf="currentTranscript">
              <p>"{{ currentTranscript }}"</p>
            </div>
          </div>

          <div class="form-actions mt-8">
            <button class="btn-secondary" (click)="skipQuestion()" [disabled]="isSubmittingAnswer">Skip Question</button>
            <button class="btn-primary" (click)="submitAnswer()" [disabled]="isSubmittingAnswer || (!currentAnswerText && !currentTranscript)">
              <i class="ph" [ngClass]="isSubmittingAnswer ? 'ph-spinner fa-spin' : 'ph-paper-plane-right'"></i>
              {{ isSubmittingAnswer ? 'Evaluating...' : 'Submit Answer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 3: RESULTS -->
      <div *ngIf="currentStep === 'results'" class="fade-in">
        <div class="page-header">
          <div class="header-content">
            <h1>Your AI Evaluation</h1>
            <p>Here is how you performed across all dimensions.</p>
          </div>
          <div class="header-icon">
            <i class="ph-fill ph-check-circle"></i>
          </div>
        </div>

        <div class="card p-8 mt-8">
          <div class="score-cards">
            <div class="score-card">
              <svg viewBox="0 0 36 36" class="circular-chart blue">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle" [attr.stroke-dasharray]="averageScore.technical + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" class="percentage">{{ averageScore.technical }}%</text>
              </svg>
              <span class="score-label">Skill</span>
            </div>
            <div class="score-card">
              <svg viewBox="0 0 36 36" class="circular-chart emerald">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle" [attr.stroke-dasharray]="averageScore.communication + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" class="percentage">{{ averageScore.communication }}%</text>
              </svg>
              <span class="score-label">Communication</span>
            </div>
            <div class="score-card">
              <svg viewBox="0 0 36 36" class="circular-chart amber">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle" [attr.stroke-dasharray]="averageScore.roleFit + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" class="percentage">{{ averageScore.roleFit }}%</text>
              </svg>
              <span class="score-label">Role Fit</span>
            </div>
          </div>

          <div class="feedback-list mt-8">
            <h3 class="mb-4">Detailed Feedback</h3>
            <div class="feedback-item" *ngFor="let eval of evaluations; let i = index">
              <div class="feedback-header" (click)="eval.expanded = !eval.expanded">
                <h3>Q{{i+1}}: {{ questions[i]?.questionText }}</h3>
                <div class="score-badge" [ngClass]="getScoreColor(eval.overallAnswerScore)">
                  {{ eval.overallAnswerScore }}/100
                </div>
                <i class="ph" [ngClass]="eval.expanded ? 'ph-caret-up' : 'ph-caret-down'"></i>
              </div>
              
              <div class="feedback-body" *ngIf="eval.expanded">
                <div class="feedback-section">
                  <h4><i class="ph-fill ph-check-circle text-emerald"></i> Strengths</h4>
                  <p>{{ eval.strengths }}</p>
                </div>
                <div class="feedback-section">
                  <h4><i class="ph-fill ph-warning-circle text-amber"></i> Areas for Improvement</h4>
                  <p>{{ eval.weaknesses }}</p>
                </div>
                <div class="feedback-section bg-surface-alt">
                  <h4><i class="ph-fill ph-lightbulb text-blue"></i> Improved Sample Answer</h4>
                  <p class="sample-answer">{{ eval.improvedSampleAnswer }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions mt-8 justify-center">
            <button class="btn-secondary" (click)="goToDashboard()">Return to Dashboard</button>
            <button class="btn-primary" (click)="reset()">Practice Again</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .page-wrapper {
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding-bottom: 48px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 48px;
      background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
      border-radius: 28px;
      color: white;
      box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.3);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .compact-header {
      padding: 32px 48px;
    }

    .page-header::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent 50%);
      pointer-events: none;
    }

    .header-content h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      position: relative;
      z-index: 2;
      color: white;
    }

    .header-content p {
      margin: 12px 0 0 0;
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.9);
      position: relative;
      z-index: 2;
      font-weight: 400;
    }

    .header-icon {
      font-size: 9rem;
      color: rgba(255, 255, 255, 0.03);
      transform: rotate(15deg) translateY(-20px);
      position: absolute;
      right: 40px;
      pointer-events: none;
    }

    .card {
      background: var(--color-surface);
      border-radius: 28px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }
    
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(to right, var(--color-primary), #3b82f6);
      opacity: 0.8;
    }

    .p-8 { padding: 40px; }
    .mt-8 { margin-top: 32px; }
    .mb-4 { margin-bottom: 16px; }

    .fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Forms */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .form-group { display: flex; flex-direction: column; gap: 10px; }
    .full-width { grid-column: 1 / -1; }
    .form-group label { font-size: 0.9rem; font-weight: 700; color: var(--color-text); text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8; }
    
    .form-input {
      width: 100%;
      padding: 16px 20px;
      border-radius: 16px;
      border: 2px solid var(--color-border);
      background: var(--color-input-bg, var(--color-background));
      color: var(--color-text);
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    
    .form-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px rgba(0, 145, 97, 0.15), inset 0 2px 4px rgba(0,0,0,0.01);
      background: var(--color-surface);
      transform: translateY(-1px);
    }
    
    .textarea-large { min-height: 200px; resize: vertical; line-height: 1.7; font-size: 1.05rem; }
    select.form-input { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 16px center; background-size: 20px; padding-right: 48px; cursor: pointer; }

    /* Mode Cards */
    .mode-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .mode-card {
      display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px; padding: 32px 24px;
      border: 2px solid var(--color-border); border-radius: 20px;
      background: var(--color-background);
      cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative; overflow: hidden;
    }
    
    .mode-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, rgba(0, 145, 97, 0.1), transparent);
      opacity: 0; transition: opacity 0.3s; pointer-events: none;
    }
    
    .mode-card:hover { border-color: rgba(0, 145, 97, 0.4); transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05); }
    .mode-card.active { border-color: var(--color-primary); background: var(--color-surface); box-shadow: 0 12px 24px -8px rgba(0, 145, 97, 0.2); }
    .mode-card.active::before { opacity: 1; }
    
    .mode-card i { font-size: 40px; color: var(--color-primary); transition: transform 0.3s; }
    .mode-card.active i { transform: scale(1.1); }
    .mode-info h3 { margin: 0 0 8px; font-size: 1.2rem; color: var(--color-text); font-weight: 700; }
    .mode-info p { margin: 0; font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.4; }

    /* Buttons */
    .form-actions { display: flex; justify-content: flex-end; gap: 16px; border-top: 1px solid var(--color-border); padding-top: 32px; margin-top: 40px; }
    .justify-center { justify-content: center; }
    
    .btn-primary {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
      color: white; border: none; border-radius: 14px;
      padding: 14px 28px; font-weight: 700; font-size: 1rem;
      cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex; align-items: center; gap: 10px;
      box-shadow: 0 4px 12px rgba(0, 145, 97, 0.25);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 145, 97, 0.4); filter: brightness(1.1); }
    .btn-primary:active:not(:disabled) { transform: translateY(0); box-shadow: 0 2px 8px rgba(0, 145, 97, 0.2); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(50%); box-shadow: none; }
    .btn-large { padding: 16px 36px; font-size: 1.1rem; }
    
    .btn-secondary {
      background: var(--color-surface); color: var(--color-text);
      border: 2px solid var(--color-border); border-radius: 14px;
      padding: 14px 28px; font-weight: 700; font-size: 1rem;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-secondary:hover:not(:disabled) { background: var(--color-background); border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

    /* Interview Step */
    .timer { font-size: 1.5rem; font-weight: 800; color: white; display: flex; align-items: center; gap: 10px; font-variant-numeric: tabular-nums; background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); padding: 10px 20px; border-radius: 16px; position: relative; z-index: 2; border: 1px solid rgba(255,255,255,0.1); }
    .timer.warning { color: #ef4444; background: rgba(255, 255, 255, 0.95); animation: pulseWarning 1s infinite; border-color: transparent; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
    @keyframes pulseWarning { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

    .question-display { margin-bottom: 48px; text-align: center; padding: 32px; background: var(--color-background); border-radius: 20px; border: 1px solid var(--color-border); position: relative; }
    .q-tag { display: inline-block; padding: 6px 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border-radius: 100px; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); }
    .question-display h2 { font-size: 2.2rem; color: var(--color-text); margin: 0; line-height: 1.4; font-weight: 800; letter-spacing: -0.02em; }

    /* Mic Visualizer for Audio Mode */
    .audio-mode { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 24px 0; }
    .mic-visualizer { position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 40px; }
    .mic-btn { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover)); border: none; color: white; font-size: 36px; cursor: pointer; z-index: 10; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0, 145, 97, 0.4); }
    .mic-btn:hover { transform: scale(1.05); }
    .recording .mic-btn { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 10px 30px rgba(239, 68, 68, 0.5); }
    
    .ring { position: absolute; border-radius: 50%; border: 2px solid rgba(0, 145, 97, 0.5); opacity: 0; z-index: 1; }
    .recording .ring { border-color: rgba(239, 68, 68, 0.5); border-width: 3px; animation: smoothRipple 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
    .recording .ring-1 { animation-delay: 0s; }
    .recording .ring-2 { animation-delay: 0.6s; }
    .recording .ring-3 { animation-delay: 1.2s; }
    @keyframes smoothRipple {
      0% { width: 90px; height: 90px; opacity: 1; }
      100% { width: 300px; height: 300px; opacity: 0; }
    }
    .recording-status { font-weight: 600; color: var(--color-text); font-size: 1.1rem; }
    
    .live-transcript { width: 100%; max-width: 800px; margin: 0 auto; background: var(--color-background); padding: 24px; border-radius: 16px; border: 1px solid var(--color-border); font-style: italic; color: var(--color-text); font-size: 1.2rem; line-height: 1.7; text-align: center; box-shadow: inset 0 2px 10px rgba(0,0,0,0.02); }

    /* Results Step */
    .score-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px; }
    .score-card { display: flex; flex-direction: column; align-items: center; padding: 32px 24px; background: var(--color-surface); border-radius: 24px; border: 1px solid var(--color-border); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.03); transition: transform 0.3s; }
    .score-card:hover { transform: translateY(-4px); }
    
    .circular-chart { display: block; margin: 0 auto; max-width: 140px; max-height: 140px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05)); }
    .circle-bg { fill: none; stroke: var(--color-background); stroke-width: 3.5; }
    .circle { fill: none; stroke-width: 3.5; stroke-linecap: round; animation: progress 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes progress { 0% { stroke-dasharray: 0 100; } }
    .percentage { fill: var(--color-text); font-family: system-ui, -apple-system, sans-serif; font-size: 0.45em; text-anchor: middle; font-weight: 800; }
    .blue .circle { stroke: #3b82f6; }
    .emerald .circle { stroke: #10b981; }
    .amber .circle { stroke: #f59e0b; }
    .score-label { margin-top: 20px; font-weight: 700; color: var(--color-text); font-size: 1.1rem; }

    .feedback-list { display: flex; flex-direction: column; gap: 20px; }
    .feedback-item { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: all 0.3s; }
    .feedback-item:hover { box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05); }
    .feedback-header { padding: 24px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: background 0.2s; }
    .feedback-header:hover { background: var(--color-background); }
    .feedback-header h3 { margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--color-text); flex: 1; line-height: 1.4; }
    
    .score-badge { padding: 6px 16px; border-radius: 100px; font-weight: 800; font-size: 0.9rem; margin: 0 20px; }
    .score-good { background: rgba(0, 145, 97, 0.1); color: var(--color-primary); }
    .score-avg { background: rgba(245, 158, 11, 0.1); color: #b45309; }
    .score-poor { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }
    
    .feedback-body { padding: 0 24px 24px; display: flex; flex-direction: column; gap: 24px; border-top: 1px solid var(--color-border); padding-top: 24px; animation: slideDown 0.3s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    
    .feedback-section h4 { display: flex; align-items: center; gap: 10px; margin: 0 0 10px 0; font-size: 0.95rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text); }
    .feedback-section p { margin: 0; color: var(--color-text-secondary); line-height: 1.7; font-size: 1.05rem; }
    .bg-surface-alt { background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.1) 100%); padding: 20px; border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.15); }
    .sample-answer { font-style: italic; color: #1e293b !important; font-weight: 500; }
    
    .text-emerald { color: var(--color-primary); }
    .text-amber { color: #f59e0b; }
    .text-blue { color: #3b82f6; }
  `]
})
export class MockInterviewComponent implements OnInit {
  currentStep: 'setup' | 'interviewing' | 'results' = 'setup';
  isLoading = false;
  
  // Setup Data
  setupData: StartSessionRequest = {
    userId: '',
    targetRole: '',
    industry: '',
    department: '',
    seniorityLevel: 'Mid-Level',
    language: 'en',
    interviewMode: 'audio',
    interviewType: 'mixed',
    skills: []
  };

  // State
  session: MockInterviewSession | null = null;
  questions: InterviewQuestion[] = [];
  evaluations: any[] = []; // InterviewEvaluation extended with expanded flag
  
  currentQuestionIndex = 0;
  get currentQuestion() { return this.questions[this.currentQuestionIndex]; }

  // Answer state
  currentAnswerText = '';
  currentTranscript = '';
  isSubmittingAnswer = false;
  
  // Audio state
  isRecording = false;
  recognition: any;
  
  // MediaRecorder state
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: BlobPart[] = [];
  mediaBlob: Blob | undefined;
  audioStream: MediaStream | null = null;
  
  // Timer state
  timeLeft = 120; // 2 minutes per question
  timerInterval: any;
  isTimerRunning = false;

  // Results state
  averageScore = { technical: 0, communication: 0, roleFit: 0 };

  constructor(
    private mockInterviewService: MockInterviewService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user.userId) {
      this.setupData.userId = user.userId;
    }
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    if (isPlatformBrowser(this.platformId)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          this.ngZone.run(() => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }
            
            if (finalTranscript) {
              this.currentTranscript = this.currentTranscript.replace(/ \[.*\]$/, '');
              this.currentTranscript += (this.currentTranscript ? ' ' : '') + finalTranscript.trim();
            } else if (interimTranscript) {
              this.currentTranscript = this.currentTranscript.replace(/ \[.*\]$/, '');
              this.currentTranscript += ' [' + interimTranscript.trim() + ']';
            }
            this.cdr.detectChanges();
          });
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
        };
      }
    }
  }

  startInterview() {
    this.isLoading = true;
    this.mockInterviewService.startSession(this.setupData).subscribe({
      next: (session) => {
        this.session = session;
        this.mockInterviewService.getQuestions(session.sessionId).subscribe({
          next: (questions) => {
            this.questions = questions;
            this.isLoading = false;
            if (this.questions.length > 0) {
              this.currentStep = 'interviewing';
              this.resetTimer();
            } else {
              alert("Failed to generate questions. Please check if the Python AI service is running on port 8000 and the Groq API key is valid.");
            }
          },
          error: (err) => {
            console.error('Error fetching questions', err);
            this.isLoading = false;
            alert("Error communicating with backend.");
          }
        });
      },
      error: (err) => {
        console.error('Error starting session', err);
        this.isLoading = false;
        alert("Failed to start session. Backend might be unreachable.");
      }
    });
  }

  resetTimer() {
    this.timeLeft = 120;
    this.isTimerRunning = false;
    clearInterval(this.timerInterval);
  }

  startTimer() {
    if (this.isTimerRunning) return;
    this.isTimerRunning = true;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.timeLeft--;
        this.cdr.detectChanges();
        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.isTimerRunning = false;
          if (this.isRecording) this.toggleRecording();
          this.submitAnswer(); // auto submit when time is up for audio/text
        }
      });
    }, 1000);
  }

  onTyping() {
    if (!this.isTimerRunning && this.currentAnswerText.length > 0) {
      this.startTimer();
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }



  async toggleRecording() {
    if (!this.recognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    
    if (this.isRecording) {
      this.recognition.stop();
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      } else {
        this.currentTranscript = this.currentTranscript.replace(/ \[.*\]$/, '');
        this.isRecording = false;
      }
    } else {
      this.currentTranscript = '';
      this.recordedChunks = [];
      this.mediaBlob = undefined;
      
      try {
        const streamConstraints = {
          audio: true,
          video: false
        };
        this.audioStream = await navigator.mediaDevices.getUserMedia(streamConstraints);

        this.mediaRecorder = new MediaRecorder(this.audioStream);
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };
        
        this.mediaRecorder.onstop = () => {
          this.ngZone.run(() => {
            const type = this.mediaRecorder ? this.mediaRecorder.mimeType : 'audio/webm';
            this.mediaBlob = new Blob(this.recordedChunks, { type });
            
            if (this.audioStream) {
              this.audioStream.getTracks().forEach(track => track.stop());
            }
            
            this.currentTranscript = this.currentTranscript.replace(/ \[.*\]$/, '');
            this.isRecording = false;
            
            if (this.isSubmittingAnswer) {
              this.performSubmission();
            }
            this.cdr.detectChanges();
          });
        };

        this.mediaRecorder.start();
        this.recognition.start();
        this.startTimer();
        this.isRecording = true;
      } catch (err) {
        console.error("Error accessing media devices.", err);
        alert("Could not access camera or microphone.");
      }
    }
  }

  skipQuestion() {
    this.currentAnswerText = 'Skipped';
    this.currentTranscript = ''; 
    this.mediaBlob = undefined;
    this.recordedChunks = [];
    this.submitAnswer();
  }

  submitAnswer() {
    if (!this.currentQuestion || !this.session) return;
    
    clearInterval(this.timerInterval);
    this.isSubmittingAnswer = true;
    
    if (this.isRecording) {
      this.toggleRecording(); // onstop will call performSubmission()
    } else {
      this.performSubmission();
    }
  }

  performSubmission() {
    // Clean up transcript visual tags
    const cleanTranscript = this.currentTranscript.replace(/ \[.*\]$/, '').trim();
    
    // Calculate how long they took to answer
    const responseDuration = 120 - this.timeLeft;

    const audioBlob = this.setupData.interviewMode === 'audio' ? this.mediaBlob : undefined;

    this.mockInterviewService.submitAnswer(
      this.currentQuestion!.questionId,
      this.session!.userId,
      this.currentAnswerText,
      this.currentQuestion!.questionText,
      this.setupData.targetRole,
      cleanTranscript,
      audioBlob,
      undefined,
      responseDuration
    ).subscribe({
      next: (evaluation) => {
        this.ngZone.run(() => {
          this.evaluations.push({ ...evaluation, expanded: false });
          this.isSubmittingAnswer = false;
          this.currentAnswerText = '';
          this.currentTranscript = '';
          this.mediaBlob = undefined;
          this.recordedChunks = [];
          
          if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.resetTimer();
          } else {
            this.finishInterview();
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error evaluating answer', err);
          this.isSubmittingAnswer = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  finishInterview() {
    this.currentStep = 'results';
    
    // Calculate averages
    if (this.evaluations.length > 0) {
      this.averageScore.technical = Math.round(this.evaluations.reduce((sum, e) => sum + e.technicalScore, 0) / this.evaluations.length);
      this.averageScore.communication = Math.round(this.evaluations.reduce((sum, e) => sum + e.communicationScore, 0) / this.evaluations.length);
      this.averageScore.roleFit = Math.round(this.evaluations.reduce((sum, e) => sum + e.roleFitScore, 0) / this.evaluations.length);
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'score-good';
    if (score >= 60) return 'score-avg';
    return 'score-poor';
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  reset() {
    this.currentStep = 'setup';
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.evaluations = [];
    this.session = null;
  }
}
