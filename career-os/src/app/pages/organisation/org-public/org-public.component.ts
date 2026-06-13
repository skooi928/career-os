import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrganisationService } from '../../../services/organisation.service';
import { UpskillingService } from '../../../services/upskilling.service';
import { BadgeService } from '../../../services/badge.service';
import { CourseCardComponent } from '../../../components/course-card/course-card.component';
import { StatusPillComponent } from '../../../components/status-pill/status-pill.component';
import { Organisation, Course, Badge } from '../../../types/upskilling.types';

@Component({
  selector: 'app-org-public',
  standalone: true,
  imports: [CommonModule, CourseCardComponent, StatusPillComponent],
  template: `
    <div *ngIf="org(); else loadingTpl">
      <div class="org-hero">
        <div class="org-identity">
          <div class="org-logo" *ngIf="org()!.logoUrl; else logoPlaceholder">
            <img [src]="org()!.logoUrl" [alt]="org()!.name">
          </div>
          <ng-template #logoPlaceholder>
            <div class="logo-ph">{{ org()!.name[0] }}</div>
          </ng-template>
          <div class="org-meta">
            <div class="org-name-row">
              <h1>{{ org()!.name }}</h1>
              <app-status-pill [status]="org()!.type"></app-status-pill>
              <app-status-pill [status]="org()!.verificationStatus"></app-status-pill>
            </div>
            <p class="website" *ngIf="org()!.website"><i class="ph ph-globe"></i>
              <a [href]="org()!.website" target="_blank" rel="noopener noreferrer">{{ org()!.website }}</a>
            </p>
            <p class="desc">{{ org()!.description }}</p>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button [class.active]="tab() === 'courses'" (click)="tab.set('courses')">
          <i class="ph ph-chalkboard-teacher"></i> Courses ({{ courses().length }})
        </button>
      </div>

      <div class="tab-body">
        <div class="empty-tab" *ngIf="courses().length === 0"><i class="ph ph-books"></i><p>No published courses</p></div>
        <div class="courses-grid"><app-course-card *ngFor="let c of courses()" [course]="c" [showEnroll]="false"></app-course-card></div>
      </div>
    </div>
    <ng-template #loadingTpl>
      <div class="loading-full"><div class="spinner"></div></div>
    </ng-template>
  `,
  styles: [`
    .org-hero { background: var(--color-surface); border-bottom: 1px solid var(--color-border); padding: 32px 40px; }
    .org-identity { display: flex; align-items: flex-start; gap: 20px; }
    .org-logo img, .logo-ph { width: 72px; height: 72px; border-radius: 16px; object-fit: contain; flex-shrink: 0; }
    .logo-ph { background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; }
    .org-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 6px; }
    .org-name-row h1 { font-size: 1.5rem; font-weight: 800; color: var(--color-text); margin: 0; }
    .website { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--color-primary); margin: 0 0 8px; }
    .website a { color: inherit; text-decoration: none; }
    .desc { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; max-width: 600px; }
    .tabs { display: flex; gap: 4px; padding: 16px 40px 0; border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
    .tabs button { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border: none; background: transparent; color: var(--color-text-secondary); font-size: 0.875rem; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s; }
    .tabs button.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: 700; }
    .tab-body { padding: 28px 40px; }
    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .empty-tab { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 8px; color: var(--color-text-tertiary); }
    .empty-tab i { font-size: 2.5rem; }
    .loading-full { display: flex; justify-content: center; align-items: center; padding: 80px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) { .org-hero { padding: 20px; } .tabs { padding: 12px 20px 0; } .tab-body { padding: 20px; } }
  `]
})
export class OrgPublicComponent implements OnInit {
  org = signal<Organisation | null>(null);
  courses = signal<Course[]>([]);
  badges = signal<Badge[]>([]);
  tab = signal<'courses' | 'badges'>('courses');

  constructor(private route: ActivatedRoute, private orgService: OrganisationService, private upskillingService: UpskillingService, private badgeService: BadgeService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.orgService.getOrganisationById(id).subscribe({ next: o => this.org.set(o), error: () => {} });
    // Use the global published-courses endpoint and filter by org — avoids needing a member token
    this.upskillingService.getPublishedCourses().subscribe({
      next: all => this.courses.set(all.filter(c => c.organisationId === id)),
      error: () => {}
    });
    this.badgeService.getOrgBadges(id).subscribe({ next: b => this.badges.set(b), error: () => {} });
  }
}
