import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-emerald-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Career OS</h1>
            <p class="text-gray-600 text-sm mt-1">Dashboard</p>
          </div>
          <button
            (click)="logout()"
            class="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition duration-200 border border-red-200"
          >
            Logout
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Welcome Card -->
          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Welcome</h3>
            <p class="text-gray-600">
              Hello, <span class="font-semibold text-emerald-600">{{ userName() }}</span>!
            </p>
            <p class="text-gray-500 text-sm mt-2">{{ userEmail() }}</p>
          </div>

          <!-- Account Info -->
          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Account</h3>
            <p class="text-gray-600">Your account is active and verified</p>
            <div class="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <span class="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              <span class="text-emerald-700 text-sm font-medium">Active</span>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <p class="text-gray-600 text-sm mb-4">Manage your profile and settings</p>
            <button class="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition duration-200">
              Edit Profile
            </button>
          </div>
        </div>

        <!-- Features Section -->
        <div class="mt-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Features</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span class="text-emerald-600 text-lg">📱</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Responsive Design</h3>
              <p class="text-gray-600">Works seamlessly on all devices</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span class="text-emerald-600 text-lg">🔒</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Secure</h3>
              <p class="text-gray-600">JWT token-based authentication</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span class="text-emerald-600 text-lg">⚡</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Fast</h3>
              <p class="text-gray-600">Built with modern technologies</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span class="text-emerald-600 text-lg">🗄️</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Database</h3>
              <p class="text-gray-600">Powered by Supabase & PostgreSQL</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  userName() {
    return this.authService.getCurrentUser()?.firstName || 'User';
  }

  userEmail() {
    return this.authService.getCurrentUser()?.email || '';
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
