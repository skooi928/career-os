import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LinkedAccountStatus {
  linked: boolean;
  linkedEmail?: string;
  linkedRole?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly API_URL = 'http://localhost:8080/api/settings';

  constructor(private http: HttpClient) {}

  getLinkedAccountStatus(): Observable<LinkedAccountStatus> {
    return this.http.get<LinkedAccountStatus>(`${this.API_URL}/status`);
  }

  linkPersonalAccount(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/link/personal`, credentials);
  }

  unlinkAccount(): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/unlink`, {});
  }
}
