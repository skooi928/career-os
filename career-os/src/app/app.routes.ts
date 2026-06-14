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
import { OrgListComponent } from './pages/organisation/org-list/org-list.component';
import { OrgCoursesComponent } from './pages/organisation/org-courses/org-courses.component';
import { OrgMembersComponent } from './pages/organisation/org-members/org-members.component';
import { OrgVerificationsComponent } from './pages/organisation/org-verifications/org-verifications.component';
import { OrgPublicComponent } from './pages/organisation/org-public/org-public.component';
import { OrgReviewComponent } from './pages/organisation/org-review/org-review.component';
import { AdminOrganisationsComponent } from './pages/admin/admin-organisations/admin-organisations.component';
import { ProjectsBrowseComponent } from './pages/projects/projects-browse.component';
import { OrgProjectsComponent } from './pages/organisation/org-projects/org-projects.component';
import { OrgRecognitionsComponent } from './pages/organisation/org-recognitions/org-recognitions.component';
import { UniversityReviewComponent } from './pages/organisation/university-review/university-review.component';
import { roleGuard } from './guards/role.guard';
import { SettingsComponent } from './pages/settings/settings.component';
import { OrgSurveysComponent } from './pages/organisation/org-surveys/org-surveys.component';
import { EmployeeSurveysComponent } from './pages/surveys/employee-surveys.component';
import { FairPayComponent } from './pages/fair-pay/fair-pay.component';

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
      { path: 'settings', component: SettingsComponent, canActivate: [emailVerificationGuard] },
      { path: 'mock-interview', loadComponent: () => import('./pages/mock-interview/mock-interview.component').then(m => m.MockInterviewComponent) },
      // Add more routes here as you create new pages
      { path: 'resume', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'cv-preview', component: CvPreviewComponent, canActivate: [emailVerificationGuard] },
      { path: 'forum', loadComponent: () => import('./pages/forum/forum.component').then(m => m.ForumComponent) },
      { path: 'posts/:id', loadComponent: () => import('./pages/post-detail/post-detail.component').then(m => m.PostDetailComponent) },
      // Upskilling
      { path: 'upskilling', component: UpskillingComponent },
      { path: 'upskilling/my-learning', component: MyLearningComponent },
      { path: 'upskilling/my-badges', component: MyBadgesComponent },
      { path: 'upskilling/verification', component: VerificationComponent },
      // Organisation (specific before :id wildcard)
      { path: 'organisation', component: OrgListComponent, canActivate: [roleGuard(['candidate', 'employer', 'admin'])] },
      { path: 'organisation/dashboard', component: OrgDashboardComponent, canActivate: [roleGuard(['employer', 'admin'])] },
      { path: 'organisation/courses', component: OrgCoursesComponent, canActivate: [roleGuard(['employer', 'admin'])] },
      { path: 'organisation/members', component: OrgMembersComponent, canActivate: [roleGuard(['employer', 'admin'])] },
      { path: 'organisation/verifications', component: OrgVerificationsComponent, canActivate: [roleGuard(['employer', 'admin'])] },
      { path: 'organisation/projects', component: OrgProjectsComponent, canActivate: [roleGuard(['employer'])] },
      { path: 'organisation/recognitions', component: OrgRecognitionsComponent, canActivate: [roleGuard(['employer'])] },
      { path: 'organisation/university-review', component: UniversityReviewComponent, canActivate: [roleGuard(['employer'])] },
      { path: 'organisation/surveys', component: OrgSurveysComponent, canActivate: [roleGuard(['employer', 'admin'])] },
      { path: 'surveys', component: EmployeeSurveysComponent, canActivate: [roleGuard(['employer', 'mentor', 'admin'])] },
      { path: 'fair-pay', component: FairPayComponent, canActivate: [roleGuard(['employer', 'mentor', 'admin'])] },
      { path: 'organisation/:id/review', component: OrgReviewComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'organisation/:id', component: OrgPublicComponent },
      // Projects marketplace
      { path: 'projects', component: ProjectsBrowseComponent },
      // Admin
      { path: 'admin/organisations', component: AdminOrganisationsComponent, canActivate: [roleGuard(['admin'])] },
      { path: '**', component: PageNotFoundComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
