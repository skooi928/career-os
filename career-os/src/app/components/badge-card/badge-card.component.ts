import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="badge-card" [class]="'border-' + statusColor">
      <div class="badge-img" *ngIf="imageUrl; else iconFb">
        <img [src]="imageUrl" [alt]="name">
      </div>
      <ng-template #iconFb>
        <div class="badge-icon"><i class="ph ph-medal"></i></div>
      </ng-template>
      <div class="badge-body">
        <h4>{{ name }}</h4>
        <p class="desc" *ngIf="description">{{ description }}</p>
        <div class="meta">
          <span class="org" *ngIf="orgName"><i class="ph ph-buildings"></i>{{ orgName }}</span>
          <span class="skill-tag" *ngIf="skillTag">{{ skillTag }}</span>
        </div>
        <div class="footer">
          <span class="status-chip" [class]="'chip-' + statusColor">{{ status }}</span>
          <span class="issued" *ngIf="issuedAt">{{ issuedAt | date:'mediumDate' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-top-width: 4px;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .border-green { border-top-color: #10b981; }
    .border-yellow { border-top-color: #f59e0b; }
    .border-red { border-top-color: #ef4444; }
    .badge-img img { width: 52px; height: 52px; border-radius: 10px; object-fit: contain; }
    .badge-icon {
      width: 52px; height: 52px; border-radius: 10px;
      background: var(--color-secondary);
      display: flex; align-items: center; justify-content: center;
      color: var(--color-primary); font-size: 1.6rem;
    }
    .badge-body { display: flex; flex-direction: column; gap: 4px; }
    .badge-body h4 { font-size: 0.9rem; font-weight: 700; color: var(--color-text); margin: 0; }
    .desc { font-size: 0.78rem; color: var(--color-text-secondary); margin: 0; }
    .meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .org {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.75rem; color: var(--color-text-secondary);
    }
    .skill-tag {
      font-size: 0.7rem; font-weight: 600; padding: 2px 8px;
      border-radius: 999px; background: var(--color-secondary); color: var(--color-primary);
    }
    .footer { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
    .status-chip { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
    .chip-green { background: #d1fae5; color: #065f46; }
    .chip-yellow { background: #fef3c7; color: #92400e; }
    .chip-red { background: #fee2e2; color: #991b1b; }
    .issued { font-size: 0.72rem; color: var(--color-text-tertiary); }
  `]
})
export class BadgeCardComponent {
  @Input() name!: string;
  @Input() description?: string;
  @Input() imageUrl?: string;
  @Input() orgName?: string;
  @Input() skillTag?: string;
  @Input() status: 'VERIFIED' | 'PENDING' | 'REJECTED' = 'PENDING';
  @Input() issuedAt?: string;

  get statusColor() {
    return this.status === 'VERIFIED' ? 'green' : this.status === 'PENDING' ? 'yellow' : 'red';
  }
}
