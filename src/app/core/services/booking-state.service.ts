import { Injectable, Signal, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Booking } from '../models/booking.model';

/**
 * Estado compartido entre `BookingListComponent` y `BookingDetailComponent`.
 *
 * Decisión de diseño:
 * - Como ambos componentes son hermanos bajo el router (no padre-hijo), un
 *   par `@Input()`/`@Output()` no aplica. Se usa un servicio compartido
 *   con `BehaviorSubject` (RxJS) — la segunda opción que ofrece la consigna.
 * - Se expone además como `Signal` para que las plantillas con OnPush
 *   reaccionen sin necesidad de `| async` ni suscripciones manuales.
 *
 * Esto mantiene el contrato de servicio (Observable) para interoperar con
 * librerías RxJS, y a la vez aprovecha Signals como capa de presentación.
 */
@Injectable({ providedIn: 'root' })
export class BookingStateService {
  private readonly selected$ = new BehaviorSubject<Booking | null>(null);

  /** Stream RxJS — útil si algún consumidor necesita componerlo con otros. */
  readonly selectedBooking$: Observable<Booking | null> =
    this.selected$.asObservable();

  /**
   * Espejo en Signal del valor actual. Se mantiene en sync vía `next` para
   * no depender de `toSignal()` (que requiere `injection context`).
   */
  private readonly selectedSig = signal<Booking | null>(null);

  /** Vista pública de solo-lectura. */
  readonly selected: Signal<Booking | null> = this.selectedSig.asReadonly();

  /** Derivado: indica si hay una reserva seleccionada. */
  readonly hasSelection = computed(() => this.selectedSig() !== null);

  /** Marca una reserva como seleccionada (al navegar al detalle). */
  select(booking: Booking): void {
    this.selected$.next(booking);
    this.selectedSig.set(booking);
  }

  /** Limpia la selección (al volver al listado). */
  clear(): void {
    this.selected$.next(null);
    this.selectedSig.set(null);
  }
}
