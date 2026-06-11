import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Organisation, OrganisationMember, OrgMemberRole,
  CreateOrganisationRequest, UpdateOrganisationRequest,
  InviteMemberRequest, OrgDashboardStats
} from '../types/upskilling.types';

@Injectable({ providedIn: 'root' })
export class OrganisationService {
  private base = 'http://localhost:8080/api/organisations';

  constructor(private http: HttpClient) {}

  getVerifiedOrganisations(): Observable<Organisation[]> {
    return this.http.get<Organisation[]>(this.base);
  }

  getOrganisationById(id: string): Observable<Organisation> {
    return this.http.get<Organisation>(`${this.base}/${id}`);
  }

  getMyOrganisations(): Observable<Organisation[]> {
    return this.http.get<Organisation[]>(`${this.base}/my`);
  }

  createOrganisation(req: CreateOrganisationRequest): Observable<Organisation> {
    return this.http.post<Organisation>(this.base, req);
  }

  updateOrganisation(id: string, req: UpdateOrganisationRequest): Observable<Organisation> {
    return this.http.put<Organisation>(`${this.base}/${id}`, req);
  }

  uploadVerificationDocument(orgId: string, file: File): Observable<Organisation> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Organisation>(`${this.base}/${orgId}/verification-document`, form);
  }

  uploadLogo(orgId: string, file: File): Observable<Organisation> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Organisation>(`${this.base}/${orgId}/logo`, form);
  }

  getMembers(orgId: string): Observable<OrganisationMember[]> {
    return this.http.get<OrganisationMember[]>(`${this.base}/${orgId}/members`);
  }

  inviteMember(orgId: string, req: InviteMemberRequest): Observable<OrganisationMember> {
    return this.http.post<OrganisationMember>(`${this.base}/${orgId}/members`, req);
  }

  updateMemberRole(orgId: string, memberId: string, role: OrgMemberRole): Observable<OrganisationMember> {
    return this.http.put<OrganisationMember>(`${this.base}/${orgId}/members/${memberId}`, { role });
  }

  removeMember(orgId: string, memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${orgId}/members/${memberId}`);
  }

  getDashboardStats(orgId: string): Observable<OrgDashboardStats> {
    return this.http.get<OrgDashboardStats>(`${this.base}/${orgId}/dashboard-stats`);
  }
}
