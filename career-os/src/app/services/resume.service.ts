import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface ResumeUploadResponse {
  message: string;
  data: any;
}

export interface RoadmapRequest {
  targetRole: string;
  currentSkills: string[];
  education: string[];
  experience: string[];
  bio: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/resume`;

  uploadResume(file: File, supabaseUid: string): Observable<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('supabaseUid', supabaseUid);
    return this.http.post<ResumeUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getResume(supabaseUid: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${supabaseUid}`);
  }

  // downloadCV(supabaseUid: string): Observable<Blob> {
  //   return this.http.get(`${this.apiUrl}/download/${supabaseUid}`, {
  //     responseType: 'blob'
  //   });
  // }
  downloadCV(supabaseUid: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/cv/generate-direct/${supabaseUid}`, {
      responseType: 'blob'
    });
  }

  generateRoadmap(request: RoadmapRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/roadmap/generate`, request);
  }
}

