import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';


export interface AuthResponse {
  token: string;
  email: string;
  userId: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly BACKEND_API_URL = `${environment.apiUrl}/api`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    // Load user from storage only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const user = this.getUserFromStorage();
      this.currentUserSubject.next(user);
      // Re-fetch role from backend so it's always fresh
      if (user?.token) {
        this.http.get<{ role: string }>(`${this.BACKEND_API_URL}/auth/me/role`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }).subscribe({
          next: ({ role }) => {
            const updated = { ...user, role };
            this.storeAuthData(updated);
            this.currentUserSubject.next(updated);
          },
          error: () => {}
        });
      }
    }
  }

  /**
   * Login with email and password via backend
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BACKEND_API_URL}/auth/login`, { email, password }).pipe(
      tap(response => {
        console.log('✓ Login successful');
        this.storeAuthData(response);
        this.currentUserSubject.next(response);
        this.fetchAndStoreRole(response.token);
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => new Error(error.error?.error || 'Login failed'));
      })
    );
  }

  /**
   * Sign up with email, password, and profile information via backend
   */
  signup(email: string, password: string, firstName: string, lastName: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BACKEND_API_URL}/auth/signup`, {
      email, password, firstName, lastName
    }).pipe(
      tap(response => {
        console.log('✓ Signup successful');
        this.storeAuthData(response);
        this.currentUserSubject.next(response);
        this.fetchAndStoreRole(response.token);
      }),
      catchError(error => {
        console.error('Signup failed:', error);
        return throwError(() => new Error(error.error?.error || 'Signup failed'));
      })
    );
  }

  /**
   * Set authentication session from a JWT token (e.g., after backend OAuth redirect)
   */
  setAuthSessionFromToken(token: string): boolean {
    try {
      const base64Url = token.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      const pad = base64.length % 4;
      if (pad) {
        if (pad === 1) throw new Error('Invalid base64 string length');
        base64 += new Array(5 - pad).join('=');
      }

      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      
      const authResponse: AuthResponse = {
        token: token,
        email: payload.email || '',
        userId: payload.sub || '',
        role: payload.role || '',
        firstName: '',
        lastName: '',
        emailVerified: true
      };
      
      this.storeAuthData(authResponse);
      this.currentUserSubject.next(authResponse);
      return true;
    } catch (e) {
      console.error('Failed to parse token', e);
      return false;
    }
  }

  /**
   * Logout and clear auth data
   */
  logout(): Observable<void> {
    return new Observable(observer => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        localStorage.removeItem('user_data');
      }
      this.currentUserSubject.next(null);
      observer.next();
      observer.complete();
    });
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Get current user from subject
   */
  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Store auth data in localStorage
   */
  private storeAuthData(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response));
    }
  }

  /**
   * Get user from localStorage
   */
  private getUserFromStorage(): AuthResponse | null {
    if (isPlatformBrowser(this.platformId)) {
      const userString = localStorage.getItem('user_data');
      return userString ? JSON.parse(userString) : null;
    }
    return null;
  }

  // ── Role helpers ────────────────────────────────────────────────────────────

  getRole(): string {
    return this.currentUserSubject.value?.role ?? 'candidate';
  }

  isAdmin(): boolean { return this.getRole() === 'admin'; }
  isEmployer(): boolean { return this.getRole() === 'employer'; }
  isCandidate(): boolean { return this.getRole() === 'candidate'; }
  switchUserAccount(): Observable<AuthResponse> {
    const token = this.getToken();
    return this.http.post<AuthResponse>(`${this.BACKEND_API_URL}/settings/switch`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(response => {
        this.storeAuthData(response);
        this.currentUserSubject.next(response);
      })
    );
  }

  private fetchAndStoreRole(token: string): void {
    this.http.get<{ role: string }>(`${this.BACKEND_API_URL}/auth/me/role`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: ({ role }) => {
        const current = this.currentUserSubject.value;
        if (current) {
          const updated = { ...current, role };
          this.storeAuthData(updated);
          this.currentUserSubject.next(updated);
        }
      },
      error: () => {}
    });
  }
}
