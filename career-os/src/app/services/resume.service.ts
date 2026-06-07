import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:8080/api/resume';

  uploadResume(file: File, supabaseUid: string): Observable<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('supabaseUid', supabaseUid);
    return this.http.post<ResumeUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getResume(supabaseUid: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${supabaseUid}`);
  }

  downloadCV(supabaseUid: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${supabaseUid}`, {
      responseType: 'blob'
    });
  }

  generateRoadmap(request: RoadmapRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/roadmap/generate`, request);
  }
}

