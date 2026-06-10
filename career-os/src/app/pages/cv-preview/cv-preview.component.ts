import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CvService } from '../../services/cv.service';

type LoadState = 'loading' | 'ready' | 'error';

// Default blank items for each section
const BLANK_ITEMS: Record<string, any> = {
  experience:     { job_title: '', company: '', start_date: '', end_date: '', is_current: false, description: '' },
  education:      { institution: '', degree: '', field: '', start_date: '', end_date: '', is_current: false, cgpa: '', minor: '' },
  skills:         { name: '', proficiency: 'Intermediate', category: '' },
  projects:       { title: '', description: '', technologies: '', link: '' },
  languages:      { name: '', proficiency: '' },
  awards:         { title: '', issuer: '', year: '', level: '' },
  activities:     { role: '', organization: '', year: '', duration: '', description: '' },
  certifications: { name: '', issuer: '', year: '', expiry: '', credential_id: '' },
  references:     { name: '', title: '', organization: '', email: '', phone: '' },
};

@Component({
  selector: 'app-cv-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cv-preview.component.html',
  styleUrls: ['./cv-preview.component.css']
})
export class CvPreviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private cvService = inject(CvService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  loadState = signal<LoadState>('loading');
  errorMessage = signal('');
  isDownloading = signal(false);
  activeSection = signal('contact');
  previewUrl = signal<SafeResourceUrl | null>(null);
  isRefreshingPreview = signal(false);
  cvData = signal<any>(null);

  readonly SECTION_NAV = [
    { key: 'contact',         label: 'Contact',         icon: '👤' },
    { key: 'summary',         label: 'Summary',         icon: '📝' },
    { key: 'experience',      label: 'Experience',      icon: '💼' },
    { key: 'education',       label: 'Education',       icon: '🎓' },
    { key: 'skills',          label: 'Skills',          icon: '⚡' },
    { key: 'projects',        label: 'Projects',        icon: '🚀' },
    { key: 'languages',       label: 'Languages',       icon: '🌐' },
    { key: 'awards',          label: 'Awards',          icon: '🏆' },
    { key: 'activities',      label: 'Activities',      icon: '🎯' },
    { key: 'certifications',  label: 'Certs',           icon: '📜' },
    { key: 'references',      label: 'References',      icon: '👥' },
  ];

  // Sections that support the add-item button
  readonly LIST_SECTIONS = Object.keys(BLANK_ITEMS);

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.userId) { this.router.navigate(['/login']); return; }
    this.loadCvData(user.userId);
  }

  private loadCvData(userId: string): void {
    this.loadState.set('loading');
    this.cvService.getCvPreview(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Ensure all list fields exist
          this.LIST_SECTIONS.forEach(key => {
            if (!Array.isArray(data[key])) data[key] = [];
          });
          // Ensure sections toggles exist
          if (!data.sections) data.sections = {};
          this.SECTION_NAV.forEach(nav => {
            if (nav.key !== 'contact' && nav.key !== 'summary') {
              if (data.sections[nav.key] === undefined) data.sections[nav.key] = true;
            }
          });
          this.cvData.set(data);
          this.loadState.set('ready');
          this.refreshPreview();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.detail || 'Failed to load CV data.');
          this.loadState.set('error');
        }
      });
  }

  // ── Section navigation ──
  setSection(key: string): void { this.activeSection.set(key); }

  isSectionEnabled(key: string): boolean {
    if (key === 'contact' || key === 'summary') return true;
    return this.cvData()?.sections?.[key] ?? true;
  }

  toggleSection(key: string): void {
    if (key === 'contact') return;
    const data = structuredClone(this.cvData());
    data.sections[key] = !data.sections[key];
    this.cvData.set(data);
    this.schedulePreviewRefresh();
  }

  // ── Field editing ──
  updateField(path: string, value: any): void {
    const data = structuredClone(this.cvData());
    const keys = path.split('.');
    let obj: any = data;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    this.cvData.set(data);
    this.schedulePreviewRefresh();
  }

  updateListItem(section: string, index: number, field: string, value: any): void {
    const data = structuredClone(this.cvData());
    data[section][index][field] = value;
    this.cvData.set(data);
    this.schedulePreviewRefresh();
  }

  // ── Add new blank item ──
  addItem(section: string): void {
    const data = structuredClone(this.cvData());
    if (!Array.isArray(data[section])) data[section] = [];
    data[section].push({ ...BLANK_ITEMS[section] });
    this.cvData.set(data);
    // Scroll editor to bottom after adding
    setTimeout(() => {
      const el = document.querySelector('.editor-content');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  removeListItem(section: string, index: number): void {
    const data = structuredClone(this.cvData());
    data[section].splice(index, 1);
    this.cvData.set(data);
    this.schedulePreviewRefresh();
  }

  // ── Preview refresh ──
  private previewTimer: any = null;

  schedulePreviewRefresh(): void {
    clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(() => this.refreshPreview(), 1000);
  }

  refreshPreview(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.userId || !this.cvData()) return;
    this.isRefreshingPreview.set(true);

    this.cvService.getPreviewHtmlFromData(this.cvData())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (html) => {
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
          this.isRefreshingPreview.set(false);
        },
        error: () => {
          const url = `http://localhost:8000/cv/preview-html/${user.userId}`;
          this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
          this.isRefreshingPreview.set(false);
        }
      });
  }

  // ── Download ──
  downloadPdf(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.userId) return;
    this.isDownloading.set(true);

    this.cvService.generateCv({ user_id: user.userId, cv_data: this.cvData() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${(this.cvData()?.name || 'CV').replace(/\s+/g, '_')}_CV.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.isDownloading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.detail || 'PDF generation failed.');
          this.isDownloading.set(false);
        }
      });
  }

  goBack(): void { this.router.navigate(['/resume']); }

  getSectionData(key: string): any[] {
    return this.cvData()?.[key] ?? [];
  }

  // Collect unique skill categories from current data + allow custom
  getSkillCategories(): string[] {
    const existing = (this.cvData()?.skills ?? [])
      .map((s: any) => s.category)
      .filter((c: any) => c && c.trim());
    return [...new Set<string>(['Technical Skills', 'Soft Skills', 'Tools & Software', 'Languages', ...existing])];
  }

  trackByIndex(index: number): number { return index; }

  ngOnDestroy(): void {
    clearTimeout(this.previewTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }
}