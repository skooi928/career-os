import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { AppShellComponent } from './layout/app-shell.component';
import { authGuard } from './guards/auth.guard';
import { emailVerificationGuard } from './guards/email-verification.guard';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback.component';
import { ResumeBuilderComponent } from './pages/resume-builder/resume-builder.component';
import { JobPostingComponent } from './pages/job-posting/job-posting.component';
import { JobDetailComponent } from './pages/job-detail/job-detail.component';
import { JobApplicationComponent } from './pages/job-application/job-application.component';
import { InsightsComponent } from './pages/insights/insights.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'verify-email', component: VerifyEmailComponent, canActivate: [authGuard] },
  { 
    path: '', 
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'insights', component: InsightsComponent },
      { path: 'job-posting', component: JobPostingComponent },
      { path: 'jobs/:id', component: JobDetailComponent },
      { path: 'jobs/:id/apply', component: JobApplicationComponent },
      { path: 'profile', component: ProfileComponent, canActivate: [emailVerificationGuard] },
      // Add more routes here as you create new pages
      { path: 'resume', component: ResumeBuilderComponent, canActivate: [emailVerificationGuard] },
      { path: '**', component: PageNotFoundComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
