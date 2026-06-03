import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('career-os');
  
  // Inject theme service to initialize it globally
  private themeService = inject(ThemeService);
  
  // Inject auth service to initialize it globally and load stored user/token
  private authService = inject(AuthService);
}
