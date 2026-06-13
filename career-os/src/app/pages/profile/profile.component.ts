import { Component, OnInit, signal, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService, Experience, Education, Project, Skill, UserProfileDTO } from '../../services/profile.service';
import { ResumeService } from '../../services/resume.service';
import { CareerAnalysisService } from '../../services/career-analysis.service';
import { BadgeService } from '../../services/badge.service';
import { UserBadge } from '../../types/upskilling.types';
import { JobService, Job } from '../../services/job.service';
import { SavedJobService, SavedJob } from '../../services/saved-job.service';
import { EventService } from '../../services/event.service';
import { HttpClient } from '@angular/common/http';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  role?: string;
}

interface ExpandedSectionsState {
  personal: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
  skills: boolean;
  badges: boolean;
}

type PageState = 'loading' | 'upload' | 'uploading' | 'portfolio';
type ResumeActiveTab = 'roadmap' | 'experience' | 'skills' | 'projects';

interface LoadingStep {
  label: string;
  state: 'waiting' | 'active' | 'done';
}

interface RoadmapItem {
  type: 'edu' | 'work' | 'future';
  year: string;
  title: string;
  subtitle: string;
  tags: string[];
}

interface SkillSuggestion {
  name: string;
  why: string;
  time: string;
  type: string;
}

