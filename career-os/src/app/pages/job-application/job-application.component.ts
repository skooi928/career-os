import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService, Job } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="application-container" *ngIf="job; else loading">
      
      <button class="btn-back" (click)="goBack()">
        <i class="ph ph-arrow-left"></i> Back to Job Details
      </button>

      <div class="application-header">
        <h1>Apply for <span class="text-primary">{{ job.title }}</span></h1>
        <p>at {{ job.company }} &middot; {{ job.location }}</p>
      </div>

      <div class="card application-form">
        <div class="form-section">
          <h3><i class="ph-fill ph-user-circle text-primary"></i> Candidate Information</h3>
          <p class="subtitle">Your profile information will be automatically attached to this application.</p>
          <div class="profile-preview">
            <div class="profile-avatar">
              {{ firstName()[0] }}{{ lastName()[0] }}
            </div>
            <div class="profile-details">
              <strong>{{ firstName() }} {{ lastName() }}</strong>
              <span>{{ email() }}</span>
            </div>
          </div>
        </div>

        <hr class="divider">

        <div class="form-section">
          <h3><i class="ph-fill ph-file-pdf text-primary"></i> Resume</h3>
          <p class="subtitle">Upload a recent resume or CV to stand out.</p>
          
          <div class="resume-upload-area" [class.has-file]="resumeFile" (click)="triggerFileInput()">
            <input type="file" #fileInput accept="application/pdf" style="display: none" (change)="onFileSelected($event)">
            <ng-container *ngIf="!resumeFile">
              <i class="ph ph-upload-simple upload-icon"></i>
              <h4>Click to select a resume</h4>
              <p>PDF only, up to 5MB</p>
              <div *ngIf="isUploading" class="uploading-state mt-2">
                <i class="ph-bold ph-spinner spinner-icon"></i> Uploading...
              </div>
            </ng-container>
            <ng-container *ngIf="resumeFile && !isUploading">
              <i class="ph-fill ph-file-pdf document-icon"></i>
              <h4>{{ resumeFileName }}</h4>
              <p class="success-text"><i class="ph-bold ph-check"></i> Attached Successfully</p>
              <button class="btn-text-danger" (click)="$event.stopPropagation(); removeResume()">Remove</button>
            </ng-container>
          </div>
        </div>

        <hr class="divider" *ngIf="job.questions && job.questions.length > 0">

        <!-- Dynamic Questions -->
        <div class="form-section" *ngIf="job.questions && job.questions.length > 0">
          <h3><i class="ph-fill ph-chat-circle-text text-primary"></i> Additional Questions</h3>
          <p class="subtitle">The employer has requested you answer the following questions.</p>
          
          <form [formGroup]="answersForm">
            <div *ngFor="let question of job.questions; let i = index" class="question-block">
              <label class="question-label">{{ i + 1 }}. {{ question.questionText }} <span class="required">*</span></label>
              
              <!-- TEXT Type -->
              <div *ngIf="question.questionType === 'TEXT'" class="input-wrapper">
                <textarea [formControlName]="question.id || 'q' + i" class="form-input textarea-medium" placeholder="Your answer..."></textarea>
              </div>

              <!-- MULTIPLE CHOICE Type -->
              <div *ngIf="question.questionType === 'MULTIPLE_CHOICE'" class="options-list">
                <label *ngFor="let option of question.options; let oIndex = index" class="radio-option">
                  <input type="radio" [formControlName]="question.id || 'q' + i" [value]="option">
                  <span class="radio-custom"></span>
                  {{ option }}
                </label>
              </div>
            </div>
          </form>
        </div>

        <div class="form-actions">
          <div *ngIf="successMessage" class="success-message">
            <i class="ph-fill ph-check-circle"></i> {{ successMessage }}
          </div>
          <button class="btn-submit" [disabled]="isSubmitting" (click)="submitApplication()">
            <span *ngIf="!isSubmitting">Submit Application <i class="ph-bold ph-paper-plane-right"></i></span>
            <span *ngIf="isSubmitting"><i class="ph-bold ph-spinner spinner-icon"></i> Submitting...</span>
          </button>
        </div>
      </div>

    </div>

    <ng-template #loading>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Preparing application...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .application-container {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: 60px;
    }

    .card {
      background: var(--color-surface);
      border-radius: 20px;
      border: 1px solid var(--color-border);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      padding: 40px;
    }

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

    .application-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .application-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-text);
    }

    .application-header p {
      margin: 8px 0 0 0;
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .text-primary {
      color: var(--color-primary);
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      margin: 0 0 8px 0;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--color-text);
    }

    .subtitle {
      margin: 0 0 24px 0;
      color: var(--color-text-tertiary);
      font-size: 0.9375rem;
    }

    .divider {
      border: 0;
      border-top: 1px dashed var(--color-border);
      margin: 32px 0;
    }

    /* Profile Preview */
    .profile-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--color-background);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid var(--color-border);
    }

    .profile-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .profile-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .profile-details strong {
      font-size: 1.125rem;
      color: var(--color-text);
    }

    .profile-details span {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
    }

    /* Resume Upload Area */
    .resume-upload-area {
      border: 2px dashed var(--color-border);
      border-radius: 16px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--color-background);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .resume-upload-area:hover:not(.has-file) {
      border-color: var(--color-primary);
      background: rgba(16, 185, 129, 0.05);
    }

    .resume-upload-area.has-file {
      border: 2px solid var(--color-primary);
      background: rgba(16, 185, 129, 0.05);
      cursor: default;
    }

    .upload-icon {
      font-size: 2.5rem;
      color: var(--color-text-tertiary);
      margin-bottom: 12px;
    }

    .document-icon {
      font-size: 3rem;
      color: var(--color-primary);
      margin-bottom: 12px;
    }

    .resume-upload-area h4 {
      margin: 0 0 8px 0;
      font-size: 1.125rem;
      color: var(--color-text);
    }

    .resume-upload-area p {
      margin: 0;
      font-size: 0.9375rem;
      color: var(--color-text-tertiary);
    }

    .success-text {
      color: var(--color-success) !important;
      font-weight: 600;
      margin-top: 8px !important;
    }

    .uploading-state {
      color: var(--color-primary);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mt-2 { margin-top: 8px; }

    .btn-text-danger {
      background: none;
      border: none;
      color: var(--color-error);
      font-weight: 600;
      margin-top: 16px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 8px;
    }

    .btn-text-danger:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    /* Dynamic Questions */
    .question-block {
      margin-bottom: 24px;
      padding: 24px;
      background: rgba(16, 185, 129, 0.03);
      border: 1px solid var(--color-border);
      border-radius: 16px;
    }

    .question-label {
      display: block;
      font-weight: 600;
      font-size: 1.0625rem;
      color: var(--color-text);
      margin-bottom: 12px;
    }

    .required { color: #ef4444; }

    .textarea-medium {
      min-height: 120px;
      resize: vertical;
      line-height: 1.5;
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      font-size: 1rem;
      color: var(--color-text);
      padding: 12px 16px;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      background: var(--color-surface);
      transition: all 0.2s;
    }

    .radio-option:hover {
      border-color: var(--color-primary);
      background: rgba(16, 185, 129, 0.05);
    }

    .radio-option input {
      display: none;
    }

    .radio-custom {
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-text-tertiary);
      border-radius: 50%;
      position: relative;
      transition: all 0.2s;
    }

    .radio-option input:checked + .radio-custom {
      border-color: var(--color-primary);
    }

    .radio-option input:checked + .radio-custom::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      background: var(--color-primary);
      border-radius: 50%;
    }

    .radio-option:has(input:checked) {
      border-color: var(--color-primary);
      background: rgba(16, 185, 129, 0.05);
      box-shadow: 0 0 0 1px var(--color-primary);
    }

    /* Actions */
    .form-actions {
      margin-top: 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .btn-submit {
      width: 100%;
      max-width: 320px;
      background: var(--color-primary);
      color: white;
      border: none;
      padding: 16px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1.125rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.4);
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -8px rgba(16, 185, 129, 0.6);
      background: #059669;
    }

    .btn-submit:disabled {
      background: var(--color-text-tertiary);
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    .spinner-icon {
      animation: spin 1s linear infinite;
      display: inline-block;
    }

    .success-message {
      padding: 16px 24px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--color-success);
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      width: 100%;
      justify-content: center;
      animation: slideIn 0.3s ease-out;
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

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class JobApplicationComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  job: Job | null = null;
  resumeFile: File | null = null;
  resumeFileName: string = '';
  isUploading = false;
  isSubmitting = false;
  successMessage = '';
  answersForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private location: Location,
    private fb: FormBuilder
  ) {
    this.answersForm = this.fb.group({});
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.jobService.getJobById(id).subscribe({
        next: (data) => {
          this.job = data;
          if (this.job.questions && this.job.questions.length > 0) {
            this.job.questions.forEach((q, index) => {
              const controlName = q.id || 'q' + index;
              this.answersForm.addControl(controlName, this.fb.control('', Validators.required));
            });
          }
        },
        error: (err: any) => {
          console.error('Failed to load job', err);
          alert('Failed to load job details.');
          this.goBack();
        }
      });
    }
  }

  firstName() {
    return this.authService.getCurrentUser()?.firstName || 'User';
  }

  lastName() {
    return this.authService.getCurrentUser()?.lastName || '';
  }

  email() {
    return this.authService.getCurrentUser()?.email || 'user@example.com';
  }

  triggerFileInput() {
    if (!this.resumeFile && !this.isUploading) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB limit.');
        return;
      }

      this.resumeFileName = file.name;
      this.resumeFile = file;
    }
  }

  removeResume() {
    this.resumeFile = null;
    this.resumeFileName = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  goBack() {
    this.location.back();
  }

  submitApplication() {
    if (!this.job) return;
    
    if (this.answersForm.invalid) {
      alert('Please answer all required questions before submitting.');
      return;
    }
    
    const candidateId = this.authService.getCurrentUser()?.userId;
    if (!candidateId) {
      alert('You must be logged in to apply.');
      return;
    }

    this.isSubmitting = true;

    const answers = [];
    if (this.job.questions) {
      for (let i = 0; i < this.job.questions.length; i++) {
        const q = this.job.questions[i];
        const controlName = q.id || 'q' + i;
        const answerText = this.answersForm.get(controlName)?.value;
        if (q.id && answerText) {
          answers.push({
            questionId: q.id,
            answerText: answerText
          });
        }
      }
    }

    this.applicationService.submitApplication({
      jobId: this.job.id!,
      candidateId: candidateId,
      answers: answers.length > 0 ? answers : undefined
    }, this.resumeFile || undefined).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Application submitted successfully! Redirecting to Dashboard...';
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Failed to submit application', err);
        alert('Failed to submit application. Please try again.');
      }
    });
  }
}
