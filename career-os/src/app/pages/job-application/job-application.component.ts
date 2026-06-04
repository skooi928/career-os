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
    <div class="application-content" *ngIf="job; else loading">
        <button class="btn-back" (click)="goBack()">
          <i class="ph ph-arrow-left"></i> Back to Job Details
        </button>

        <!-- Dynamic Header Card -->
        <header class="job-header-card">
          <div class="company-logo">
            {{ job.initials || 'CO' }}
          </div>
          <div class="header-content">
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
        </header>

        <!-- Step 1 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-number">1</div>
            <div class="step-title">
              <h3>Candidate Profile</h3>
              <p>Your verified profile information</p>
            </div>
          </div>
          <div class="profile-preview">
            <div class="profile-avatar">
              {{ firstName()[0] }}{{ lastName()[0] }}
            </div>
            <div class="profile-details">
              <strong>{{ firstName() }} {{ lastName() }}</strong>
              <span><i class="ph ph-envelope-simple"></i> {{ email() }}</span>
            </div>
            <div class="profile-status">
              <span class="status-badge"><i class="ph-fill ph-check-circle"></i> Verified</span>
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-number">2</div>
            <div class="step-title">
              <h3>Resume / CV</h3>
              <p>Upload a recent resume (PDF, max 5MB)</p>
            </div>
          </div>
          <div class="resume-upload-area" [class.has-file]="resumeFile" (click)="triggerFileInput()">
            <input type="file" #fileInput accept="application/pdf" style="display: none" (change)="onFileSelected($event)">
            
            <div class="upload-content" *ngIf="!resumeFile">
              <div class="upload-circle">
                <i class="ph ph-cloud-arrow-up upload-icon"></i>
              </div>
              <h4>Browse files to upload</h4>
              <p>or drag and drop here</p>
              
              <div *ngIf="isUploading" class="uploading-state">
                <i class="ph-bold ph-spinner spinner-icon"></i> Uploading...
              </div>
            </div>
            
            <div class="file-content" *ngIf="resumeFile && !isUploading">
              <div class="file-info">
                <i class="ph-fill ph-file-pdf document-icon"></i>
                <div class="file-details">
                  <h4>{{ resumeFileName }}</h4>
                  <p class="success-text">Attached Successfully</p>
                </div>
              </div>
              <button class="btn-remove" (click)="$event.stopPropagation(); removeResume()">
                <i class="ph ph-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3 (Questions) -->
        <div class="step-card" *ngIf="job.questions && job.questions.length > 0">
          <div class="step-header">
            <div class="step-number">3</div>
            <div class="step-title">
              <h3>Employer Questions</h3>
              <p>Please answer the following required questions</p>
            </div>
          </div>
          
          <form [formGroup]="answersForm" class="questions-form">
            <div *ngFor="let question of job.questions; let i = index" class="question-item">
              <label class="question-label">{{ question.questionText }} <span class="required">*</span></label>
              
              <!-- TEXT Type -->
              <div *ngIf="question.questionType === 'TEXT'" class="input-wrapper">
                <textarea [formControlName]="question.id || 'q' + i" class="form-input custom-textarea" placeholder="Type your answer here..."></textarea>
              </div>

              <!-- MULTIPLE CHOICE Type -->
              <div *ngIf="question.questionType === 'MULTIPLE_CHOICE'" class="options-grid">
                <label *ngFor="let option of question.options; let oIndex = index" class="radio-card">
                  <input type="radio" [formControlName]="question.id || 'q' + i" [value]="option">
                  <div class="radio-content">
                    <span class="radio-custom"></span>
                    <span class="radio-text">{{ option }}</span>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div class="form-actions">
          <div *ngIf="successMessage" class="success-banner">
            <i class="ph-fill ph-check-circle"></i>
            <span>{{ successMessage }}</span>
          </div>
          <button class="btn-submit-app" [disabled]="isSubmitting" (click)="submitApplication()">
            <span class="btn-content" *ngIf="!isSubmitting">
              Submit Application <i class="ph-bold ph-paper-plane-right"></i>
            </span>
            <span class="btn-content" *ngIf="isSubmitting">
              <i class="ph-bold ph-spinner spinner-icon"></i> Processing...
            </span>
          </button>
        </div>

    </div>

    <ng-template #loading>
      <div class="loading-wrapper">
        <div class="modern-spinner"></div>
        <p>Loading application...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .application-content {
      /* Full width consistent with dashboard and job details */
      width: 100%;
    }

    .btn-back {
      background: none;
      border: none;
      color: #64748b;
      font-weight: 500;
      font-size: 0.9375rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      margin-bottom: 24px;
      padding: 0;
      transition: color 0.2s;
    }
    .btn-back:hover {
      color: #0f172a;
    }

    /* Job Header Card */
    .job-header-card {
      background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
      padding: 24px 32px;
      border-radius: 20px;
      color: white;
      box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.4);
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;
    }
    .company-logo {
      width: 56px;
      height: 56px;
      background: #E11D48;
      color: white;
      font-size: 1.5rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      flex-shrink: 0;
    }
    .header-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tags {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .badge-new {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .posted-date {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
    }
    .job-title {
      margin: 0;
      font-size: 2rem;
      font-weight: 800;
      line-height: 1.2;
    }
    .company-meta {
      display: flex;
      gap: 16px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9375rem;
      flex-wrap: wrap;
    }
    .company-meta span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .company-meta i {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.7);
    }

    /* Step Cards */
    .step-card {
      background: #FFFFFF;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
      margin-bottom: 24px;
      border: 1px solid rgba(0,0,0,0.03);
    }
    .step-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .step-number {
      width: 40px;
      height: 40px;
      background: #ECFDF5;
      color: var(--color-primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.125rem;
    }
    .step-title h3 {
      margin: 0 0 4px 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }
    .step-title p {
      margin: 0;
      font-size: 0.875rem;
      color: #64748b;
    }

    /* Profile Preview */
    .profile-preview {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #F8FAFC;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid #E2E8F0;
    }
    .profile-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .profile-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .profile-details strong {
      font-size: 1.125rem;
      color: #0f172a;
    }
    .profile-details span {
      font-size: 0.9375rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ECFDF5;
      color: var(--color-primary);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    /* Resume Upload Area */
    .resume-upload-area {
      border: 2px dashed #CBD5E1;
      border-radius: 20px;
      padding: 48px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: #F8FAFC;
    }
    .resume-upload-area:hover:not(.has-file) {
      border-color: var(--color-primary);
      background: #ECFDF5;
    }
    .resume-upload-area.has-file {
      border: 2px solid var(--color-primary);
      background: #ECFDF5;
      padding: 24px;
      cursor: default;
    }
    .upload-circle {
      width: 64px;
      height: 64px;
      background: #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .upload-icon {
      font-size: 1.75rem;
      color: var(--color-primary);
    }
    .upload-content h4 {
      margin: 0 0 8px 0;
      font-size: 1.125rem;
      color: #0f172a;
    }
    .upload-content p {
      margin: 0;
      font-size: 0.9375rem;
      color: #64748b;
    }
    .file-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .file-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .document-icon {
      font-size: 2.5rem;
      color: var(--color-primary);
    }
    .file-details h4 {
      margin: 0 0 4px 0;
      font-size: 1.0625rem;
      color: #0f172a;
      text-align: left;
    }
    .success-text {
      color: var(--color-primary) !important;
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0;
      text-align: left;
    }
    .btn-remove {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      color: #EF4444;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-remove:hover {
      background: #FEF2F2;
      border-color: #FECACA;
    }

    /* Questions Form */
    .question-item {
      margin-bottom: 32px;
    }
    .question-item:last-child {
      margin-bottom: 0;
    }
    .question-label {
      display: block;
      font-weight: 600;
      font-size: 1.0625rem;
      color: #0f172a;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .required { color: #EF4444; }
    
    .custom-textarea {
      width: 100%;
      min-height: 120px;
      padding: 16px;
      border-radius: 16px;
      border: 1px solid #CBD5E1;
      background: #F8FAFC;
      font-family: inherit;
      font-size: 1rem;
      color: #0f172a;
      transition: all 0.2s;
      resize: vertical;
    }
    .custom-textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      background: #FFFFFF;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
    }

    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .radio-card {
      display: block;
      cursor: pointer;
    }
    .radio-card input {
      display: none;
    }
    .radio-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-radius: 16px;
      border: 1px solid #CBD5E1;
      background: #F8FAFC;
      transition: all 0.2s;
    }
    .radio-card:hover .radio-content {
      border-color: #94A3B8;
      background: #FFFFFF;
    }
    .radio-custom {
      width: 24px;
      height: 24px;
      border: 2px solid #94A3B8;
      border-radius: 50%;
      position: relative;
      transition: all 0.2s;
    }
    .radio-card input:checked + .radio-content {
      border-color: var(--color-primary);
      background: #ECFDF5;
    }
    .radio-card input:checked + .radio-content .radio-custom {
      border-color: var(--color-primary);
    }
    .radio-card input:checked + .radio-content .radio-custom::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      background: var(--color-primary);
      border-radius: 50%;
    }
    .radio-text {
      font-size: 1rem;
      color: #0f172a;
      font-weight: 500;
    }

    /* Actions */
    .form-actions {
      margin-top: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .success-banner {
      background: #ECFDF5;
      color: var(--color-primary);
      padding: 16px 24px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-weight: 600;
      font-size: 1.0625rem;
      animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
    }
    .success-banner i {
      font-size: 1.5rem;
    }
    .btn-submit-app {
      background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
      color: white;
      border: none;
      padding: 14px 40px;
      min-width: 250px;
      border-radius: 16px;
      font-size: 1.125rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 20px -10px rgba(16, 185, 129, 0.5);
    }
    .btn-submit-app:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -10px rgba(16, 185, 129, 0.6);
    }
    .btn-submit-app:disabled {
      background: #CBD5E1;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }
    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    
    /* Loading */
    .loading-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      color: #64748b;
    }
    .modern-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #ECFDF5;
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes slideDown {
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

  formatDate(dateString?: string): string {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
