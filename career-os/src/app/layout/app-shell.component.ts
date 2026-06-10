import { Component, HostListener, signal, Inject, PLATFORM_ID, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService, UserProfileDTO } from '../services/profile.service';
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  count?: number;
  queryParams?: Record<string, any>;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ThemeToggleComponent],
  template: `
    <div class="app-layout">
      <!-- Left: Fixed-width sidebar -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed()">
        <!-- Logo row -->
        <div class="sidebar-header">
          <div class="logo-box">
            <i class="ph-fill ph-briefcase"></i>
          </div>
          <span class="brand-text" *ngIf="!isSidebarCollapsed()">CareerOS</span>
        </div>
        
        <!-- Search bar (only when expanded) -->
        <div class="sidebar-search" *ngIf="!isSidebarCollapsed()">
          <i class="ph ph-magnifying-glass search-icon"></i>
          <input type="text" placeholder="Search...">
        </div>
        
        <!-- Navigation items -->
        <nav class="sidebar-nav">
          @for (item of filteredNavItems(); track item.route) {
            <a [routerLink]="item.route" 
               [queryParams]="item.queryParams || {}"
               routerLinkActive="active" 
               class="nav-item">
              <i [class]="'ph ' + item.icon + ' nav-icon'"></i>
              <span class="nav-label" *ngIf="!isSidebarCollapsed()">{{ item.label }}</span>
              <span class="nav-badge" *ngIf="!isSidebarCollapsed() && item.count">{{ item.count }}</span>
            </a>
          }
        </nav>
        
        <!-- User footer (pinned bottom) -->
        <div class="user-footer" *ngIf="!isSidebarCollapsed()">
          <div class="avatar footer-avatar" (click)="toggleProfileMenu($event)">
            @if (profileImageUrl()) {
              <img [src]="profileImageUrl()" alt="Avatar" class="avatar-img">
            } @else {
              {{ userInitials() }}
            }
          </div>
          <div class="user-info" (click)="toggleProfileMenu($event)">
            <span class="username">{{ (userProfile()?.firstName || authService.getCurrentUser()?.firstName) }}</span>
            <span class="email">{{ (userProfile()?.email || authService.getCurrentUser()?.email) }}</span>
          </div>
          <button class="btn-logout" (click)="onSignOut()" title="Sign Out">
            <i class="ph ph-sign-out"></i>
          </button>

          <!-- Dropdown Menu -->
          <div class="dropdown-menu sidebar-dropdown" [class.show]="isProfileMenuOpen()">
            <div class="dropdown-header">
              <span class="dropdown-name">{{ (userProfile()?.firstName || authService.getCurrentUser()?.firstName) }} {{ (userProfile()?.lastName || authService.getCurrentUser()?.lastName) }}</span>
              <span class="dropdown-email">{{ (userProfile()?.email || authService.getCurrentUser()?.email) }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <a routerLink="/profile" class="menu-item" (click)="closeAllMenus()">
              <i class="ph ph-user"></i> Profile
            </a>
            <a routerLink="/profile" class="menu-item" (click)="closeAllMenus()">
              <i class="ph ph-gear"></i> Settings
            </a>
            <div class="dropdown-divider"></div>
            <button class="menu-item btn-menu-logout" (click)="onSignOut()">
              <i class="ph ph-sign-out"></i> Sign Out
            </button>
          </div>
        </div>
        
        <!-- Collapse toggle -->
        <button class="sidebar-collapse-toggle" (click)="toggleSidebar()">
          <i [class]="isSidebarCollapsed() ? 'ph ph-caret-right' : 'ph ph-caret-left'"></i>
        </button>
      </aside>
      
      <!-- Right: Flex column -->
      <div class="main-column">
        <!-- Fixed header on top -->
        <header class="top-header">
          <div class="header-left">
            <h1>{{ activePageTitle() }}</h1>
            <p>Welcome back! Here's what's happening.</p>
          </div>
          
          <div class="header-right">
            <div class="search-bar-header">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" placeholder="Search jobs, companies...">
            </div>
            <button class="btn-bell" routerLink="/notifications">
              <i class="ph ph-bell"></i>
              <span class="notification-dot"></span>
            </button>
            <app-theme-toggle></app-theme-toggle>
            <div class="header-avatar-container">
              <div class="avatar header-avatar" (click)="toggleHeaderMenu($event)">
                @if (profileImageUrl()) {
                  <img [src]="profileImageUrl()" alt="Avatar" class="avatar-img">
                } @else {
                  {{ userInitials() }}
                }
              </div>
              
              <!-- Dropdown Menu -->
              <div class="dropdown-menu header-dropdown" [class.show]="isHeaderMenuOpen()">
                <div class="dropdown-header">
                  <span class="dropdown-name">{{ (userProfile()?.firstName || authService.getCurrentUser()?.firstName) }} {{ (userProfile()?.lastName || authService.getCurrentUser()?.lastName) }}</span>
                  <span class="dropdown-email">{{ (userProfile()?.email || authService.getCurrentUser()?.email) }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <a routerLink="/profile" class="menu-item" (click)="closeAllMenus()">
                  <i class="ph ph-user"></i> Profile
                </a>
                <a routerLink="/profile" class="menu-item" (click)="closeAllMenus()">
                  <i class="ph ph-gear"></i> Settings
                </a>
                <div class="dropdown-divider"></div>
                <button class="menu-item btn-menu-logout" (click)="onSignOut()">
                  <i class="ph ph-sign-out"></i> Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Scrollable main content area -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #059669;
      --sidebar-expanded: 240px;
      --sidebar-collapsed: 64px;
      --sidebar-bg: #0f172a;
      --header-height: 65px;
      --transition: all 0.3s ease-in-out;
    }

    /* Layout Architecture */
    .app-layout {
      display: flex;
      height: 100vh;
      width: 100vw;
      background-color: var(--color-background);
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    /* 1. Sidebar */
    .sidebar {
      width: var(--sidebar-expanded);
      background-color: var(--color-surface);
      display: flex;
      flex-direction: column;
      transition: var(--transition);
      position: relative;
      flex-shrink: 0;
      z-index: 50;
      border-right: 1px solid var(--color-border);
    }

    .sidebar.collapsed {
      width: var(--sidebar-collapsed);
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 10px;
    }

    /* Logo row */
    .sidebar-header {
      height: var(--header-height);
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      border-bottom: 1px solid var(--color-border);
    }

    .logo-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background-color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .brand-text {
      color: var(--color-text);
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
    }

    /* Search bar (Sidebar) */
    .sidebar-search {
      margin: 16px;
      background-color: var(--color-surface-secondary);
      border-radius: 8px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sidebar-search .search-icon {
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    .sidebar-search input {
      background: transparent;
      border: none;
      color: var(--color-text);
      font-size: 14px;
      width: 100%;
      outline: none;
    }

    .sidebar-search input::placeholder {
      color: var(--color-text-secondary);
    }

    /* Navigation items */
    .sidebar-nav {
      flex: 1;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .sidebar-nav::-webkit-scrollbar { display: none; }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-radius: 8px;
      text-decoration: none;
      color: var(--color-text-secondary);
      transition: var(--transition);
      gap: 12px;
    }

    .nav-item:hover {
      background-color: var(--color-hover);
      color: var(--color-text);
    }

    .nav-item.active {
      background-color: var(--color-secondary);
      color: var(--primary);
    }

    .nav-icon {
      font-size: 17px;
      flex-shrink: 0;
    }

    .nav-label {
      font-size: 14px;
      white-space: nowrap;
      flex: 1;
    }

    .nav-badge {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 9999px;
    }

    /* User footer */
    .user-footer {
      border-top: 1px solid var(--color-border);
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: var(--transition);
      position: relative;
    }

    .user-footer:hover {
      background-color: var(--color-hover);
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
      overflow: hidden;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      cursor: pointer;
    }

    .username {
      color: var(--color-text);
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .email {
      color: var(--color-text-secondary);
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-logout {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 15px;
      padding: 4px;
      transition: var(--transition);
    }

    .btn-logout:hover {
      color: var(--color-error);
    }

    .dropdown-menu {
      position: absolute;
      width: 220px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      padding: 6px;
      display: none;
      z-index: 100;
    }

    .dropdown-menu.show { 
      display: block; 
      animation: fadeInDropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeInDropdown {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .sidebar-dropdown {
      bottom: calc(100% + 8px);
      left: 16px;
    }

    .header-avatar-container {
      position: relative;
    }

    .header-dropdown {
      top: calc(100% + 8px);
      right: 0;
      bottom: auto;
      left: auto;
    }

    .dropdown-header {
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .dropdown-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
    }

    .dropdown-email {
      font-size: 12px;
      color: var(--color-text-secondary);
      word-break: break-all;
    }

    .dropdown-divider {
      height: 1px;
      background-color: var(--color-border);
      margin: 6px 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      color: var(--color-text);
      text-decoration: none;
      font-size: 14px;
      transition: all 0.2s ease;
      width: 100%;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
    }

    .menu-item:hover {
      background-color: var(--color-hover);
    }

    .btn-menu-logout {
      color: var(--color-error);
    }

    .btn-menu-logout:hover {
      background-color: rgba(239, 68, 68, 0.08);
      color: var(--color-error);
    }

    /* Collapse toggle */
    .sidebar-collapse-toggle {
      position: absolute;
      top: 24px;
      right: -12px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer;
      z-index: 60;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: var(--transition);
    }

    /* 2. Top Header Bar */
    .main-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .top-header {
      height: var(--header-height);
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
      z-index: 40;
    }

    .header-left h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: var(--color-text);
    }

    .header-left p {
      margin: 2px 0 0 0;
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-bar-header {
      background-color: var(--color-surface-secondary);
      border-radius: 8px;
      padding: 8px 12px;
      width: 224px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .search-bar-header i {
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    .search-bar-header input {
      background: transparent;
      border: none;
      outline: none;
      width: 100%;
      font-size: 14px;
      color: var(--color-text);
    }

    .btn-bell {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--color-text-secondary);
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .btn-bell:hover {
      background-color: var(--color-hover);
    }

    .notification-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 6px;
      height: 6px;
      background-color: var(--primary);
      border-radius: 50%;
    }

    .header-avatar {
      cursor: pointer;
    }

    /* Page Content */
    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
    }
  `]
})
export class AppShellComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = signal(false);
  isProfileMenuOpen = signal(false);
  isHeaderMenuOpen = signal(false);
  userProfile = signal<UserProfileDTO | null>(null);
  profileImageUrl = signal<string | null>(null);
  private destroy$ = new Subject<void>();
  
  navItems = signal<NavItem[]>([
    { label: 'Dashboard', route: '/dashboard', icon: 'ph-house-simple' },
    { label: 'Resume Builder', route: '/profile', queryParams: { tab: 'resume' }, icon: 'ph-file-text' },
    { label: 'Job Application', route: '/jobs', icon: 'ph-briefcase' },
    { label: 'Post a Job', route: '/job-posting', icon: 'ph-plus-circle' },
    { label: 'Sharing Forum', route: '/forum', icon: 'ph-chat-teardrop' },
    { label: 'Upskilling Courses', route: '/courses', icon: 'ph-chalkboard-teacher' },
    { label: 'Analytics', route: '/insights', icon: 'ph-chart-bar' },
  ]);

  userRole = computed(() => {
    return this.userProfile()?.role || this.authService.getCurrentUser()?.role || 'candidate';
  });

  filteredNavItems = computed(() => {
    const role = this.userRole();
    return this.navItems().filter(item => {
      if (item.label === 'Post a Job' && role !== 'employer') {
        return false;
      }
      if (item.label === 'Job Application' && role !== 'candidate') {
        return false;
      }
      return true;
    });
  });

  constructor(
    public authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();

      // Sync user profile name and image when updated in ProfileComponent
      this.profileService.profileUpdated$
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile: UserProfileDTO) => {
            if (profile) {
              this.userProfile.set(profile);
              if (profile.profileImageUrl) {
                this.profileImageUrl.set(profile.profileImageUrl);
              } else {
                this.profileImageUrl.set(null);
              }
            }
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile() {
    const user = this.authService.getCurrentUser();
    if (user && user.userId) {
      this.profileService.getProfile(user.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile: UserProfileDTO) => {
            if (profile) {
              this.userProfile.set(profile);
              if (profile.profileImageUrl) {
                this.profileImageUrl.set(profile.profileImageUrl);
              }
            }
          },
          error: (err: any) => {
            console.error('Error loading profile in navbar:', err);
          }
        });
    }
  }

  activePageTitle() {
    const url = this.router.url;
    if (url.includes('/profile')) {
      return url.includes('tab=resume') ? 'Resume Builder' : 'My Profile';
    }
    const activeRoute = this.filteredNavItems().find(item => url.includes(item.route));
    return activeRoute?.label || 'Overview';
  }

  userInitials() {
    const profile = this.userProfile();
    const user = this.authService.getCurrentUser();
    
    const firstName = profile?.firstName || user?.firstName || 'U';
    const lastName = profile?.lastName || user?.lastName || '';
    
    const fn = firstName?.[0] ?? '';
    const ln = lastName?.[0] ?? '';
    return (fn + ln).toUpperCase() || '?';
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen.update(v => !v);
    this.isHeaderMenuOpen.set(false);
  }

  toggleHeaderMenu(event: Event) {
    event.stopPropagation();
    this.isHeaderMenuOpen.update(v => !v);
    this.isProfileMenuOpen.set(false);
  }

  @HostListener('document:click')
  closeAllMenus() {
    if (this.isProfileMenuOpen()) {
      this.isProfileMenuOpen.set(false);
    }
    if (this.isHeaderMenuOpen()) {
      this.isHeaderMenuOpen.set(false);
    }
  }

  onSignOut() {
    this.closeAllMenus();
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
