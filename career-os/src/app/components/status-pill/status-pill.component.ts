import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PillType =
  | 'VERIFIED' | 'APPROVED' | 'COMPLETED'
  | 'PENDING' | 'IN_PROGRESS'
  | 'REJECTED' | 'DROPPED'
  | 'INDUSTRY' | 'UNIVERSITY'
  | 'ORG_ADMIN' | 'HR' | 'MENTOR' | 'REVIEWER' | 'MEMBER';

@Component({
  selector: 'app-status-pill',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="pill" [class]="'pill-' + colorClass">{{ label }}</span>`,
  styles: [`
    .pill {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 999px;
      font-size: 0.72rem; font-weight: 700; white-space: nowrap;
    }
    .pill-green  { background: #d1fae5; color: #065f46; }
    .pill-yellow { background: #fef3c7; color: #92400e; }
    .pill-red    { background: #fee2e2; color: #991b1b; }
    .pill-blue   { background: #dbeafe; color: #1e40af; }
    .pill-purple { background: #ede9fe; color: #5b21b6; }
    .pill-gray   { background: #f3f4f6; color: #6b7280; }
  `]
})
export class StatusPillComponent {
  @Input() status!: PillType;
  @Input() customLabel?: string;

  get label(): string {
    if (this.customLabel) return this.customLabel;
    const map: Partial<Record<PillType, string>> = {
      ORG_ADMIN: 'Admin', IN_PROGRESS: 'In Progress', UNIVERSITY: 'University', INDUSTRY: 'Industry'
    };
    return map[this.status] ?? this.status;
  }

  get colorClass(): string {
    const green  = ['VERIFIED', 'APPROVED', 'COMPLETED'];
    const yellow = ['PENDING', 'IN_PROGRESS'];
    const red    = ['REJECTED', 'DROPPED'];
    const blue   = ['INDUSTRY', 'HR', 'MENTOR', 'MEMBER'];
    const purple = ['UNIVERSITY', 'REVIEWER'];
    const gray   = ['ORG_ADMIN'];
    if (green.includes(this.status))  return 'green';
    if (yellow.includes(this.status)) return 'yellow';
    if (red.includes(this.status))    return 'red';
    if (blue.includes(this.status))   return 'blue';
    if (purple.includes(this.status)) return 'purple';
    return 'gray';
  }
}
