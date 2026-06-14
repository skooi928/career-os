import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IndustryProject, ProjectRequiredBadge, ProjectApplication,
  EligibilityResult, CreateProjectRequest
} from '../types/upskilling.types';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private base = `${environment.apiUrl}/api/industry-projects`;

  constructor(private http: HttpClient) {}

  // Public
  getOpenProjects(): Observable<IndustryProject[]> {
    return this.http.get<IndustryProject[]>(`${this.base}/public`);
  }

  getProject(id: string): Observable<IndustryProject> {
    return this.http.get<IndustryProject>(`${this.base}/${id}`);
  }

  getRequiredBadges(projectId: string): Observable<ProjectRequiredBadge[]> {
    return this.http.get<ProjectRequiredBadge[]>(`${this.base}/${projectId}/required-badges`);
  }

  checkEligibility(projectId: string): Observable<EligibilityResult> {
    return this.http.get<EligibilityResult>(`${this.base}/${projectId}/eligibility`);
  }

  // Org management
  getOrgProjects(orgId: string): Observable<IndustryProject[]> {
    return this.http.get<IndustryProject[]>(`${this.base}/org/${orgId}`);
  }

  createProject(orgId: string, req: CreateProjectRequest): Observable<IndustryProject> {
    return this.http.post<IndustryProject>(`${this.base}/org/${orgId}`, req);
  }

  updateProject(id: string, req: CreateProjectRequest): Observable<IndustryProject> {
    return this.http.put<IndustryProject>(`${this.base}/${id}`, req);
  }

  publishProject(id: string): Observable<IndustryProject> {
    return this.http.post<IndustryProject>(`${this.base}/${id}/publish`, {});
  }

  closeProject(id: string): Observable<IndustryProject> {
    return this.http.post<IndustryProject>(`${this.base}/${id}/close`, {});
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  addRequiredBadge(projectId: string, badgeId: string): Observable<ProjectRequiredBadge> {
    return this.http.post<ProjectRequiredBadge>(`${this.base}/${projectId}/required-badges/${badgeId}`, {});
  }

  removeRequiredBadge(projectId: string, badgeId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${projectId}/required-badges/${badgeId}`);
  }

  // Applications
  applyToProject(projectId: string): Observable<ProjectApplication> {
    return this.http.post<ProjectApplication>(`${this.base}/${projectId}/apply`, {});
  }

  getProjectApplications(projectId: string): Observable<ProjectApplication[]> {
    return this.http.get<ProjectApplication[]>(`${this.base}/${projectId}/applications`);
  }

  getMyApplications(): Observable<ProjectApplication[]> {
    return this.http.get<ProjectApplication[]>(`${this.base}/my/applications`);
  }

  reviewApplication(appId: string, status: string): Observable<ProjectApplication> {
    return this.http.patch<ProjectApplication>(`${this.base}/applications/${appId}/review`, { status });
  }

  withdrawApplication(projectId: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${projectId}/withdraw`, {});
  }
}
