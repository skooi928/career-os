import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => {
        // Ensure auth service is fully initialized before routing
        return Promise.resolve();
      },
      deps: [AuthService],
      multi: true
    }
  ]
};
