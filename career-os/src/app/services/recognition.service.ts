import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseRecognitionRequest, SubmitRecognitionRequest, ReviewDecisionRequest } from '../types/upskilling.types';

@Injectable({ providedIn: 'root' })
export class RecognitionService {
  private base = 'http://localhost:8080/api/course-recognition';

  constructor(private http: HttpClient) {}

  submitForRecognition(courseId: string, req: SubmitRecognitionRequest): Observable<CourseRecognitionRequest> {
    return this.http.post<CourseRecognitionRequest>(`${this.base}/courses/${courseId}/submit`, req);
  }

  getOrgSubmissions(orgId: string): Observable<CourseRecognitionRequest[]> {
    return this.http.get<CourseRecognitionRequest[]>(`${this.base}/org/${orgId}/submissions`);
  }

  getIncomingRequests(universityId: string): Observable<CourseRecognitionRequest[]> {
    return this.http.get<CourseRecognitionRequest[]>(`${this.base}/university/${universityId}/requests`);
  }

  reviewRequest(requestId: string, req: ReviewDecisionRequest): Observable<CourseRecognitionRequest> {
    return this.http.patch<CourseRecognitionRequest>(`${this.base}/${requestId}/review`, req);
  }

  getApprovedRecognitions(universityId: string): Observable<CourseRecognitionRequest[]> {
    return this.http.get<CourseRecognitionRequest[]>(`${this.base}/university/${universityId}/approved`);
  }

  getCourseRecognitions(courseId: string): Observable<CourseRecognitionRequest[]> {
    return this.http.get<CourseRecognitionRequest[]>(`${this.base}/courses/${courseId}`);
  }
}
