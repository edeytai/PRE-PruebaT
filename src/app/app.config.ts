import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { APP_ROUTES } from './app.routes';
import { bookingsMockInterceptor } from './core/interceptors/bookings-mock.interceptor';

/**
 * Configuración raíz de la aplicación (standalone bootstrap).
 *
 * - `withComponentInputBinding()` permite mapear `:id` de la ruta a `@Input()` del detalle.
 * - `withInterceptors([...])` registra el interceptor funcional que mockea /api/bookings.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES, withComponentInputBinding()),
    provideHttpClient(withInterceptors([bookingsMockInterceptor])),
  ],
};
