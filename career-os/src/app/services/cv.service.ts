import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CvGenerateRequest {
  user_id: string;
  cv_data: any;
}

export interface CvSuggestion {
  post_id: number;
  section: string;        // awards, projects, skills, experience, activities, certifications
  action: string;         // add, update
  title: string;          // short label e.g. "Add new award"
  content: string;        // exact text to add
  field: string | null;
  confidence: string;     // high, medium, low
  reason: string;

  description?: string;
  impact?: string;
  
  issuer?: string;
  year?: string;
  level?: string;

  technologies?: string[];
  link?: string;

  proficiency?: string;
  category?: string;

  organization?: string;
  duration?: string;

  company?: string;
  start_date?: string;
  end_date?: string;

  institution?: string;
}
 
export interface AnalysePostsResponse {
  suggestions: CvSuggestion[];
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class CvService {
  private http = inject(HttpClient);

  // FastAPI runs on 8000, Spring Boot on 8080
  // CV endpoints go directly to FastAPI
  private aiUrl = 'http://localhost:8000/cv';
  private springUrl = 'http://localhost:8080/api/forum';

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

  // ── Post → CV Analysis ──
 
  /**
   * Fetch posts marked include_in_cv from Spring Boot
   */
  getCvWorthyPosts(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.springUrl}/posts/cv-worthy/${userId}`
    );
  }
 
  /**
   * Send marked posts + current CV data to FastAPI for AI analysis
   */
  analysePostsForCv(
    userId: string,
    posts: any[],
    currentCv: any
  ): Observable<AnalysePostsResponse> {
    return this.http.post<AnalysePostsResponse>(
      `${this.aiUrl}/analyse-posts`,
      {
        user_id: userId,
        posts: posts.map(p => ({
          id: p.id,
          content: p.content,
          post_type: p.postType,
          created_at: p.createdAt,
        })),
        current_cv: currentCv,
      }
    );
  }
}