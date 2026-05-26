import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null);

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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

  private disableForm(disabled: boolean): void {
    if (disabled) {
      this.loginForm.disable();
    } else {
      this.loginForm.enable();
    }
  }
}
