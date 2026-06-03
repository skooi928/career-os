import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <div class="not-found">
      <h1>404</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      color: var(--color-text);
      background: none;
    }
    .not-found h1 {
      font-size: 5rem;
      margin-bottom: 1rem;
      color: var(--color-primary);
    }
    .not-found p {
      font-size: 1.25rem;
      color: var(--color-text-secondary);
    }
  `]
})
export class PageNotFoundComponent {}