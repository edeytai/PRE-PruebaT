import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { APP_ROUTES } from './app.routes';
import { bookingsMockInterceptor } from './core/interceptors/bookings-mock.interceptor';

/**
 * Configuración raíz de la aplicación (standalone bootstrap).
 *
 * - `withComponentInputBinding()` mapea `:id` de la ruta a `@Input()` del detalle.
 * - `withInterceptors([...])` registra el interceptor funcional que mockea /api/bookings.
 * - `provideAnimations()` habilita el sistema de animaciones para route transitions.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES, withComponentInputBinding()),
    provideHttpClient(withInterceptors([bookingsMockInterceptor])),
    provideAnimations(),
  ],
};
