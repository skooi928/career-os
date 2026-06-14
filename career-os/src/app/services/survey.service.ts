import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EmployeeSurvey, SurveyWithCount, SurveyQuestion,
  SurveyAnalytics, AiInsight, AnswerInput
} from '../types/upskilling.types';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private base = `${environment.apiUrl}/api/surveys`;

  constructor(private http: HttpClient) {}

  // ── Manager ──────────────────────────────────────────────────────────────────

  createSurvey(orgId: string, title: string, description: string): Observable<EmployeeSurvey> {
    return this.http.post<EmployeeSurvey>(`${this.base}/org/${orgId}`, { title, description });
  }

  getOrgSurveysManage(orgId: string): Observable<SurveyWithCount[]> {
    return this.http.get<SurveyWithCount[]>(`${this.base}/org/${orgId}/manage`);
  }

  activateSurvey(surveyId: string): Observable<EmployeeSurvey> {
    return this.http.post<EmployeeSurvey>(`${this.base}/${surveyId}/activate`, {});
  }

  closeSurvey(surveyId: string): Observable<EmployeeSurvey> {
    return this.http.post<EmployeeSurvey>(`${this.base}/${surveyId}/close`, {});
  }

  getAnalytics(surveyId: string): Observable<SurveyAnalytics> {
    return this.http.get<SurveyAnalytics>(`${this.base}/${surveyId}/analytics`);
  }

  generateInsights(surveyId: string): Observable<{ insightJson: string }> {
    return this.http.post<{ insightJson: string }>(`${this.base}/${surveyId}/insights`, {});
  }

  getLatestInsight(surveyId: string): Observable<AiInsight> {
    return this.http.get<AiInsight>(`${this.base}/${surveyId}/insights`);
  }

  // ── Employee ─────────────────────────────────────────────────────────────────

  getActiveSurveys(orgId: string): Observable<EmployeeSurvey[]> {
    return this.http.get<EmployeeSurvey[]>(`${this.base}/org/${orgId}/active`);
  }

  getQuestions(surveyId: string): Observable<SurveyQuestion[]> {
    return this.http.get<SurveyQuestion[]>(`${this.base}/${surveyId}/questions`);
  }

  getMyStatus(surveyId: string): Observable<{ participated: boolean }> {
    return this.http.get<{ participated: boolean }>(`${this.base}/${surveyId}/my-status`);
  }

  submitResponse(surveyId: string, answers: AnswerInput[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${surveyId}/respond`, { answers });
  }
}
