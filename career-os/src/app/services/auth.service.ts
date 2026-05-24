import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, tap, switchMap } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  userId: string; // Changed from number to string (Supabase UUID)
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly PROFILE_API_URL = 'http://localhost:8080/api/profile';
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize Supabase client
    this.supabase = createClient(
      'https://mgqmcfawkgiwjdhxazmy.supabase.co',
      'sb_publishable_xJP9R0ZzP9SxulF648yeow_1_kuamXo'
    );

    // Load user from storage only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const user = this.getUserFromStorage();
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return from(
      this.supabase.auth.signInWithPassword({ email, password })
    ).pipe(
      switchMap(response => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        if (!response.data.user || !response.data.session) {
          throw new Error('Login failed');
        }

        // Get user data from localStorage to get firstName/lastName
        const userData = this.getUserFromStorage();
        const authResponse: AuthResponse = {
          token: response.data.session.access_token,
          email: response.data.user.email || '',
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          userId: response.data.user.id
        };

        this.storeAuthData(authResponse);
        this.currentUserSubject.next(authResponse);
        return from([authResponse]);
      })
    );
  }

  signup(email: string, password: string, firstName: string, lastName: string): Observable<AuthResponse> {
    return from(
      this.supabase.auth.signUp({ email, password })
    ).pipe(
      switchMap(response => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        if (!response.data.user || !response.data.session) {
          throw new Error('Signup failed');
        }

        const userId = response.data.user.id;
        const token = response.data.session.access_token;

        // Create profile in backend
        return this.http.post(`${this.PROFILE_API_URL}/create-profile`, {
          userId,
          email,
          firstName,
          lastName
        }).pipe(
          tap(() => {
            const authResponse: AuthResponse = {
              token,
              email,
              firstName,
              lastName,
              userId
            };
            this.storeAuthData(authResponse);
            this.currentUserSubject.next(authResponse);
          }),
          switchMap(() => from([{
            token,
            email,
            firstName,
            lastName,
            userId
          }]))
        );
      })
    );
  }

  logout(): Observable<void> {
    return from(this.supabase.auth.signOut()).pipe(
      tap(() => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
        this.currentUserSubject.next(null);
      }),
      switchMap(() => from([undefined]))
    );
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  private storeAuthData(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response));
    }
  }

  private getUserFromStorage(): AuthResponse | null {
    if (isPlatformBrowser(this.platformId)) {
      const userString = localStorage.getItem('user_data');
      return userString ? JSON.parse(userString) : null;
    }
    return null;
  }
}
