import { Component, OnInit, signal, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProfileService, Experience, Education, Project, Skill, UserProfileDTO } from '../../services/profile.service';
import { Subject } from 'rxjs';
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
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  // Unsubscribe subject for cleanup
  private destroy$ = new Subject<void>();

  // State management
  isEditingPersonal = signal(false);
  expandedSections = signal<ExpandedSectionsState>({
    personal: true,
    experience: true,
    education: true,
    projects: true,
    skills: true
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
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

          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          this.errorMessage.set('Failed to load additional profile details.');
          this.isLoading.set(false);
          // Keep the basic user info displayed even if API fails
        }
      });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
