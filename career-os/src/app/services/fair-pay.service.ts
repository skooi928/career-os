import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FairPayCompensationBreakdown {
  base: number;
  benefits: number;
  total_package: number;
}

export interface FairPaySkillImpact {
  skill: string;
  impact: string;
}

export interface FairPayResult {
  min_salary: number;
  avg_salary: number;
  max_salary: number;
  currency: string;
  market_competitiveness_score: number;
  percentile: number;
  benefits_value_estimate: number;
  compensation_breakdown: FairPayCompensationBreakdown;
  salary_explanation: string;
  skills_to_increase_salary: FairPaySkillImpact[];
  certifications_to_increase_salary: string[];
  comparison_summary: string;
  ai_available: boolean;
}

export interface FairPayHistoryEntry {
  id: string;
  jobTitle: string;
  location: string;
  employmentType: string;
  createdAt: string;
  result: FairPayResult;
}

@Injectable({ providedIn: 'root' })
export class FairPayService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/fair-pay';

  // JWT interceptor automatically attaches Authorization header
  analyze(jobTitle: string, location: string, employmentType: string): Observable<FairPayResult> {
    let params = new HttpParams().set('jobTitle', jobTitle);
    if (location) params = params.set('location', location);
    if (employmentType) params = params.set('employmentType', employmentType);
    return this.http.post<FairPayResult>(`${this.API_URL}/analyze`, null, { params });
  }

  getHistory(): Observable<FairPayHistoryEntry[]> {
    return this.http.get<FairPayHistoryEntry[]>(`${this.API_URL}/history`);
  }
}
