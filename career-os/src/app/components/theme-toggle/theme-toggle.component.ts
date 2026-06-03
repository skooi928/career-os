import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="theme-toggle-btn"
      (click)="themeService.toggleTheme()"
      [title]="themeService.theme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
    >
      <i [ngClass]="themeService.theme() === 'light' ? 'ph ph-moon' : 'ph ph-sun'"></i>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: none;
      background-color: var(--color-secondary);
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 18px;
    }

    .theme-toggle-btn:hover {
      background-color: var(--color-hover);
      transform: scale(1.05);
    }

    .theme-toggle-btn:active {
      transform: scale(0.95);
    }

    i {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
