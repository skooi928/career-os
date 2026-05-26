import { Component, HostListener, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ThemeToggleComponent],
  template: `
    <div class="app-shell">
      <!-- Top Navbar (Full Width) -->
      <header class="navbar">
        <div class="navbar-left">
          <div class="logo-brand">
            <div class="logo-img">
              <i class="ph ph-lightning"></i>
            </div>
            <span class="logo-name">Career<span class="accent">OS</span></span>
          </div>
          <div class="divider"></div>
          <h2 class="page-title">{{ activePageTitle() }}</h2>
        </div>

        <div class="navbar-right">
          <app-theme-toggle></app-theme-toggle>
          <div class="user-profile-container">
            <button class="profile-trigger" (click)="toggleProfileMenu($event)">
              <div class="avatar">
                {{ userInitials() }}
              </div>
              <span class="username">{{ authService.getCurrentUser()?.firstName }}</span>
              <i class="ph-caret-down text-xs"></i>
            </button>

            <!-- Dropdown Menu -->
            <div class="dropdown-menu" [class.show]="isProfileMenuOpen()">
              <div class="menu-header">
                <p class="name">{{ authService.getCurrentUser()?.firstName }} {{ authService.getCurrentUser()?.lastName }}</p>
                <p class="email">{{ authService.getCurrentUser()?.email }}</p>
              </div>
              <hr>
              <a routerLink="/profile" class="menu-item">
                <i class="ph-user"></i> User Profile
              </a>
              <a routerLink="/settings" class="menu-item">
                <i class="ph-gear-six"></i> Settings
              </a>
              <button (click)="onSignOut()" class="menu-item logout">
                <i class="ph-sign-out"></i> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="main-container">
        <!-- Persistent Sidebar -->
        <aside class="sidebar" [class.collapsed]="isSidebarCollapsed()">
          <nav class="sidebar-nav">
            @for (item of navItems(); track item.route) {
              <a [routerLink]="item.route" 
                 routerLinkActive="active" 
                 class="nav-item group">
                <span class="icon-box">
                  <i [class]="item.icon"></i>
                </span>
                <span class="label">{{ item.label }}</span>
                <div class="active-indicator"></div>
              </a>
            }
          </nav>

          <!-- Always Visible Collapse Button on Right Edge -->
          <button class="sidebar-collapse-toggle" (click)="toggleSidebar()" title="Toggle Sidebar">
            <i class="ph ph-caret-left"></i>
          </button>
        </aside>

        <!-- Floating Toggle Button (visible only when collapsed) -->
        <button class="floating-expand-btn" 
                [class.visible]="isSidebarCollapsed()" 
                (click)="toggleSidebar()"
                title="Expand Sidebar">
          <i class="ph ph-list"></i>
        </button>

        <!-- Page Content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #10b981;
      --primary-dark: #059669;
      --sidebar-width: 260px;
      --sidebar-collapsed: 0px;
      --navbar-height: 60px;
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .app-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      background-color: var(--color-background);
      color: var(--color-text);
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    /* Navbar Styling */
    .navbar {
      height: var(--navbar-height);
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
      flex-shrink: 0;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: var(--transition);
    }

    .logo-brand:hover {
      transform: scale(1.02);
    }

    .logo-img {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .logo-name {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--color-text);
      white-space: nowrap;
    }

    .accent { color: var(--primary); }

    .divider {
      width: 1px;
      height: 24px;
      background-color: var(--color-border);
    }

    .page-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
    }

    /* Main Container (Sidebar + Content) */
    .main-container {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    /* Sidebar Styling */
    .sidebar {
      width: var(--sidebar-width);
      background-color: var(--color-surface-secondary);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      transition: var(--transition);
      flex-shrink: 0;
      overflow: hidden;
      min-width: 0;
      position: relative;
    }

    .sidebar.collapsed {
      width: 0;
      border-right: none;
    }

    .sidebar-nav {
      flex: 1;
      padding: 24px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: var(--sidebar-width);
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 12px;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: var(--transition);
      position: relative;
    }

    .nav-item:hover {
      background-color: var(--color-hover);
      color: var(--color-text);
    }

    .nav-item.active {
      background-color: var(--color-secondary);
      color: var(--color-primary);
    }

    .icon-box {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .label {
      margin-left: 12px;
      font-weight: 500;
      transition: opacity 0.2s;
      white-space: nowrap;
    }

    .active-indicator {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 0;
      background-color: var(--color-primary);
      border-radius: 0 4px 4px 0;
      transition: var(--transition);
    }

    .nav-item.active .active-indicator {
      height: 20px;
    }

    /* Profile Menu */
    .user-profile-container { position: relative; }

    .profile-trigger {
      display: flex;
      align-items: center;
      gap: 12px;
      background: none;
      border: none;
      color: var(--color-text);
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 50px;
      transition: var(--transition);
    }

    .profile-trigger:hover { background-color: var(--color-hover); }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }

    .username { font-weight: 500; font-size: 0.875rem; }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 220px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      padding: 8px;
      display: none;
      z-index: 110;
    }

    .dropdown-menu.show { display: block; }

    .menu-header { padding: 12px; }
    .menu-header .name { font-weight: 600; margin: 0; font-size: 0.9375rem; color: var(--color-text); }
    .menu-header .email { font-size: 0.75rem; color: var(--color-text-secondary); margin: 4px 0 0 0; }

    hr { border: 0; border-top: 1px solid var(--color-border); margin: 4px 0; }

    .menu-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      border-radius: 8px; color: var(--color-text); text-decoration: none;
      font-size: 0.875rem; width: 100%; text-align: left; background: none;
      border: none; cursor: pointer; transition: var(--transition);
    }

    .menu-item:hover { background-color: var(--color-hover); }
    .menu-item i { font-size: 1.125rem; color: var(--color-text-secondary); }
    .menu-item.logout { color: var(--color-error); }
    .menu-item.logout i { color: var(--color-error); }

    /* Page Content */
    .page-content {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
      background-color: var(--color-background);
    }

    /* Sidebar Collapse Toggle Button (Always Visible) */
    .sidebar-collapse-toggle {
      position: absolute;
      right: -20px;
      bottom: 24px;
      width: 40px;
      height: 40px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      cursor: pointer;
      transition: var(--transition);
      z-index: 95;
    }

    .sidebar-collapse-toggle:hover {
      background-color: var(--color-hover);
    }

    .sidebar.collapsed .sidebar-collapse-toggle {
      transform: rotateZ(180deg);
    }

    /* Floating Expand Button */
    .floating-expand-btn {
      position: fixed;
      bottom: 24px;
      left: 24px;
      width: 48px;
      height: 48px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      cursor: pointer;
      z-index: 100;
      opacity: 0;
      visibility: hidden;
      transform: scale(0.8);
      transition: var(--transition);
      box-shadow: var(--shadow-lg);
    }

    .floating-expand-btn.visible {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
    }

    .floating-expand-btn:hover {
      background-color: var(--color-primary);
      color: white;
      transform: scale(1.1);
    }

    @media (max-width: 768px) {
      .sidebar { position: fixed; left: -100%; height: 100%; z-index: 90; }
      .sidebar.open { left: 0; }
    }
  `]
})
export class AppShellComponent {
  isSidebarCollapsed = signal(false);
  isProfileMenuOpen = signal(false);
  
