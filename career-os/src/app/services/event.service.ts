import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventSource: EventSource | null = null;

  // Subjects for different event types
  private applicationUpdatedSubject = new Subject<any>();
  private newApplicationSubject = new Subject<any>();
  private newJobPostedSubject = new Subject<any>();

  public applicationUpdated$ = this.applicationUpdatedSubject.asObservable();
  public newApplication$ = this.newApplicationSubject.asObservable();
  public newJobPosted$ = this.newJobPostedSubject.asObservable();

  constructor(private authService: AuthService, private zone: NgZone) {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.userId) {
        this.connect(user.userId);
      } else {
        this.disconnect();
      }
    });
  }

  private connect(userId: string) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(`${environment.apiUrl}/api/events/subscribe/${userId}`);

    this.eventSource.addEventListener('CONNECTED', (event) => {
      console.log('SSE Connected:', event.data);
    });

    this.eventSource.addEventListener('APPLICATION_UPDATED', (event) => {
      this.zone.run(() => {
        this.applicationUpdatedSubject.next(JSON.parse(event.data));
      });
    });

    this.eventSource.addEventListener('NEW_APPLICATION', (event) => {
      this.zone.run(() => {
        this.newApplicationSubject.next(JSON.parse(event.data));
      });
    });

    this.eventSource.addEventListener('NEW_JOB_POSTED', (event) => {
      this.zone.run(() => {
        this.newJobPostedSubject.next(JSON.parse(event.data));
      });
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      // EventSource auto-reconnects by default, but we can handle custom logic here
    };
  }

  private disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
