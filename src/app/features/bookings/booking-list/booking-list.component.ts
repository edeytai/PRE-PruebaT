import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Signal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of, tap } from 'rxjs';

import { Booking } from '../../../core/models/booking.model';
import { BookingService } from '../../../core/services/booking.service';
import { BookingStateService } from '../../../core/services/booking-state.service';

/**
 * Máquina de estado de la vista. Usamos un único objeto para que la
 * plantilla pueda discriminar con `@switch` sin estados imposibles
 * (p.ej. `loading=true && error=...`).
 */
type ListViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; bookings: Booking[] };

@Component({
  selector: 'app-booking-list',
  standalone: true,
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingListComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly state = inject(BookingStateService);
  private readonly router = inject(Router);

  /** Estado de carga de la vista (Signal para integrarse con OnPush). */
  protected readonly view = signal<ListViewState>({ status: 'loading' });

  /** Derivado: true cuando hay 0 reservas tras una carga exitosa. */
  protected readonly isEmpty: Signal<boolean> = computed(() => {
    const s = this.view();
    return s.status === 'success' && s.bookings.length === 0;
  });

  ngOnInit(): void {
    this.load();
  }

  /** Carga el listado y actualiza la máquina de estado. */
  protected load(): void {
    this.view.set({ status: 'loading' });

    this.bookingService
      .getBookings()
      .pipe(
        tap((bookings) => this.view.set({ status: 'success', bookings })),
        catchError(() => {
          this.view.set({
            status: 'error',
            message:
              'No pudimos cargar las reservas. Revisa tu conexión y vuelve a intentarlo.',
          });
          return of([] as Booking[]);
        }),
        finalize(() => {
          // hook para telemetría / analytics en el futuro
        }),
      )
      .subscribe();
  }

  /** Navega al detalle y guarda la selección en el estado compartido. */
  protected open(booking: Booking): void {
    this.state.select(booking);
    void this.router.navigate(['/bookings', booking.id]);
  }

  /**
   * Porcentaje de ocupacion para la barra de capacidad.
   * Sin un campo `capacity` real en el modelo, asumimos una capacidad
   * teorica de 10 (el max del dataset) y calculamos el porcentaje
   * ocupado en base a los cupos restantes.
   */
  protected occupancyPct(booking: Booking): number {
    const total = 10;
    const occupied = Math.max(0, total - booking.availableSpots);
    return Math.min(100, Math.round((occupied / total) * 100));
  }

  /**
   * Narrowing helpers para la plantilla. `strictTemplates` impide
   * acceder directamente a propiedades que solo existen en una
   * rama del union type — estos asserts mantienen la legibilidad
   * del HTML sin perder type-safety.
   */
  protected asError(s: ListViewState): { message: string } {
    return s.status === 'error' ? s : { message: '' };
  }
  protected asSuccess(s: ListViewState): { bookings: Booking[] } {
    return s.status === 'success' ? s : { bookings: [] };
  }
}
