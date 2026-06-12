import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Badge, UserBadge, UniversityCourseConversion,
  CreateBadgeRequest, IssueBadgeRequest,
  SubmitConversionRequest, ReviewConversionRequest
} from '../types/upskilling.types';

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private base = 'http://localhost:8080/api/badges';

  constructor(private http: HttpClient) {}

  getAllBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.base);
  }

  getOrgBadges(orgId: string): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${this.base}/organisation/${orgId}`);
  }

  getBadgeById(id: string): Observable<Badge> {
    return this.http.get<Badge>(`${this.base}/${id}`);
  }

  createBadge(orgId: string, req: CreateBadgeRequest): Observable<Badge> {
    return this.http.post<Badge>(`${this.base}/organisation/${orgId}`, req);
  }

  uploadBadgeImage(badgeId: string, file: File): Observable<Badge> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Badge>(`${this.base}/${badgeId}/image`, form);
  }

  deleteBadge(orgId: string, badgeId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/organisation/${orgId}/${badgeId}`);
  }

  issueBadge(orgId: string, req: IssueBadgeRequest): Observable<UserBadge> {
    return this.http.post<UserBadge>(`${this.base}/issue?orgId=${orgId}`, req);
  }

  getMyBadges(): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`${this.base}/my`);
  }

  getPublicBadgesForUser(userId: string): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`${this.base}/user/${userId}`);
  }

  // ── University conversion ───────────────────────────────────────────────────

  submitConversionRequest(req: SubmitConversionRequest): Observable<UniversityCourseConversion> {
    return this.http.post<UniversityCourseConversion>(`${this.base}/conversions`, req);
  }

  uploadCertificate(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/conversions/upload`, form);
  }

  getMyConversions(): Observable<UniversityCourseConversion[]> {
    return this.http.get<UniversityCourseConversion[]>(`${this.base}/conversions/my`);
  }

  getPendingConversions(): Observable<UniversityCourseConversion[]> {
    return this.http.get<UniversityCourseConversion[]>(`${this.base}/conversions/pending`);
  }

  reviewConversion(id: string, req: ReviewConversionRequest): Observable<UniversityCourseConversion> {
    return this.http.put<UniversityCourseConversion>(`${this.base}/conversions/${id}/review`, req);
  }
}
