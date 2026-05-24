import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Booking,
  ReservationRequest,
  ReservationResponse,
} from '../models/booking.model';

/**
 * Capa de acceso al "backend" de reservas.
 *
 * El servicio es agnóstico del mock: usa `HttpClient` contra rutas REST
 * convencionales (`/api/bookings`, `/api/bookings/:id`). La respuesta es
 * interceptada por `bookingsMockInterceptor` (ver core/interceptors), lo
 * que permite cambiar a un backend real sin tocar este archivo.
 */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/bookings';

  /** Listado completo de clases disponibles. */
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.baseUrl);
  }

  /** Detalle de una clase por id. */
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/${id}`);
  }

  /**
   * Simula la reserva de un cupo.
   * El interceptor responde con el cupo restante; no hay persistencia real.
   */
  reserve(payload: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(
      `${this.baseUrl}/${payload.bookingId}/reservations`,
      payload,
    );
  }
}