interface SkillCategory {
  label: string;
  type: string;
  skills: { name: string; proficiency: string }[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  // Unsubscribe subject for cleanup
  private destroy$ = new Subject<void>();

  // Combined tab state
  mainActiveTab = signal<'details' | 'resume' | 'saved' | 'applications' | 'posted_jobs' | 'received_applications'>('details');
  resumeActiveTab = signal<ResumeActiveTab>('roadmap');
  
  // Sync notice minimization state
  isSyncNoticeMinimized = signal(false);
  private syncNoticeTimeoutId: any = null;
  
  // Resume Upload/State Properties
  pageState = signal<PageState>('loading');
  isDragOver = signal(false);
  selectedFile = signal<File | null>(null);
  isDownloading = signal(false);
  isGeneratingRoadmap = signal(false);
  profile = signal<UserProfileDTO | null>(null);
  
  // Roadmap properties
  showRoadmapModal = signal(false);
  targetRoleInput = signal('');
  targetRole = signal('');
  roadmapGenerated = signal(false);
  predictedRoles = signal<string[]>([]);
  roadmapItems = signal<RoadmapItem[]>([]);
  skillsHave = signal<{ name: string; proficiency: string }[]>([]);
  skillSuggestions = signal<SkillSuggestion[]>([]);
  skillCategories = signal<SkillCategory[]>([]);

  loadingSteps = signal<LoadingStep[]>([
    { label: 'Reading PDF',          state: 'waiting' },
    { label: 'Extracting text',      state: 'waiting' },
    { label: 'AI parsing content',   state: 'waiting' },
    { label: 'Saving to profile',    state: 'waiting' },
  ]);

  private readonly SKILL_MAP: Record<string, string> = {
    'python': 'Programming Language', 'java': 'Programming Language',
    'c++': 'Programming Language', 'c#': 'Programming Language',
    'javascript': 'Programming Language', 'typescript': 'Programming Language',
    'html': 'Programming Language', 'css': 'Programming Language',
    'sql': 'Programming Language', 'r': 'Programming Language',
    'php': 'Programming Language', 'swift': 'Programming Language',
    'kotlin': 'Programming Language', 'go': 'Programming Language',
    'react': 'Framework', 'angular': 'Framework', 'vue': 'Framework',
    'next.js': 'Framework', 'django': 'Framework', 'flask': 'Framework',
    'spring': 'Framework', 'node.js': 'Framework', 'tensorflow': 'Framework',
    'pytorch': 'Framework', 'express': 'Framework',
    'anaconda': 'Tool', 'jupyter': 'Tool', 'google colab': 'Tool',
    'visio': 'Tool', 'dev-c++': 'Tool', 'git': 'Tool', 'docker': 'Tool',
    'microsoft office': 'Tool', 'microsoft word': 'Tool', 'microsoft excel': 'Tool',
    'windows': 'Tool', 'linux': 'Tool', 'excel': 'Tool', 'word': 'Tool',
    'sap': 'Tool', 'tableau': 'Tool', 'power bi': 'Tool', 'spss': 'Tool',
    'canva': 'Design', 'adobe illustrator': 'Design', 'figma': 'Design',
    'capcut': 'Design', 'adobe photoshop': 'Design', 'premiere': 'Design',
    'leadership': 'Soft Skill', 'communication': 'Soft Skill', 'teamwork': 'Soft Skill',
    'critical thinking': 'Soft Skill', 'time management': 'Soft Skill',
    'problem solving': 'Soft Skill', 'creativity': 'Soft Skill',
    'digital marketing': 'Soft Skill', 'interpersonal': 'Soft Skill',
    'organizational': 'Soft Skill', 'negotiation': 'Soft Skill',
    'presentation': 'Soft Skill', 'analytical': 'Soft Skill',
  };

  // State management
  isEditingPersonal = signal(false);
  expandedSections = signal<ExpandedSectionsState>({
    personal: true,
    experience: true,
    education: true,
    projects: true,
    skills: true,
    badges: true
  });
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  personalInfo = signal<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    profileImage: ''
  });

  experiences = signal<Experience[]>([]);
  education = signal<Education[]>([]);
  projects = signal<Project[]>([]);
  skills = signal<Skill[]>([]);
  badges = signal<UserBadge[]>([]);

  // Form states for adding new items
  showAddExperience = signal(false);
  showAddEducation = signal(false);
  showAddProject = signal(false);
  showAddSkill = signal(false);

  // Editing states
  editingExperienceId = signal<number | null>(null);
  editingEducationId = signal<number | null>(null);
  editingProjectId = signal<number | null>(null);
  editingSkillId = signal<number | null>(null);

  editExperienceForm = signal<Experience | null>(null);
  editExperienceResponsibilitiesStr = signal<string>('');
  editEducationForm = signal<Education | null>(null);
  editProjectForm = signal<Project | null>(null);
  editProjectTechnologiesStr = signal<string>('');
  editSkillForm = signal<Skill | null>(null);
  editPersonalForm = signal<PersonalInfo | null>(null);

  constructor(
    public authService: AuthService,
    private profileService: ProfileService,
    private badgeService: BadgeService,
    private resumeService: ResumeService,
    private careerAnalysisService: CareerAnalysisService,
    private jobService: JobService,
    private savedJobService: SavedJobService,
    private eventService: EventService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  startSyncNoticeTimer() {
    this.clearSyncNoticeTimer();
    this.isSyncNoticeMinimized.set(false);
    this.syncNoticeTimeoutId = setTimeout(() => {
      this.isSyncNoticeMinimized.set(true);
    }, 5000);
  }

  clearSyncNoticeTimer() {
    if (this.syncNoticeTimeoutId) {
      clearTimeout(this.syncNoticeTimeoutId);
      this.syncNoticeTimeoutId = null;
    }
  }

  expandSyncNotice() {
    this.startSyncNoticeTimer();
  }

  minimizeSyncNotice() {
    this.clearSyncNoticeTimer();
    this.isSyncNoticeMinimized.set(true);
  }

  switchTab(tab: 'details' | 'resume' | 'saved' | 'applications' | 'posted_jobs' | 'received_applications') {
    this.mainActiveTab.set(tab as any);
    if (tab === 'resume') {
      if (this.pageState() === 'portfolio') {
        this.startSyncNoticeTimer();
      }
    } else {
      this.clearSyncNoticeTimer();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams.subscribe(params => {
        if (params['tab'] === 'resume') {
          this.switchTab('resume');
        } else {
          this.switchTab('details');
        }
      });
      this.loadProfileData();
    }
  }

  loadProfileData() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    // Get authenticated user from Supabase via auth service
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage.set('User not authenticated. Please log in again.');
      this.isLoading.set(false);
      return;
    }

    // Ensure we have valid user data
    const firstName = currentUser.firstName || 'User';
    const lastName = currentUser.lastName || '';

    // Update personal info with auth user data first (guarantee display)
    this.personalInfo.set({
      firstName,
      lastName,
      email: currentUser.email || '',
      phone: '',
      location: '',
      bio: '',
      profileImage: '',
      role: currentUser.role || 'candidate'
    });
    
    // Fetch additional profile details from backend
    // JWT interceptor will automatically add the authorization header with Supabase token
    this.profileService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: UserProfileDTO) => {
          // Update only the profile-specific fields
          this.personalInfo.update(current => ({
            ...current,
            firstName: profile.firstName || current.firstName,
            lastName: profile.lastName || current.lastName,
            email: profile.email || current.email,
            phone: profile.phone || '',
            location: profile.location || '',
            bio: profile.bio || '',
            profileImage: profile.profileImageUrl || '',
            role: profile.role || current.role
          }));

          if (profile.experiences)
            this.experiences.set(profile.experiences);
          if (profile.education)
            this.education.set(profile.education);
          if (profile.projects)  
            this.projects.set(profile.projects);
          if (profile.skills)  
            this.skills.set(profile.skills);

          // Resume-builder logic integration
          this.profile.set(profile);
          this.buildSkillCategories(profile);
          const hasData = (profile.experiences?.length ?? 0) > 0 ||
                          (profile.education?.length ?? 0) > 0 ||
                          (profile.skills?.length ?? 0) > 0;
          this.pageState.set(hasData ? 'portfolio' : 'upload');
          if (hasData && this.mainActiveTab() === 'resume') {
            this.startSyncNoticeTimer();
          }

          // Fetch predicted roles from Career Insights
          this.careerAnalysisService.getCareerPredictions()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (predictions) => {
                if (predictions && predictions.length > 0 && predictions[0].predictedRoles) {
                  const roles = predictions[0].predictedRoles.map(r => r.role);
                  this.predictedRoles.set(roles);
                }
              },
              error: (err) => console.error('Failed to fetch predicted roles', err)
            });

          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          this.errorMessage.set('Failed to load additional profile details.');
          this.pageState.set('upload');
          this.isLoading.set(false);
          // Keep the basic user info displayed even if API fails
        }
      });

    // Load badges independently
    this.badgeService.getMyBadges()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: b => this.badges.set(b), error: () => {} });
  }

  toggleSection(section: keyof ExpandedSectionsState) {
    this.expandedSections.update(current => ({
      ...current,
      [section]: !current[section]
    }));
  }

  toggleEditPersonal() {
    if (!this.isEditingPersonal()) {
      this.editPersonalForm.set({ ...this.personalInfo() });
    } else {
      this.editPersonalForm.set(null);
    }
    this.isEditingPersonal.update(v => !v);
  }

  savePersonalInfo() {
    const form = this.editPersonalForm();
    if (!form) return;

    const currentRole = this.personalInfo().role;
    if ((currentRole === 'employer' || currentRole === 'mentor') && form.role === 'candidate') {
      this.errorMessage.set('Employer/Mentor accounts cannot change their role to Candidate.');
      this.isEditingPersonal.set(false);
      this.editPersonalForm.set(null);
      return;
    }

    this.isLoading.set(true);
    const profileDTO = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      location: form.location,
      bio: form.bio,
      profileImageUrl: form.profileImage,
      role: form.role
    };

    this.profileService.updateUserProfile(profileDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.personalInfo.set({ ...form });

          // Update the stored auth user details if role has changed
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && response.role && currentUser.role !== response.role) {
            currentUser.role = response.role;
            localStorage.setItem('user_data', JSON.stringify(currentUser));
          }

          this.profileService.announceProfileUpdate(response);
          this.isLoading.set(false);
          this.isEditingPersonal.set(false);
          this.editPersonalForm.set(null);
          this.errorMessage.set(null);
        },
        error: (err) => {
          console.error('Error saving profile:', err);
          this.errorMessage.set('Failed to save profile. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  // Experience Edit Methods
  editExperience(exp: Experience) {
    this.editingExperienceId.set(exp.id);
    this.editExperienceForm.set({ ...exp });
    this.editExperienceResponsibilitiesStr.set(exp.responsibilities ? exp.responsibilities.join('\n') : '');
  }

  cancelEditExperience() {
    this.editingExperienceId.set(null);
    this.editExperienceForm.set(null);
    this.editExperienceResponsibilitiesStr.set('');
  }

  saveExperienceEdit() {
    const form = this.editExperienceForm();
    if (!form || !form.id) return;
    this.isLoading.set(true);

    form.responsibilities = this.editExperienceResponsibilitiesStr()
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    this.profileService.updateExperience(form.id, form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.experiences.update(exps => exps.map(e => e.id === updated.id ? updated : e));
          this.cancelEditExperience();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error updating experience:', err);
          this.errorMessage.set('Failed to update experience. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  // Education Edit Methods
  editEducation(edu: Education) {
    this.editingEducationId.set(edu.id);
    this.editEducationForm.set({ ...edu });
  }

  cancelEditEducation() {
    this.editingEducationId.set(null);
    this.editEducationForm.set(null);
  }

  saveEducationEdit() {
    const form = this.editEducationForm();
    if (!form || !form.id) return;
    this.isLoading.set(true);

    this.profileService.updateEducation(form.id, form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.education.update(edus => edus.map(e => e.id === updated.id ? updated : e));
          this.cancelEditEducation();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error updating education:', err);
          this.errorMessage.set('Failed to update education. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  // Project Edit Methods
  editProject(proj: Project) {
    this.editingProjectId.set(proj.id);
    this.editProjectForm.set({ ...proj });
    this.editProjectTechnologiesStr.set(proj.technologies ? proj.technologies.join(', ') : '');
  }

  cancelEditProject() {
    this.editingProjectId.set(null);
    this.editProjectForm.set(null);
  }

  saveProjectEdit() {
    const form = this.editProjectForm();
    if (!form || !form.id) return;
    this.isLoading.set(true);

    // Split technologies back to array
    form.technologies = this.editProjectTechnologiesStr().split(',').map(t => t.trim()).filter(t => t.length > 0);

    this.profileService.updateProject(form.id, form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.projects.update(projs => projs.map(p => p.id === updated.id ? updated : p));
          this.cancelEditProject();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error updating project:', err);
          this.errorMessage.set('Failed to update project. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  // Skill Edit Methods
  editSkill(skill: Skill) {
    this.editingSkillId.set(skill.id);
    this.editSkillForm.set({ ...skill });
  }

  cancelEditSkill() {
    this.editingSkillId.set(null);
    this.editSkillForm.set(null);
  }

  saveSkillEdit() {
    const form = this.editSkillForm();
    if (!form || !form.id) return;
    this.isLoading.set(true);

    this.profileService.updateSkill(form.id, form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.skills.update(s => s.map(sk => sk.id === updated.id ? updated : sk));
          this.cancelEditSkill();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error updating skill:', err);
          this.errorMessage.set('Failed to update skill. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  addExperience(formData: any) {
    this.isLoading.set(true);
    const experienceDTO: Experience = {
      id: 0,
      jobTitle: formData.jobTitle,
      company: formData.company,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      current: formData.current === 'true' || formData.current === true,
      description: formData.description,
      responsibilities: formData.responsibilities
        ? formData.responsibilities.split('\n').map((r: string) => r.trim()).filter((r: string) => r.length > 0)
        : []
    };

    this.profileService.addExperience(experienceDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.experiences.update(exp => [...exp, response]);
          this.showAddExperience.set(false);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error adding experience:', err);
          this.errorMessage.set('Failed to add experience. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  deleteExperience(id: number) {
    this.profileService.deleteExperience(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.experiences.update(exp => exp.filter(e => e.id !== id));
        },
        error: (err) => {
          console.error('Error deleting experience:', err);
          this.errorMessage.set('Failed to delete experience. Please try again.');
        }
      });
  }

  addEducation(formData: any) {
    this.isLoading.set(true);
    const educationDTO: Education = {
      id: 0,
      degree: formData.degree,
      institution: formData.institution,
      field: formData.field,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      current: formData.current === 'true' || formData.current === true,
      cgpa: formData.cgpa || undefined,
      grades: formData.grades || undefined,
      minor: formData.minor || undefined
    };

    this.profileService.addEducation(educationDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.education.update(edu => [...edu, response]);
          this.showAddEducation.set(false);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error adding education:', err);
          this.errorMessage.set('Failed to add education. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  deleteEducation(id: number) {
    this.profileService.deleteEducation(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.education.update(edu => edu.filter(e => e.id !== id));
        },
        error: (err) => {
          console.error('Error deleting education:', err);
          this.errorMessage.set('Failed to delete education. Please try again.');
        }
      });
  }

  addProject(formData: any) {
    this.isLoading.set(true);
    const projectDTO: Project = {
      id: 0,
      title: formData.title,
      description: formData.description,
      technologies: formData.technologies.split(',').map((t: string) => t.trim()),
      link: formData.link || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined
    };

    this.profileService.addProject(projectDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.projects.update(proj => [...proj, response]);
          this.showAddProject.set(false);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error adding project:', err);
          this.errorMessage.set('Failed to add project. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  deleteProject(id: number) {
    this.profileService.deleteProject(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.projects.update(proj => proj.filter(p => p.id !== id));
        },
        error: (err) => {
          console.error('Error deleting project:', err);
          this.errorMessage.set('Failed to delete project. Please try again.');
        }
      });
  }

  addSkill(formData: any) {
    this.isLoading.set(true);
    const skillDTO: Skill = {
      id: 0,
      name: formData.name,
      proficiency: formData.proficiency as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
      endorsed: 0
    };

    this.profileService.addSkill(skillDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.skills.update(s => [...s, response]);
          this.showAddSkill.set(false);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error adding skill:', err);
          this.errorMessage.set('Failed to add skill. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  deleteSkill(id: number) {
    this.profileService.deleteSkill(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.skills.update(s => s.filter(skill => skill.id !== id));
        },
        error: (err) => {
          console.error('Error deleting skill:', err);
          this.errorMessage.set('Failed to delete skill. Please try again.');
        }
      });
  }

  getProficiencyColor(proficiency: string): string {
    switch (proficiency) {
      case 'Beginner': return '#fbbf24';
      case 'Intermediate': return '#60a5fa';
      case 'Advanced': return '#34d399';
      case 'Expert': return '#10b981';
      default: return '#6b7280';
    }
  }

  getProficiencyLevel(proficiency: string): string {
    switch (proficiency) {
      case 'Beginner': return '25%';
      case 'Intermediate': return '50%';
      case 'Advanced': return '75%';
      case 'Expert': return '100%';
      default: return '0%';
    }
  }

  getInitials(firstName: string, lastName: string): string {
    const fn = firstName?.[0] ?? '';
    const ln = lastName?.[0] ?? '';
    const initials = (fn + ln).toUpperCase();
    return initials || '?';
  }

  buildSkillCategories(profile: UserProfileDTO): void {
    const categoryMap: Record<string, { name: string; proficiency: string }[]> = {};
    const ORDER = ['Programming Language', 'Framework', 'Tool', 'Design', 'Soft Skill', 'Other'];

    (profile.skills ?? []).forEach(skill => {
      const key = skill.name.toLowerCase();
      let category = 'Other';
      for (const [pattern, cat] of Object.entries(this.SKILL_MAP)) {
        if (key.includes(pattern)) { category = cat; break; }
      }
      if (!categoryMap[category]) categoryMap[category] = [];
      categoryMap[category].push({ name: skill.name, proficiency: skill.proficiency });
    });

    const categories: SkillCategory[] = ORDER
      .filter(cat => categoryMap[cat]?.length)
      .map(cat => ({ label: cat, type: this.catToType(cat), skills: categoryMap[cat] }));

    Object.keys(categoryMap).filter(c => !ORDER.includes(c)).forEach(cat => {
      categories.push({ label: cat, type: 'other', skills: categoryMap[cat] });
    });

    this.skillCategories.set(categories);
  }

  private catToType(cat: string): string {
    const m: Record<string, string> = {
      'Programming Language': 'programming', 'Framework': 'framework',
      'Tool': 'tool', 'Design': 'design', 'Soft Skill': 'soft', 'Other': 'other'
    };
    return m[cat] ?? 'other';
  }

  // Drag and drop
  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragOver.set(true); }
  onDragLeave(): void { this.isDragOver.set(false); }
  onDrop(e: DragEvent): void {
    e.preventDefault(); this.isDragOver.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }
  onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }
  triggerFileInput(): void { document.getElementById('fileInput')?.click(); }

  private handleFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.pdf')) { this.errorMessage.set('Only PDF files are supported.'); return; }
    if (file.size > 10 * 1024 * 1024) { this.errorMessage.set('File size exceeds 10MB.'); return; }
    this.errorMessage.set('');
    this.selectedFile.set(file);
    this.uploadResume(file);
  }

  private uploadResume(file: File): void {
    const user = this.authService.getCurrentUser();
    if (!user?.userId) return;
    this.pageState.set('uploading');
    this.startLoadingAnimation();
    this.resumeService.uploadResume(file, user.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.completeLoadingSteps();
          setTimeout(() => {
            this.profileService.getUserProfile()
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (profile) => {
                  this.profile.set(profile);
                  this.buildSkillCategories(profile);
                  this.pageState.set('portfolio');
                  if (this.mainActiveTab() === 'resume') {
                    this.startSyncNoticeTimer();
                  }
                  
                  // Also refresh Profile details local state
                  if (profile.experiences) this.experiences.set(profile.experiences);
                  if (profile.education) this.education.set(profile.education);
                  if (profile.projects) this.projects.set(profile.projects);
                  if (profile.skills) this.skills.set(profile.skills);
                },
                error: () => this.pageState.set('portfolio')
              });
          }, 800);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Upload failed. Please try again.');
          this.pageState.set('upload');
        }
      });
  }

  private startLoadingAnimation(): void {
    const steps = this.loadingSteps().map((s, i) => ({
      ...s, state: i === 0 ? 'active' as const : 'waiting' as const
    }));
    this.loadingSteps.set(steps);
    let count = 0;
    const interval = setInterval(() => {
      const current = [...this.loadingSteps()];
      const idx = current.findIndex(s => s.state === 'active');
      if (idx >= 0 && idx < current.length - 1) {
        current[idx].state = 'done'; current[idx + 1].state = 'active';
        this.loadingSteps.set(current);
      }
      if (++count > 10) clearInterval(interval);
    }, 2500);
  }

  private completeLoadingSteps(): void {
    this.loadingSteps.set(this.loadingSteps().map(s => ({ ...s, state: 'done' as const })));
  }

  setResumeTab(tab: ResumeActiveTab): void { this.resumeActiveTab.set(tab); }

  downloadCV(): void {
    this.router.navigate(['/cv-preview']);
  }

  // Roadmap modal
  openRoadmapModal(): void { this.targetRoleInput.set(this.targetRole()); this.showRoadmapModal.set(true); }
  closeRoadmapModal(): void { this.showRoadmapModal.set(false); }
  setExampleRole(role: string): void { this.targetRoleInput.set(role); }

  // Generate roadmap — calls FastAPI LLM endpoint
  generateRoadmap(): void {
    if (!this.targetRoleInput().trim()) return;
    this.targetRole.set(this.targetRoleInput());
    this.showRoadmapModal.set(false);
    this.roadmapGenerated.set(true);
    this.isGeneratingRoadmap.set(true);

    const profile = this.profile();

    // Build timeline from real profile data immediately (no LLM needed)
    const items: RoadmapItem[] = [];
    (profile?.education ?? []).forEach(e => items.push({
      type: 'edu',
      year: `${e.startDate ?? ''} – ${e.current ? 'Present' : (e.endDate ?? '')}`,
      title: e.institution,
      subtitle: `${e.degree} · ${e.field}`,
      tags: [e.field].filter(Boolean)
    }));
    (profile?.experiences ?? []).forEach(e => items.push({
      type: 'work',
      year: `${e.startDate ?? ''} – ${e.current ? 'Present' : (e.endDate ?? '')}`,
      title: e.jobTitle,
      subtitle: e.company ?? 'Company not specified',
      tags: []
    }));
    items.push({
      type: 'future',
      year: 'Target Role',
      title: this.targetRole(),
      subtitle: 'Your career destination — every skill you add gets you closer',
      tags: []
    });
    this.roadmapItems.set(items);

    // Current skills for progression bar
    this.skillsHave.set((profile?.skills ?? []).slice(0, 6).map(s => ({
      name: s.name, proficiency: s.proficiency
    })));

    // Call FastAPI LLM endpoint for personalised suggestions
    this.resumeService.generateRoadmap({
      targetRole: this.targetRole(),
      currentSkills: (profile?.skills ?? []).map(s => s.name),
      education: (profile?.education ?? []).map(e => `${e.degree} in ${e.field} at ${e.institution}`),
      experience: (profile?.experiences ?? []).map(e => `${e.jobTitle} at ${e.company ?? 'unknown'}`),
      bio: profile?.bio ?? ''
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.skillSuggestions.set(response.suggestions ?? []);
        // Update future tags with AI-suggested skill names
        const tags = (response.suggestions ?? []).slice(0, 5).map((s: SkillSuggestion) => s.name);
        const updatedItems = [...this.roadmapItems()];
        const futureIdx = updatedItems.findIndex(i => i.type === 'future');
        if (futureIdx >= 0) updatedItems[futureIdx].tags = tags;
        this.roadmapItems.set(updatedItems);
        this.isGeneratingRoadmap.set(false);
      },
      error: () => {
        // Fallback — show empty suggestions gracefully
        this.skillSuggestions.set([]);
        this.isGeneratingRoadmap.set(false);
      }
    });
  }

  getFullName(): string {
    const p = this.profile();
    return `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim() || 'Your Name';
  }

  getFileSize(file: File): string {
    const kb = file.size / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  }

  retryUpload(): void {
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.roadmapGenerated.set(false);
    this.loadingSteps.set([
      { label: 'Reading PDF', state: 'waiting' },
      { label: 'Extracting text', state: 'waiting' },
      { label: 'AI parsing content', state: 'waiting' },
      { label: 'Saving to profile', state: 'waiting' },
    ]);
    this.pageState.set('upload');
  }

  ngOnDestroy(): void {
    this.clearSyncNoticeTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
