import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-content">
      <div class="welcome-banner">
        <div class="banner-text">
          <h1>Welcome back, {{ firstName() }}! 👋</h1>
          <p>Here's what's happening with your career journey today.</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon applications">
            <i class="ph ph-briefcase"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Applications</span>
            <span class="stat-value">24</span>
            <span class="stat-change positive">+3 this week</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon interviews">
            <i class="ph ph-calendar"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Interviews</span>
            <span class="stat-value">5</span>
            <span class="stat-change positive">+1 scheduled</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon offers">
            <i class="ph ph-medal"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Offers</span>
            <span class="stat-value">2</span>
            <span class="stat-change">Maintain momentum</span>
          </div>
        </div>
      </div>

      <div class="content-sections">
        <div class="main-section card">
          <div class="card-header">
            <h3>Recent Activity</h3>
            <button class="btn-text">View All</button>
          </div>
          <div class="activity-list">
            <div class="activity-item">
              <div class="dot active"></div>
              <div class="activity-details">
                <p class="activity-title">Interview scheduled with <strong>Google</strong></p>
                <p class="activity-time">2 hours ago</p>
              </div>
            </div>
            <div class="activity-item">
              <div class="dot"></div>
              <div class="activity-details">
                <p class="activity-title">Application sent to <strong>Stripe</strong></p>
                <p class="activity-time">Yesterday</p>
              </div>
            </div>
            <div class="activity-item">
              <div class="dot"></div>
              <div class="activity-details">
                <p class="activity-title">Resume updated: <strong>Frontend Dev v2</strong></p>
                <p class="activity-time">Oct 24, 2025</p>
              </div>
            </div>
          </div>
        </div>

        <div class="side-section card">
          <div class="card-header">
            <h3>Quick Tasks</h3>
          </div>
          <div class="tasks-list">
            <div class="task-item">
              <input type="checkbox" id="t1" checked>
              <label for="t1">Apply to 5 jobs</label>
            </div>
            <div class="task-item">
              <input type="checkbox" id="t2">
              <label for="t2">Follow up with recruiter</label>
            </div>
            <div class="task-item">
              <input type="checkbox" id="t3">
              <label for="t3">Update portfolio</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .welcome-banner {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px;
      border-radius: 24px;
      color: white;
      box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.4);
    }

    .welcome-banner h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .welcome-banner p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: #1e293b;
      padding: 24px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      border-color: rgba(16, 185, 129, 0.2);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-icon.applications { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .stat-icon.interviews { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .stat-icon.offers { background: rgba(168, 85, 247, 0.1); color: #a855f7; }

    .stat-info { display: flex; flex-direction: column; }
    .stat-label { font-size: 0.875rem; color: #94a3b8; font-weight: 500; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: white; margin: 4px 0; }
    .stat-change { font-size: 0.75rem; color: #64748b; }
    .stat-change.positive { color: #10b981; }

    .content-sections {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .content-sections { grid-template-columns: 1fr; }
    }

    .card {
      background: #1e293b;
      border-radius: 20px;
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .card-header h3 { margin: 0; font-size: 1.125rem; font-weight: 600; }
    .btn-text { background: none; border: none; color: #10b981; font-weight: 600; cursor: pointer; }

    .activity-list, .tasks-list { display: flex; flex-direction: column; gap: 16px; }

    .activity-item { display: flex; gap: 16px; align-items: flex-start; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #334155; margin-top: 6px; flex-shrink: 0; }
    .dot.active { background: #10b981; box-shadow: 0 0 10px #10b981; }
    
    .activity-title { margin: 0; font-size: 0.9375rem; color: #e2e8f0; }
    .activity-time { margin: 4px 0 0 0; font-size: 0.8125rem; color: #64748b; }

    .task-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #0f172a;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
    }

    .task-item input { accent-color: #10b981; width: 18px; height: 18px; }
    .task-item label { cursor: pointer; font-size: 0.9375rem; color: #cbd5e1; }
    .task-item input:checked + label { text-decoration: line-through; opacity: 0.4; }
  `]
})
export class DashboardComponent {
  constructor(private authService: AuthService) {}

  firstName() {
    return this.authService.getCurrentUser()?.firstName || 'User';
  }
}
