import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CvService } from '../../services/cv.service';

type LoadState = 'loading' | 'ready' | 'error';
type SaveState = 'idle' | 'saving' | 'saved';

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

  // State
  loadState = signal<LoadState>('loading');
  saveState = signal<SaveState>('idle');
  errorMessage = signal('');
  isDownloading = signal(false);
  activeSection = signal('contact');
  previewUrl = signal<SafeResourceUrl | null>(null);
  isRefreshingPreview = signal(false);

  // CV data — editable by user
  cvData = signal<any>(null);

  // Section labels for the sidebar nav
  readonly SECTION_NAV = [
    { key: 'contact',         label: 'Contact Info',     icon: '👤' },
    { key: 'summary',         label: 'Summary',          icon: '📝' },
    { key: 'experience',      label: 'Experience',       icon: '💼' },
    { key: 'education',       label: 'Education',        icon: '🎓' },
    { key: 'skills',          label: 'Skills',           icon: '⚡' },
    { key: 'projects',        label: 'Projects',         icon: '🚀' },
    { key: 'languages',       label: 'Languages',        icon: '🌐' },
    { key: 'awards',          label: 'Awards',           icon: '🏆' },
    { key: 'activities',      label: 'Activities',       icon: '🎯' },
    { key: 'certifications',  label: 'Certifications',   icon: '📜' },
    { key: 'references',      label: 'References',       icon: '👥' },
  ];

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
    return this.cvData()?.sections?.[key] ?? true;
  }

  toggleSection(key: string): void {
    const data = { ...this.cvData() };
    data.sections = { ...data.sections, [key]: !data.sections?.[key] };
    this.cvData.set(data);
    this.schedulePreviewRefresh();
  }

  // ── Field editing ──
  updateField(path: string, value: any): void {
    const data = { ...this.cvData() };
    const keys = path.split('.');
    let obj = data;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...obj[keys[i]] };
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    this.cvData.set(data);
    this.schedulePreviewRefresh();
  }

  updateListItem(section: string, index: number, field: string, value: any): void {
    const data = { ...this.cvData() };
    data[section] = [...data[section]];
    data[section][index] = { ...data[section][index], [field]: value };
    this.cvData.set(data);
    this.schedulePreviewRefresh();
  }

  removeListItem(section: string, index: number): void {
    const data = { ...this.cvData() };
    data[section] = data[section].filter((_: any, i: number) => i !== index);
    this.cvData.set(data);
    this.schedulePreviewRefresh();
  }

  // ── Preview ──
  private previewTimer: any = null;

  schedulePreviewRefresh(): void {
    clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(() => this.refreshPreview(), 1200);
  }

  refreshPreview(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.userId) return;

    this.isRefreshingPreview.set(true);

    // POST current cvData to get updated HTML preview
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
          // Fallback to direct URL preview
          const url = this.cvService.getPreviewHtmlUrl(user.userId);
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

    this.cvService.generateCv({
      user_id: user.userId,
      cv_data: this.cvData()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const name = (this.cvData()?.name || 'CV').replace(/\s+/g, '_');
        a.href = url;
        a.download = `${name}_CV.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'PDF generation failed. Please try again.');
        this.isDownloading.set(false);
      }
    });
  }

  // ── Helpers ──
  goBack(): void { this.router.navigate(['/resume']); }

  getSectionData(key: string): any[] {
    return this.cvData()?.[key] ?? [];
  }

  trackByIndex(index: number): number { return index; }

  ngOnDestroy(): void {
    clearTimeout(this.previewTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }
}