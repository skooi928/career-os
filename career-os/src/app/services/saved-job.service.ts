import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface SavedJob {
  id?: number;
  userId: string;
  jobId: string;
  savedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SavedJobService {
  private readonly API_URL = 'http://localhost:8080/api/saved-jobs';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  saveJob(userId: string, jobId: string): Observable<SavedJob> {
    return this.http.post<SavedJob>(this.API_URL, { userId, jobId }, { headers: this.getHeaders() });
  }

  unsaveJob(userId: string, jobId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${jobId}/user/${userId}`, { headers: this.getHeaders() });
  }

  getSavedJobsForUser(userId: string): Observable<SavedJob[]> {
    return this.http.get<SavedJob[]>(`${this.API_URL}/user/${userId}`, { headers: this.getHeaders() });
  }

  checkSaved(userId: string, jobId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/${jobId}/user/${userId}/check`, { headers: this.getHeaders() });
  }
}
