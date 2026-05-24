/**
 * Representa una clase reservable del gimnasio.
 *
 * Modelo sugerido por la consigna; los campos opcionales (`description`,
 * `durationMinutes`, `intensity`) enriquecen la vista de detalle sin
 * romper compatibilidad con el contrato base.
 */
export interface Booking {
  id: number;
  className: string;
  instructor: string;
  schedule: string;
  availableSpots: number;
  description?: string;
  durationMinutes?: number;
  intensity?: BookingIntensity;
}

export type BookingIntensity = 'baja' | 'media' | 'alta';

/**
 * Payload enviado al "reservar" un cupo.
 * No se persiste — la reserva es simulada según la consigna.
 */
export interface ReservationRequest {
  bookingId: number;
  attendeeName: string;
  spots: number;
}

export interface ReservationResponse {
  ok: true;
  bookingId: number;
  remainingSpots: number;
}
