import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CvGenerateRequest {
  user_id: string;
  cv_data: any;
}

@Injectable({
  providedIn: 'root'
})
export class CvService {
  private http = inject(HttpClient);

  // FastAPI runs on 8000, Spring Boot on 8080
  // CV endpoints go directly to FastAPI
  private aiUrl = 'http://localhost:8000/cv';

  /**
   * GET /cv/preview/{user_id}
   * Returns full CVData JSON for the editor panel
   */
  getCvPreview(userId: string): Observable<any> {
    return this.http.get(`${this.aiUrl}/preview/${userId}`);
  }

  /**
   * GET /cv/preview-html/{user_id}
   * Returns the rendered HTML string for the iframe preview
   */
  getPreviewHtmlUrl(userId: string): string {
    // Used as iframe src directly — no auth needed since it's localhost
    return `${this.aiUrl}/preview-html/${userId}`;
  }

  /**
   * POST /cv/preview-html-from-data
   * Send edited CV data and get back updated HTML for iframe preview.
   * Falls back to getPreviewHtmlUrl if this endpoint isn't available.
   */
  getPreviewHtmlFromData(cvData: any): Observable<string> {
    return this.http.post(
      `${this.aiUrl}/preview-html-from-data`,
      cvData,
      { responseType: 'text' }
    );
  }

  /**
   * POST /cv/generate
   * Send edited CV data, receive PDF blob for download
   */
  generateCv(request: CvGenerateRequest): Observable<Blob> {
    return this.http.post(
      `${this.aiUrl}/generate`,
      request,
      { responseType: 'blob' }
    );
  }
}