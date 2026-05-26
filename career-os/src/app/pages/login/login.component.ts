import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

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
  private sessionChecked = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && !this.sessionChecked) {
      this.checkOAuthSession();
    }
  }

  private async checkOAuthSession(): Promise<void> {
    this.sessionChecked = true;
    try {
      this.loading.set(true);
      const user = await this.authService.verifySupabaseSession();
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    } catch (err) {
      console.error('OAuth session check failed:', err);
    } finally {
      this.loading.set(false);
    }
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

  async signInWithMicrosoft(): Promise<void> {
    try {
      this.microsoftLoading.set(true);
      this.error.set(null);
      await this.authService.signInWithMicrosoft();
    } catch (err) {
      this.error.set('Microsoft login failed. Please try again.');
      this.microsoftLoading.set(false);
    }
  }

  private disableForm(disabled: boolean): void {
    if (disabled) {
      this.loginForm.disable();
    } else {
      this.loginForm.enable();
    }
  }
}
