import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null);
  microsoftLoading = signal(false);
  mentorLoading = signal(false);
  private sessionChecked = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Session check is now handled via the normal token retrieval
    // The auth-callback component will store the token for OAuth
    
    this.route.queryParams.subscribe((params: any) => {
      if (params['error']) {
        this.error.set('Login Error: ' + params['error']);
      } else if (params['code']) {
        this.error.set('Configuration Error: Supabase redirected to the login page instead of the backend. Your Supabase redirect URLs must exactly include: http://localhost:8080/api/auth/callback');
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.error.set(null);

    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.disableForm(true);
    this.authService.login(this.f['email'].value, this.f['password'].value).subscribe({
      next: (response) => {
        // Check if email needs verification
        if (response.emailVerified !== true) {
          this.router.navigate(['/verify-email']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error.set('Invalid email or password');
        this.loading.set(false);
        this.disableForm(false);
      }
    });
  }

  signInWithMicrosoft(role: 'employer' | 'mentor'): void {
    if (role === 'employer') {
      this.microsoftLoading.set(true);
    } else {
      this.mentorLoading.set(true);
    }
    window.location.href = `${environment.apiUrl}/api/auth/azure/${role}`;
  }

  private disableForm(disabled: boolean): void {
    if (disabled) {
      this.loginForm.disable();
    } else {
      this.loginForm.enable();
    }
  }
}