  navItems = signal<NavItem[]>([
    { label: 'Dashboard', route: '/dashboard', icon: 'ph-house-simple' },
    { label: 'Resume Builder', route: '/resume', icon: 'ph-file-text' },
    { label: 'Job Application', route: '/jobs', icon: 'ph-briefcase' },
    { label: 'Sharing Forum', route: '/forum', icon: 'ph-chat-teardrop' },
    { label: 'Upskilling Courses', route: '/courses', icon: 'ph-chalkboard-teacher' },
    { label: 'Analytics', route: '/insights', icon: 'ph-chart-bar' },
  ]);

  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  activePageTitle() {
    const activeRoute = this.navItems().find(item => this.router.url.includes(item.route));
    return activeRoute?.label || 'Overview';
  }

  userInitials() {
    const user = this.authService.getCurrentUser();
    if (!user) return '?';
    const firstName = user.firstName?.[0] ?? 'U';
    const lastName = user.lastName?.[0] ?? '';
    return `${firstName}${lastName}`.toUpperCase();
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen.update(v => !v);
  }

  @HostListener('document:click')
  closeProfileMenu() {
    if (this.isProfileMenuOpen()) {
      this.isProfileMenuOpen.set(false);
    }
  }

  onSignOut() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.router.navigate(['/login']);
      }
    });
  }
}
