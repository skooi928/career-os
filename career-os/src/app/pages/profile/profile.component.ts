import { Component, OnInit, signal, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService, Experience, Education, Project, Skill, UserProfileDTO } from '../../services/profile.service';
import { BadgeService } from '../../services/badge.service';
import { UserBadge } from '../../types/upskilling.types';
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

  // State management
  isEditingPersonal = signal(false);
  expandedSection = signal<string | null>(null);
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

  constructor(
    public authService: AuthService,
    private profileService: ProfileService,
    private badgeService: BadgeService,
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
      profileImage: ''
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
            profileImage: profile.profileImageUrl || ''
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

    // Load badges independently
    this.badgeService.getMyBadges()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: b => this.badges.set(b), error: () => {} });
  }

  toggleSection(section: string) {
    this.expandedSection.update(current => (current === section ? null : section));
  }

  toggleEditPersonal() {
    this.isEditingPersonal.update(v => !v);
  }

  savePersonalInfo() {
    this.isLoading.set(true);
    const profileDTO = {
      firstName: this.personalInfo().firstName,
      lastName: this.personalInfo().lastName,
      email: this.personalInfo().email,
      phone: this.personalInfo().phone,
      location: this.personalInfo().location,
      bio: this.personalInfo().bio,
      profileImageUrl: this.personalInfo().profileImage
    };

    this.profileService.updateUserProfile(profileDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.isEditingPersonal.set(false);
          this.errorMessage.set(null);
        },
        error: (err) => {
          console.error('Error saving profile:', err);
          this.errorMessage.set('Failed to save profile. Please try again.');
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
      description: formData.description
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
      current: formData.current === 'true' || formData.current === true
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
