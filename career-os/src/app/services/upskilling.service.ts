import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Course, CourseEnrollment, CreateCourseRequest, UpdateProgressRequest,
  UpdateProgressResponse, LearnerStats, JobRequiredBadge, CandidateMatchResponse
} from '../types/upskilling.types';

@Injectable({ providedIn: 'root' })
export class UpskillingService {
  private base = 'http://localhost:8080/api/upskilling';
  private badgeBase = 'http://localhost:8080/api/badges';

  /** Shared enrollment cache — updated by enroll(), drop(), updateProgress(). */
  readonly enrollments = signal<CourseEnrollment[]>([]);
  private _enrollmentsLoaded = false;

  constructor(private http: HttpClient) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  getPublishedCourses(category?: string, difficulty?: string): Observable<Course[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (difficulty) params = params.set('difficulty', difficulty);
    return this.http.get<Course[]>(`${this.base}/courses`, { params });
  }

  getCourseById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.base}/courses/${id}`);
  }

  // ── Learner ──────────────────────────────────────────────────────────────────

  enrollInCourse(req: { courseId: string }): Observable<CourseEnrollment> {
    return this.http.post<CourseEnrollment>(`${this.base}/enroll`, req).pipe(
      tap(enrollment => {
        // Optimistically add to shared cache so My Learning updates instantly
        this.enrollments.update(list => [...list, enrollment]);
      })
    );
  }

  /** Returns UpdateProgressResponse which includes awardedBadge if course just completed. */
  updateProgress(enrollmentId: string, req: UpdateProgressRequest): Observable<UpdateProgressResponse> {
    return this.http.put<UpdateProgressResponse>(`${this.base}/enrollments/${enrollmentId}/progress`, req);
  }

  dropCourse(enrollmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/enrollments/${enrollmentId}`);
  }

  getMyEnrollments(): Observable<CourseEnrollment[]> {
    return this.http.get<CourseEnrollment[]>(`${this.base}/my-enrollments`);
  }

  /**
   * Fetches enrollments once and caches in shared signal.
   * Subsequent calls are no-ops unless forceRefresh=true.
   */
  loadEnrollments(forceRefresh = false): void {
    if (this._enrollmentsLoaded && !forceRefresh) return;
    this._enrollmentsLoaded = true;
    this.http.get<CourseEnrollment[]>(`${this.base}/my-enrollments`).subscribe({
      next: list => this.enrollments.set(list),
      error: () => {}
    });
  }

  getMyStats(): Observable<LearnerStats> {
    return this.http.get<LearnerStats>(`${this.base}/my-stats`);
  }

  // ── Org course management ────────────────────────────────────────────────────

  /** Public — returns published courses for any org (no membership required). */
  getPublicOrgCourses(orgId: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.base}/public/organisations/${orgId}/courses`);
  }

  getOrgCourses(orgId: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.base}/org/${orgId}/courses`);
  }

  createCourse(orgId: string, req: CreateCourseRequest): Observable<Course> {
    return this.http.post<Course>(`${this.base}/org/${orgId}/courses`, req);
  }

  updateCourse(orgId: string, courseId: string, req: Partial<CreateCourseRequest>): Observable<Course> {
    return this.http.put<Course>(`${this.base}/org/${orgId}/courses/${courseId}`, req);
  }

  deleteCourse(orgId: string, courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/org/${orgId}/courses/${courseId}`);
  }

  publishCourse(orgId: string, courseId: string): Observable<Course> {
    return this.http.post<Course>(`${this.base}/org/${orgId}/courses/${courseId}/publish`, {});
  }

  /** Link (or unlink when badgeId=null) a badge to a course for auto-award on completion. */
  linkBadgeToCourse(orgId: string, courseId: string, badgeId: string | null): Observable<Course> {
    return this.http.put<Course>(`${this.base}/org/${orgId}/courses/${courseId}/badge`, { badgeId });
  }

  getCourseEnrollments(orgId: string, courseId: string): Observable<CourseEnrollment[]> {
    return this.http.get<CourseEnrollment[]>(`${this.base}/org/${orgId}/courses/${courseId}/enrollments`);
  }

  // ── Job badge requirements (recruiter/employer) ───────────────────────────────

  getJobBadgeRequirements(jobId: string): Observable<JobRequiredBadge[]> {
    return this.http.get<JobRequiredBadge[]>(`${this.badgeBase}/jobs/${jobId}/requirements`);
  }

  setJobBadgeRequirements(jobId: string, requirements: Partial<JobRequiredBadge>[]): Observable<JobRequiredBadge[]> {
    return this.http.post<JobRequiredBadge[]>(`${this.badgeBase}/jobs/${jobId}/requirements`, requirements);
  }

  /** Recruiter: get ranked candidate match list for a job. */
  getCandidateMatchesForJob(jobId: string): Observable<CandidateMatchResponse[]> {
    return this.http.get<CandidateMatchResponse[]>(`${this.badgeBase}/jobs/${jobId}/candidate-match`);
  }
}
