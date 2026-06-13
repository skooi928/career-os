import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface JobApplicationAnswer {
  id?: string;
  questionId: string;
  answerText: string;
}

export interface JobApplication {
  applicationId?: string;
  jobId: string;
  candidateId: string;
  resumeUrl?: string;
  status?: string;
  answers?: JobApplicationAnswer[];
  /** IDs of UserBadges the candidate attaches to this application. */
  badgeIds?: string[];
  appliedAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly API_URL = 'http://localhost:8080/api/applications';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  submitApplication(application: JobApplication, resumeFile?: File): Observable<JobApplication> {
    const formData = new FormData();
    formData.append('application', new Blob([JSON.stringify(application)], { type: 'application/json' }));
    
    if (resumeFile) {
      formData.append('resume', resumeFile, resumeFile.name);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<JobApplication>(this.API_URL, formData, { headers });
  }

  getApplicationsByCandidate(candidateId: string): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.API_URL}/candidate/${candidateId}`, { headers: this.getHeaders() });
  }
}
