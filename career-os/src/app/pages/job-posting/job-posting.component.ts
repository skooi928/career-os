import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-posting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="job-posting-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Create a Job Posting</h1>
          <p>Attract the best talent with a detailed and compelling job listing.</p>
        </div>
        <div class="header-icon">
          <i class="ph-fill ph-rocket-launch"></i>
        </div>
      </div>

      <form [formGroup]="jobForm" (ngSubmit)="onSubmit()" class="form-layout">
        
        <!-- Section 1: Basic Information -->
        <div class="form-section card">
          <div class="section-header">
            <div class="icon-box"><i class="ph ph-info"></i></div>
            <div>
              <h3>Basic Information</h3>
              <p class="section-subtitle">The core details of the position and your company.</p>
            </div>
          </div>
          
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Job Title <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="ph ph-briefcase input-icon"></i>
                <input type="text" formControlName="title" placeholder="e.g. Senior Frontend Engineer" class="form-input with-icon">
              </div>
            </div>
            
            <div class="form-group">
              <label>Organization Name <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="ph ph-buildings input-icon"></i>
                <input type="text" formControlName="company" placeholder="e.g. Acme Corp" class="form-input with-icon">
              </div>
            </div>

            <div class="form-group">
              <label>Organization Website <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="ph ph-globe input-icon"></i>
                <input type="url" formControlName="website" placeholder="https://www.acmecorp.com" class="form-input with-icon">
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Location & Role Details -->
        <div class="form-section card">
          <div class="section-header">
            <div class="icon-box"><i class="ph ph-map-pin-line"></i></div>
            <div>
              <h3>Location & Role Type</h3>
              <p class="section-subtitle">Where and how the candidate will work.</p>
            </div>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>State <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="ph ph-map-trifold input-icon"></i>
                <select formControlName="state" class="form-input with-icon" (change)="onStateChange()">
                  <option value="" disabled selected>Select a State</option>
                  <option *ngFor="let state of states" [value]="state">{{ state }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>City <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="ph ph-city input-icon"></i>
                <select formControlName="city" class="form-input with-icon">
                  <option value="" disabled selected>Select a City</option>
                  <option *ngFor="let city of availableCities" [value]="city">{{ city }}</option>
                </select>
              </div>
            </div>

            <div class="form-group full-width">
              <label>Employment Type <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="ph ph-clock input-icon"></i>
                <select formControlName="employmentType" class="form-input with-icon">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Compensation & Timeline -->
        <div class="form-section card">
          <div class="section-header">
            <div class="icon-box"><i class="ph ph-wallet"></i></div>
            <div>
              <h3>Compensation & Timeline</h3>
              <p class="section-subtitle">Salary range, timeline, and availability.</p>
            </div>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Minimum Salary (RM) <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="ph ph-currency-circle-dollar input-icon"></i>
                <input type="number" formControlName="minSalary" placeholder="e.g. 5000" class="form-input with-icon">
              </div>
            </div>

            <div class="form-group">
              <label>Maximum Salary (RM) <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="ph ph-currency-circle-dollar input-icon"></i>
                <input type="number" formControlName="maxSalary" placeholder="e.g. 8000" class="form-input with-icon">
              </div>
            </div>

            <div class="form-group">
              <label>Number of Vacancies <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="ph ph-users input-icon"></i>
                <input type="number" formControlName="vacancies" placeholder="e.g. 1" class="form-input with-icon">
              </div>
            </div>

            <div class="form-group">
              <label>Application Deadline <span class="required">*</span></label>
              <div class="input-wrapper">
                <i class="ph ph-calendar-blank input-icon"></i>
                <input type="date" formControlName="deadline" class="form-input with-icon">
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Role Requirements -->
        <div class="form-section card" formGroupName="roleRequirement">
          <div class="section-header">
            <div class="icon-box"><i class="ph ph-file-text"></i></div>
            <div>
              <h3>Role Requirements <span class="required">*</span></h3>
              <p class="section-subtitle">Define the specifics of the role and the skills needed.</p>
            </div>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Seniority Level <span class="required">*</span></label>
              <div class="input-wrapper">
                <select formControlName="seniorityLevel" class="form-input">
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Lead">Lead / Manager</option>
                </select>
              </div>
            </div>
            
            <div class="form-group full-width">
              <label>Required Experience (Years) <span class="required">*</span></label>
              <div class="input-wrapper">
                <input type="number" formControlName="requiredExperienceYears" placeholder="e.g. 3" class="form-input">
              </div>
            </div>
            
            <div class="form-group full-width">
              <label>Job Description <span class="required">*</span></label>
              <textarea formControlName="jobDescription" placeholder="Describe the role and responsibilities..." class="form-input textarea-large"></textarea>
            </div>
          </div>

          <div class="skills-container" formArrayName="skills">
            <div class="skills-header">
              <label>Required Skills</label>
              <button type="button" class="btn-text add-btn" (click)="addSkill()">
                <i class="ph-bold ph-plus"></i> Add Skill
              </button>
            </div>
            
            <div class="skill-row" *ngFor="let skillCtrl of skillsFormArray.controls; let i = index" [formGroupName]="i">
              <div class="input-wrapper skill-input">
                <i class="ph ph-code input-icon"></i>
                <input type="text" formControlName="skillText" placeholder="e.g. Angular" class="form-input with-icon">
              </div>
              <button type="button" class="btn-icon-danger" (click)="removeSkill(i)" [disabled]="skillsFormArray.length === 1">
                <i class="ph ph-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Section 5: Custom Questions -->
        <div class="form-section card">
          <div class="section-header">
            <div class="icon-box"><i class="ph ph-chat-circle-text"></i></div>
            <div>
              <h3>Custom Questions</h3>
              <p class="section-subtitle">Ask candidates specific questions to filter the best fit.</p>
            </div>
          </div>

          <div formArrayName="questions" class="questions-container">
            <div class="question-row" *ngFor="let qCtrl of questionsFormArray.controls; let qIndex = index" [formGroupName]="qIndex">
              
              <div class="question-header">
                <h4>Question {{ qIndex + 1 }}</h4>
                <button type="button" class="btn-text-danger" (click)="removeQuestion(qIndex)">
                  <i class="ph ph-trash"></i> Remove
                </button>
              </div>

              <div class="form-grid">
                <div class="form-group full-width">
                  <label>Question Text <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <input type="text" formControlName="questionText" placeholder="e.g. Why do you want to work here?" class="form-input">
                  </div>
                </div>

                <div class="form-group full-width">
                  <label>Question Type <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <select formControlName="questionType" class="form-input" (change)="onQuestionTypeChange(qIndex)">
                      <option value="TEXT">Short Answer (Text)</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Options for Multiple Choice -->
              <div class="options-container" *ngIf="qCtrl.get('questionType')?.value === 'MULTIPLE_CHOICE'" formArrayName="options">
                <label>Options <span class="required">*</span></label>
                
                <div class="option-row" *ngFor="let optCtrl of getOptionsFormArray(qIndex).controls; let oIndex = index">
                  <div class="input-wrapper">
                    <i class="ph ph-list-dashes input-icon"></i>
                    <input type="text" [formControlName]="oIndex" placeholder="e.g. Yes" class="form-input with-icon">
                  </div>
                  <button type="button" class="btn-icon-danger small-btn" (click)="removeOption(qIndex, oIndex)" [disabled]="getOptionsFormArray(qIndex).length <= 1">
                    <i class="ph ph-x"></i>
                  </button>
                </div>

                <button type="button" class="btn-text add-btn mt-2" (click)="addOption(qIndex)">
                  <i class="ph-bold ph-plus"></i> Add Option
                </button>
              </div>
            </div>

            <button type="button" class="btn-text add-btn mt-4" (click)="addQuestion()">
              <i class="ph-bold ph-plus"></i> Add Question
            </button>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions-simple">
          <div *ngIf="successMessage" class="success-message">
            <i class="ph-fill ph-check-circle"></i> {{ successMessage }}
          </div>
          <button type="submit" class="btn-primary btn-large" [disabled]="jobForm.invalid">
            <i class="ph-bold ph-paper-plane-right"></i> Publish Job
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .job-posting-container {
      max-width: 860px;
      margin: 0 auto;
      padding-bottom: 60px;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 32px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #047857 100%);
      border-radius: 24px;
      color: white;
      box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.4);
    }

    .header-content h1 {
      margin: 0;
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .header-content p {
      margin: 8px 0 0 0;
      font-size: 1.0625rem;
      opacity: 0.9;
    }

    .header-icon {
      font-size: 5rem;
      opacity: 0.2;
      transform: rotate(15deg);
    }

    @media (max-width: 600px) {
      .page-header {
        flex-direction: column;
        text-align: center;
        padding: 24px;
      }
      .header-icon {
        display: none;
      }
    }

    .form-layout {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      background: var(--color-surface);
      border-radius: 20px;
      padding: 32px;
      border: 1px solid var(--color-border);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: box-shadow 0.3s ease, border-color 0.3s ease;
    }
    
    .form-section:focus-within {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border-color: rgba(16, 185, 129, 0.4);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px dashed var(--color-border);
    }

    .icon-box {
      width: 48px;
      height: 48px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--color-primary);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .section-subtitle {
      margin: 4px 0 0 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .full-width {
        grid-column: 1;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label, .skills-header label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text);
    }
    
    .required {
      color: #ef4444;
      margin-left: 2px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      font-size: 1.25rem;
      color: var(--color-text-tertiary);
      pointer-events: none;
      transition: color 0.2s;
    }

    .form-input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid var(--color-border);
      background: var(--color-input-bg, var(--color-background));
      color: var(--color-text);
      font-family: inherit;
      font-size: 0.9375rem;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .form-input.with-icon {
      padding-left: 44px;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
      background: var(--color-surface);
    }

    .form-input:focus + .input-icon,
    .input-wrapper:focus-within .input-icon {
      color: var(--color-primary);
    }
    
    /* Styling select specifically for dropdown arrows */
    select.form-input {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 14px center;
      background-size: 16px;
      padding-right: 40px;
    }

    .textarea-large {
      min-height: 180px;
      resize: vertical;
      line-height: 1.6;
      padding: 16px;
    }

    /* Skills & Questions */
    .skills-container, .questions-container {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .question-row {
      background: rgba(16, 185, 129, 0.03);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 16px;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .question-header h4 {
      margin: 0;
      color: var(--color-text);
    }

    .btn-text-danger {
      background: none;
      border: none;
      color: #ef4444;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-text-danger:hover {
      text-decoration: underline;
    }

    .options-container {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed var(--color-border);
    }

    .option-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }

    .small-btn {
      width: 36px;
      height: 36px;
      font-size: 1rem;
    }

    .mt-2 { margin-top: 8px; }
    .mt-4 { margin-top: 16px; }

    .skills-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-text {
      background: none;
      border: none;
      color: var(--color-primary);
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .add-btn {
      padding: 6px 12px;
      border-radius: 8px;
      background: rgba(16, 185, 129, 0.1);
    }

    .add-btn:hover {
      background: rgba(16, 185, 129, 0.2);
    }

    .skill-row {
      display: flex;
      align-items: center;
      gap: 16px;
      animation: slideIn 0.3s ease-out;
    }

    .skill-input {
      flex: 1;
    }

    .btn-icon-danger {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-icon-danger:hover:not(:disabled) {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    .btn-icon-danger:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      color: var(--color-text-tertiary);
    }

    /* Actions */
    .form-actions-simple {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
      margin-top: 8px;
    }

    .btn-large {
      padding: 14px 28px;
      font-size: 1.0625rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--color-primary-hover, #059669);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.4);
    }

    .btn-primary:disabled {
      background: var(--color-surface-secondary);
      color: var(--color-text-tertiary);
      cursor: not-allowed;
      border: 1px solid var(--color-border);
    }

    .success-message {
      padding: 12px 20px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--color-success);
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class JobPostingComponent {
  jobForm: FormGroup;
  successMessage = '';
  
  malaysiaData: Record<string, string[]> = {
    'Johor': ['Johor Bahru', 'Batu Pahat', 'Kluang', 'Kulai', 'Muar', 'Segamat'],
    'Kedah': ['Alor Setar', 'Sungai Petani', 'Kulim', 'Langkawi'],
    'Kelantan': ['Kota Bharu', 'Pasir Mas', 'Tumpat'],
    'Melaka': ['Melaka City', 'Ayer Keroh', 'Alor Gajah'],
    'Negeri Sembilan': ['Seremban', 'Port Dickson', 'Nilai'],
    'Pahang': ['Kuantan', 'Temerloh', 'Bentong', 'Cameron Highlands'],
    'Perak': ['Ipoh', 'Taiping', 'Teluk Intan', 'Lumut'],
    'Perlis': ['Kangar', 'Arau'],
    'Penang': ['George Town', 'Butterworth', 'Bukit Mertajam', 'Bayan Lepas'],
    'Sabah': ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu'],
    'Sarawak': ['Kuching', 'Miri', 'Sibu', 'Bintulu'],
    'Selangor': ['Shah Alam', 'Petaling Jaya', 'Subang Jaya', 'Klang', 'Cyberjaya'],
    'Terengganu': ['Kuala Terengganu', 'Kemaman', 'Dungun'],
    'Kuala Lumpur': ['Kuala Lumpur'],
    'Labuan': ['Labuan'],
    'Putrajaya': ['Putrajaya']
  };

  states = Object.keys(this.malaysiaData).sort();
  availableCities: string[] = [];

  constructor(private fb: FormBuilder, private jobService: JobService) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      website: ['https://', [Validators.required, Validators.pattern('https?://.+')]],
      state: ['', Validators.required],
      city: ['', Validators.required],
      employmentType: ['Full-time', Validators.required],
      minSalary: [null, Validators.required],
      maxSalary: [null, Validators.required],
      deadline: ['', Validators.required],
      vacancies: [1, Validators.required],
      roleRequirement: this.fb.group({
        seniorityLevel: ['Mid', Validators.required],
        requiredExperienceYears: [1, Validators.required],
        jobDescription: ['', Validators.required],
        skills: this.fb.array([
          this.createSkillForm()
        ])
      }),
      questions: this.fb.array([])
    });
  }

  get skillsFormArray(): FormArray {
    return (this.jobForm.get('roleRequirement') as FormGroup).get('skills') as FormArray;
  }

  createSkillForm(): FormGroup {
    return this.fb.group({
      skillText: ['', Validators.required]
    });
  }

  addSkill() {
    this.skillsFormArray.push(this.createSkillForm());
  }

  removeSkill(index: number) {
    if (this.skillsFormArray.length > 1) {
      this.skillsFormArray.removeAt(index);
    }
  }

  get questionsFormArray(): FormArray {
    return this.jobForm.get('questions') as FormArray;
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      questionText: ['', Validators.required],
      questionType: ['TEXT', Validators.required],
      options: this.fb.array([])
    });
  }

  addQuestion() {
    this.questionsFormArray.push(this.createQuestionForm());
  }

  removeQuestion(index: number) {
    this.questionsFormArray.removeAt(index);
  }

  getOptionsFormArray(questionIndex: number): FormArray {
    return this.questionsFormArray.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number) {
    this.getOptionsFormArray(questionIndex).push(this.fb.control('', Validators.required));
  }

  removeOption(questionIndex: number, optionIndex: number) {
    if (this.getOptionsFormArray(questionIndex).length > 1) {
      this.getOptionsFormArray(questionIndex).removeAt(optionIndex);
    }
  }

  onQuestionTypeChange(questionIndex: number) {
    const qGroup = this.questionsFormArray.at(questionIndex) as FormGroup;
    const type = qGroup.get('questionType')?.value;
    const optionsArray = qGroup.get('options') as FormArray;
    
    if (type === 'MULTIPLE_CHOICE') {
      if (optionsArray.length === 0) {
        optionsArray.push(this.fb.control('', Validators.required));
      }
    } else {
      while(optionsArray.length !== 0) {
        optionsArray.removeAt(0);
      }
    }
  }

  onStateChange() {
    const selectedState = this.jobForm.get('state')?.value;
    this.availableCities = this.malaysiaData[selectedState] || [];
    this.jobForm.patchValue({ city: '' });
  }

  onSubmit() {
    if (this.jobForm.valid) {
      const formValue = this.jobForm.value;
      const initials = formValue.company.substring(0, 2).toUpperCase();
      const fullLocation = `${formValue.city}, ${formValue.state}`;

      this.jobService.addJob({
        title: formValue.title,
        company: formValue.company,
        website: formValue.website,
        initials: initials,
        location: fullLocation,
        employmentType: formValue.employmentType,
        minSalary: formValue.minSalary,
        maxSalary: formValue.maxSalary,
        deadline: formValue.deadline,
        vacancies: formValue.vacancies,
        roleRequirements: [formValue.roleRequirement],
        questions: formValue.questions
      }).subscribe({
        next: () => {
          this.successMessage = 'Job successfully published! Your job posting is now live and ready to attract top talent.';
          
          // Reset form but keep defaults
          this.jobForm.reset({
            website: 'https://',
            employmentType: 'Full-time',
            vacancies: 1,
            state: '',
            city: '',
            roleRequirement: {
              seniorityLevel: 'Mid',
              requiredExperienceYears: 1
            }
          });
          
          // Reset skills array to 1 empty skill
          while (this.skillsFormArray.length !== 0) {
            this.skillsFormArray.removeAt(0);
          }
          this.addSkill();
          
          while (this.questionsFormArray.length !== 0) {
            this.questionsFormArray.removeAt(0);
          }

          this.availableCities = [];

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (err) => {
          console.error('Failed to publish job', err);
          alert('Failed to publish job. Please check your connection or try again later.');
        }
      });
    }
  }
}
