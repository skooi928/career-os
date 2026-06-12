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
import { CvPreviewComponent } from './pages/cv-preview/cv-preview.component';
import { JobPostingComponent } from './pages/job-posting/job-posting.component';
import { JobDetailComponent } from './pages/job-detail/job-detail.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { JobApplicationComponent } from './pages/job-application/job-application.component';
import { InsightsComponent } from './pages/insights/insights.component';
import { UpskillingComponent } from './pages/upskilling/upskilling.component';
import { MyLearningComponent } from './pages/upskilling/my-learning/my-learning.component';
import { MyBadgesComponent } from './pages/upskilling/my-badges/my-badges.component';
import { VerificationComponent } from './pages/upskilling/verification/verification.component';
import { OrgDashboardComponent } from './pages/organisation/org-dashboard/org-dashboard.component';
import { OrgCoursesComponent } from './pages/organisation/org-courses/org-courses.component';
import { OrgMembersComponent } from './pages/organisation/org-members/org-members.component';
import { OrgVerificationsComponent } from './pages/organisation/org-verifications/org-verifications.component';
import { OrgPublicComponent } from './pages/organisation/org-public/org-public.component';

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
      { path: 'jobs', component: JobsComponent },
      { path: 'jobs/:id', component: JobDetailComponent },
      { path: 'jobs/:id/apply', component: JobApplicationComponent },
      { path: 'profile', component: ProfileComponent, canActivate: [emailVerificationGuard] },
      { path: 'mock-interview', loadComponent: () => import('./pages/mock-interview/mock-interview.component').then(m => m.MockInterviewComponent) },
      // Add more routes here as you create new pages
      { path: 'resume', component: ResumeBuilderComponent, canActivate: [emailVerificationGuard] },
      // Upskilling
      { path: 'upskilling', component: UpskillingComponent },
      { path: 'upskilling/my-learning', component: MyLearningComponent },
      { path: 'upskilling/my-badges', component: MyBadgesComponent },
      { path: 'upskilling/verification', component: VerificationComponent },
      // Organisation (specific before :id wildcard)
      { path: 'organisation/dashboard', component: OrgDashboardComponent },
      { path: 'organisation/courses', component: OrgCoursesComponent },
      { path: 'organisation/members', component: OrgMembersComponent },
      { path: 'organisation/verifications', component: OrgVerificationsComponent },
      { path: 'organisation/:id', component: OrgPublicComponent },
      { path: 'resume', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'cv-preview', component: CvPreviewComponent, canActivate: [emailVerificationGuard] },
      { path: '**', component: PageNotFoundComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
