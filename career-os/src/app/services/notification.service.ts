import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

export interface NotificationDTO {
  id: number;
  actorId: string;
  actorName: string;
  actorInitials: string;
  type: string;
  postId?: number;
  commentId?: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/notifications`;

  unreadCount = signal(0);

  getNotifications(supabaseUid: string): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.api}?supabaseUid=${supabaseUid}`);
  }

  getUnreadCount(supabaseUid: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.api}/unread-count?supabaseUid=${supabaseUid}`);
  }

  markAllAsRead(supabaseUid: string): Observable<void> {
    return this.http.put<void>(`${this.api}/mark-all-read?supabaseUid=${supabaseUid}`, {});
  }

  markAsRead(id: number, supabaseUid: string): Observable<void> {
    return this.http.put<void>(`${this.api}/${id}/read?supabaseUid=${supabaseUid}`, {});
  }

  // Poll unread count every 30 seconds
  startPolling(supabaseUid: string) {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getUnreadCount(supabaseUid))
    );
  }
}