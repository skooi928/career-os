import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeService } from '../../../services/badge.service';
import { BadgeCardComponent } from '../../../components/badge-card/badge-card.component';
import { UserBadge } from '../../../types/upskilling.types';

type Filter = 'ALL' | 'VERIFIED' | 'PENDING';

@Component({
  selector: 'app-my-badges',
  standalone: true,
  imports: [CommonModule, BadgeCardComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>My Badges</h1>
          <p>Digital credentials earned from courses and university certificate conversions</p>
        </div>
      </div>

      <div class="stats-row" *ngIf="!isLoading()">
        <div class="stat-chip green">
          <span class="n">{{ verifiedCount() }}</span>
          <span class="l">Verified</span>
        </div>
        <div class="stat-chip yellow">
          <span class="n">{{ pendingCount() }}</span>
          <span class="l">Pending</span>
        </div>
        <div class="stat-chip">
          <span class="n">{{ badges().length }}</span>
          <span class="l">Total</span>
        </div>
      </div>

      <div class="filter-tabs">
        <button [class.active]="filter() === 'ALL'" (click)="filter.set('ALL')">All</button>
        <button [class.active]="filter() === 'VERIFIED'" (click)="filter.set('VERIFIED')">Verified</button>
        <button [class.active]="filter() === 'PENDING'" (click)="filter.set('PENDING')">Pending</button>
      </div>

      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="empty-state" *ngIf="!isLoading() && filteredBadges().length === 0">
        <i class="ph ph-medal"></i>
        <h3>No badges yet</h3>
        <p>Complete courses or submit certificates to earn badges</p>
      </div>

      <div class="badges-grid" *ngIf="!isLoading()">
        <app-badge-card
          *ngFor="let b of filteredBadges()"
          [name]="b.badge?.name || 'Badge'"
          [description]="b.badge?.description"
          [imageUrl]="b.badge?.badgeImageUrl"
          [orgName]="b.badge?.organisation?.name"
          [skillTag]="b.badge?.skillTag"
          [status]="b.verificationStatus"
          [issuedAt]="b.issuedAt">
        </app-badge-card>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; }
    .page-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
    .stats-row { display: flex; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat-chip {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 14px 24px; border-radius: 12px;
      background: var(--color-surface); border: 1px solid var(--color-border);
    }
    .stat-chip .n { font-size: 1.5rem; font-weight: 800; color: var(--color-text); }
    .stat-chip .l { font-size: 0.78rem; color: var(--color-text-secondary); }
    .stat-chip.green .n { color: #10b981; }
    .stat-chip.yellow .n { color: #f59e0b; }
    .filter-tabs { display: flex; gap: 4px; margin-bottom: 24px; }
    .filter-tabs button {
      padding: 8px 18px; border-radius: 8px;
      border: 1px solid var(--color-border);
      background: var(--color-surface); color: var(--color-text-secondary);
      font-size: 0.875rem; font-weight: 500; cursor: pointer;
    }
    .filter-tabs button.active { background: var(--color-primary); color: white; border-color: transparent; font-weight: 700; }
    .badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 8px; color: var(--color-text-tertiary); }
    .empty-state i { font-size: 3rem; }
    .empty-state h3 { font-size: 1rem; font-weight: 700; margin: 0; color: var(--color-text-secondary); }
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) { .page { padding: 20px; } }
  `]
})
export class MyBadgesComponent implements OnInit {
  isLoading = signal(true);
  badges = signal<UserBadge[]>([]);
  filter = signal<Filter>('ALL');

  verifiedCount = computed(() => this.badges().filter(b => b.verificationStatus === 'VERIFIED').length);
  pendingCount = computed(() => this.badges().filter(b => b.verificationStatus === 'PENDING').length);

  filteredBadges = computed(() =>
    this.filter() === 'ALL' ? this.badges()
      : this.badges().filter(b => b.verificationStatus === this.filter())
  );

  constructor(private badgeService: BadgeService) {}

  ngOnInit() {
    this.badgeService.getMyBadges().subscribe({
      next: b => { this.badges.set(b); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }
}
