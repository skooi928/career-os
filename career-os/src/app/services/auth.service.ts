import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  email: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly BACKEND_API_URL = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    // Load user from storage only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const user = this.getUserFromStorage();
      this.currentUserSubject.next(user);
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
      email,
      password,
      firstName,
      lastName
    }).pipe(
      tap(response => {
        console.log('✓ Signup successful');
        this.storeAuthData(response);
        this.currentUserSubject.next(response);
      }),
      catchError(error => {
        console.error('Signup failed:', error);
        return throwError(() => new Error(error.error?.error || 'Signup failed'));
      })
    );
  }

  /**
   * Logout and clear auth data
   */
  logout(): Observable<void> {
    return new Observable(observer => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('auth_token');
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
}
