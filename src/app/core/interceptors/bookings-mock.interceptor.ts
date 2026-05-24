import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';

import { Booking, ReservationResponse } from '../models/booking.model';
import BOOKINGS_DATA from '../../../assets/data/bookings.json';

/** Latencia simulada (ms) para que la UI tenga oportunidad de mostrar loading. */
const MOCK_LATENCY_MS = 450;

/**
 * Probabilidad (0-1) de que la llamada falle. Sirve para ejercitar el
 * estado de error sin tener que cortar internet. Por defecto desactivado;
 * activalo temporalmente desde DevTools si queres probar el banner de error:
 *   `localStorage.setItem('mock:errorRate', '0.5')`
 */
function getErrorRate(): number {
  const raw = globalThis.localStorage?.getItem('mock:errorRate');
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0;
}

/**
 * Copia mutable del dataset; el interceptor decrementa cupos al "reservar"
 * para que la vista refleje el cambio durante la sesión actual.
 */
const bookings: Booking[] = (BOOKINGS_DATA as Booking[]).map((b) => ({ ...b }));

/**
 * Interceptor funcional que mockea el endpoint /api/bookings.
 *
 * Reconoce tres rutas:
 *   GET  /api/bookings
 *   GET  /api/bookings/:id
 *   POST /api/bookings/:id/reservations
 *
 * Cualquier otra request pasa al siguiente handler sin modificarse.
 */
export function bookingsMockInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  if (!req.url.startsWith('/api/bookings')) {
    return next(req);
  }

  return of(null).pipe(
    delay(MOCK_LATENCY_MS),
    mergeMap(() => {
      // Inyección artificial de errores controlada por localStorage.
      if (Math.random() < getErrorRate()) {
        return throwError(
          () =>
            new HttpErrorResponse({
              status: 500,
              statusText: 'Mocked Internal Server Error',
              url: req.url,
            }),
        );
      }

      const listMatch = req.url === '/api/bookings' && req.method === 'GET';
      if (listMatch) {
        return of(new HttpResponse({ status: 200, body: bookings }));
      }

      const detailMatch = req.url.match(/^\/api\/bookings\/(\d+)$/);
      if (detailMatch && req.method === 'GET') {
        const id = Number(detailMatch[1]);
        const booking = bookings.find((b) => b.id === id);
        return booking
          ? of(new HttpResponse({ status: 200, body: booking }))
          : throwError(
              () =>
                new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: req.url }),
            );
      }

      const reserveMatch = req.url.match(/^\/api\/bookings\/(\d+)\/reservations$/);
      if (reserveMatch && req.method === 'POST') {
        const id = Number(reserveMatch[1]);
        const booking = bookings.find((b) => b.id === id);
        const body = req.body as { spots?: number } | null;
        const spots = Math.max(1, Math.trunc(body?.spots ?? 1));

        if (!booking) {
          return throwError(
            () => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }),
          );
        }
        if (booking.availableSpots < spots) {
          return throwError(
            () =>
              new HttpErrorResponse({
                status: 409,
                statusText: 'No hay cupos suficientes',
              }),
          );
        }

        booking.availableSpots -= spots;
        const response: ReservationResponse = {
          ok: true,
          bookingId: booking.id,
          remainingSpots: booking.availableSpots,
        };
        return of(new HttpResponse({ status: 201, body: response }));
      }

      return throwError(
        () => new HttpErrorResponse({ status: 405, statusText: 'Method Not Allowed' }),
      );
    }),
  );
}
