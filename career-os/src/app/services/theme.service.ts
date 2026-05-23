import { Injectable, effect, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  
  // Track current theme
  private currentTheme = signal<Theme>('light');
  theme = this.currentTheme.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Load theme from localStorage or system preference
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const initialTheme: Theme = savedTheme || (prefersDark ? 'dark' : 'light');
      this.currentTheme.set(initialTheme);
      this.applyTheme(initialTheme);
    }

    // Apply theme changes to DOM
    effect(() => {
      const theme = this.currentTheme();
      if (isPlatformBrowser(this.platformId)) {
        this.applyTheme(theme);
      }
    });
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}
