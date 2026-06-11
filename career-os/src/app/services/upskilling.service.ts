import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Course, CourseEnrollment, CreateCourseRequest, UpdateProgressRequest, LearnerStats
} from '../types/upskilling.types';

@Injectable({ providedIn: 'root' })
export class UpskillingService {
  private base = 'http://localhost:8080/api/upskilling';

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
    return this.http.post<CourseEnrollment>(`${this.base}/enroll`, req);
  }

  updateProgress(enrollmentId: string, req: UpdateProgressRequest): Observable<CourseEnrollment> {
    return this.http.put<CourseEnrollment>(`${this.base}/enrollments/${enrollmentId}/progress`, req);
  }

  dropCourse(enrollmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/enrollments/${enrollmentId}`);
  }

  getMyEnrollments(): Observable<CourseEnrollment[]> {
    return this.http.get<CourseEnrollment[]>(`${this.base}/my-enrollments`);
  }

  getMyStats(): Observable<LearnerStats> {
    return this.http.get<LearnerStats>(`${this.base}/my-stats`);
  }

  // ── Org course management ────────────────────────────────────────────────────

  getOrgCourses(orgId: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.base}/organisations/${orgId}/courses`);
  }

  createCourse(orgId: string, req: CreateCourseRequest): Observable<Course> {
    return this.http.post<Course>(`${this.base}/organisations/${orgId}/courses`, req);
  }

  updateCourse(orgId: string, courseId: string, req: Partial<CreateCourseRequest>): Observable<Course> {
    return this.http.put<Course>(`${this.base}/organisations/${orgId}/courses/${courseId}`, req);
  }

  deleteCourse(orgId: string, courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/organisations/${orgId}/courses/${courseId}`);
  }

  publishCourse(orgId: string, courseId: string): Observable<Course> {
    return this.http.post<Course>(`${this.base}/organisations/${orgId}/courses/${courseId}/publish`, {});
  }

  getCourseEnrollments(orgId: string, courseId: string): Observable<CourseEnrollment[]> {
    return this.http.get<CourseEnrollment[]>(`${this.base}/organisations/${orgId}/courses/${courseId}/enrollments`);
  }
}
