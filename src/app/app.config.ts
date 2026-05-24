import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { APP_ROUTES } from './app.routes';

/**
 * Configuración raíz de la aplicación (standalone bootstrap).
 *
 * - `withComponentInputBinding()` permite mapear `:id` de la ruta a `@Input()` del detalle.
 * - `provideHttpClient()` habilita el HttpClient (el interceptor se agrega más adelante).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES, withComponentInputBinding()),
    provideHttpClient(),
  ],
};
