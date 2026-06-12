import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserActivity {
  id: string;
  userId: string;
  type: string;
  title: string;
  createdAt: string;
}

export interface DashboardSummary {
  applicationsCount: number;
  interviewsCount: number;
  offersCount: number;
  recentActivities: UserActivity[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.API_URL}/summary`, { headers: this.getHeaders() });
  }
}
