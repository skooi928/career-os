import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NetworkDTO {
  id: number;
  requesterId: string;
  addresseeId: string;
  requesterName: string;
  addresseeName: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/network';

  sendRequest(addresseeId: string, supabaseUid: string): Observable<NetworkDTO> {
    return this.http.post<NetworkDTO>(
      `${this.api}/request?supabaseUid=${supabaseUid}`,
      { addresseeId }
    );
  }

  acceptRequest(networkId: number, supabaseUid: string): Observable<NetworkDTO> {
    return this.http.put<NetworkDTO>(
      `${this.api}/${networkId}/accept?supabaseUid=${supabaseUid}`, {}
    );
  }

  declineRequest(networkId: number, supabaseUid: string): Observable<void> {
    return this.http.put<void>(
      `${this.api}/${networkId}/decline?supabaseUid=${supabaseUid}`, {}
    );
  }

  getMyNetwork(supabaseUid: string): Observable<NetworkDTO[]> {
    return this.http.get<NetworkDTO[]>(`${this.api}/connections?supabaseUid=${supabaseUid}`);
  }

  getPendingRequests(supabaseUid: string): Observable<NetworkDTO[]> {
    return this.http.get<NetworkDTO[]>(`${this.api}/pending?supabaseUid=${supabaseUid}`);
  }

  getConnectionStatus(targetUserId: string, supabaseUid: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(
      `${this.api}/status/${targetUserId}?supabaseUid=${supabaseUid}`
    );
  }
}