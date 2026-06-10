import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ProfileService, UserProfileDTO } from '../../services/profile.service';
import { ResumeService } from '../../services/resume.service';
import { CareerAnalysisService } from '../../services/career-analysis.service';

type PageState = 'loading' | 'upload' | 'uploading' | 'portfolio';
type ActiveTab = 'roadmap' | 'experience' | 'skills' | 'projects';

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
  selector: 'app-resume-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-builder.component.html',
  styleUrls: ['./resume-builder.component.css']
})
export class ResumeBuilderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private resumeService = inject(ResumeService);
  private careerAnalysisService = inject(CareerAnalysisService);
  private router = inject(Router);

  // Page state
  pageState = signal<PageState>('loading');
  activeTab = signal<ActiveTab>('roadmap');
  isDragOver = signal(false);
  errorMessage = signal('');
  selectedFile = signal<File | null>(null);
  isDownloading = signal(false);
  isGeneratingRoadmap = signal(false);

  // Profile data
  profile = signal<UserProfileDTO | null>(null);

  // Roadmap
  showRoadmapModal = signal(false);
  targetRoleInput = signal('');
  targetRole = signal('');
  roadmapGenerated = signal(false);
  predictedRoles = signal<string[]>([]);
  roadmapItems = signal<RoadmapItem[]>([]);
  skillsHave = signal<{ name: string; proficiency: string }[]>([]);
  skillSuggestions = signal<SkillSuggestion[]>([]);
  skillCategories = signal<SkillCategory[]>([]);

  // Loading steps
  loadingSteps = signal<LoadingStep[]>([
    { label: 'Reading PDF',          state: 'waiting' },
    { label: 'Extracting text',      state: 'waiting' },
    { label: 'AI parsing content',   state: 'waiting' },
    { label: 'Saving to profile',    state: 'waiting' },
  ]);

  // Skill category inference
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

  ngOnInit(): void {
    this.checkExistingProfile();
  }

  private checkExistingProfile(): void {
    const user = this.authService.getCurrentUser();
    if (!user) { this.router.navigate(['/login']); return; }

    this.profileService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.buildSkillCategories(profile);
          const hasData = (profile.experiences?.length ?? 0) > 0 ||
                          (profile.education?.length ?? 0) > 0 ||
                          (profile.skills?.length ?? 0) > 0;
          this.pageState.set(hasData ? 'portfolio' : 'upload');
          
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
        },
        error: () => this.pageState.set('upload')
      });
  }

  private buildSkillCategories(profile: UserProfileDTO): void {
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

  setTab(tab: ActiveTab): void { this.activeTab.set(tab); }

  // CV Download
  // downloadCV(): void {
  //   const user = this.authService.getCurrentUser();
  //   if (!user?.userId) return;
  //   this.isDownloading.set(true);
  //   this.resumeService.downloadCV(user.userId).subscribe({
  //     next: (blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = `${this.getFullName().replace(/\s+/g, '_')}_CV.pdf`;
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //       this.isDownloading.set(false);
  //     },
  //     error: () => {
  //       alert('CV generation is coming soon! Your profile data is ready.');
  //       this.isDownloading.set(false);
  //     }
  //   });
  // }
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

  // Helpers
  getInitials(): string {
    const p = this.profile();
    return ((p?.firstName?.[0] ?? '') + (p?.lastName?.[0] ?? '')).toUpperCase() || '?';
  }
  getFullName(): string {
    const p = this.profile();
    return `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim() || 'Your Name';
  }
  getFileSize(file: File): string {
    const kb = file.size / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  }
  getProficiencyWidth(p: string): string {
    return ({ 'Beginner': '25%', 'Intermediate': '50%', 'Advanced': '75%', 'Expert': '100%' } as any)[p] ?? '50%';
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

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}