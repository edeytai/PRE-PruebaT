import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Signal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, of, tap } from 'rxjs';

import { Booking } from '../../../core/models/booking.model';
import { BookingService } from '../../../core/services/booking.service';
import { BookingStateService } from '../../../core/services/booking-state.service';

/**
 * Estado de la vista de detalle: carga de la reserva + ciclo de envío.
 */
type DetailViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; booking: Booking };

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; remainingSpots: number }
  | { status: 'failure'; message: string };

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly state = inject(BookingStateService);
  private readonly router = inject(Router);

  /**
   * Param `:id` enlazado vía `withComponentInputBinding()` en el router.
   * Llega como string — se parsea con coerción en `ngOnInit`.
   */
  @Input() id: string | null = null;

  protected readonly view = signal<DetailViewState>({ status: 'loading' });
  protected readonly submit = signal<SubmitState>({ status: 'idle' });

  /** Formulario de reserva tipado (Reactive Forms estricto). */
  protected readonly form = new FormGroup({
    attendeeName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    spots: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  /** Habilita el botón solo si form válido + hay cupos + no estamos enviando. */
  protected readonly canSubmit: Signal<boolean> = computed(() => {
    const v = this.view();
    const s = this.submit();
    return (
      v.status === 'ready' &&
      v.booking.availableSpots > 0 &&
      s.status !== 'submitting'
    );
  });

  /**
   * Helper computed: expone la reserva cargada como Signal (o null).
   * Evita repetir `asReady(view()).booking` en la plantilla y resulta
   * más legible que un `@let` (que recién está disponible en Angular 18).
   */
  protected readonly booking: Signal<Booking | null> = computed(() => {
    const v = this.view();
    return v.status === 'ready' ? v.booking : null;
  });

  ngOnInit(): void {
    const numericId = Number(this.id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      this.view.set({ status: 'error', message: 'Identificador inválido.' });
      return;
    }

    // Si el listado ya tiene el booking en el estado, lo usamos como hint
    // para evitar un flash de loading.
    const cached = this.state.selected();
    if (cached && cached.id === numericId) {
      this.view.set({ status: 'ready', booking: cached });
    }

    this.bookingService
      .getBookingById(numericId)
      .pipe(
        tap((booking) => {
          this.state.select(booking);
          this.view.set({ status: 'ready', booking });
          // Limita el max de cupos al actual disponible.
          this.form.controls.spots.addValidators(
            Validators.max(Math.max(booking.availableSpots, 1)),
          );
        }),
        catchError((err: { status?: number }) => {
          this.view.set({
            status: 'error',
            message:
              err?.status === 404
                ? 'La clase solicitada no existe.'
                : 'No pudimos cargar el detalle de la clase.',
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  /** Dispara la reserva (simulada) y actualiza el estado de envío. */
  protected onSubmit(): void {
    const view = this.view();
    if (view.status !== 'ready' || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { attendeeName, spots } = this.form.getRawValue();
    this.submit.set({ status: 'submitting' });

    this.bookingService
      .reserve({ bookingId: view.booking.id, attendeeName, spots })
      .pipe(
        tap((res) => {
          this.submit.set({ status: 'success', remainingSpots: res.remainingSpots });
          // Refleja el cambio de cupos en la vista actual.
          this.view.set({
            status: 'ready',
            booking: { ...view.booking, availableSpots: res.remainingSpots },
          });
          this.form.reset({ attendeeName: '', spots: 1 });
        }),
        catchError((err: { status?: number; statusText?: string }) => {
          this.submit.set({
            status: 'failure',
            message:
              err?.status === 409
                ? 'No hay cupos suficientes para esa cantidad.'
                : 'No pudimos completar la reserva. Intentalo nuevamente.',
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  /** Vuelve al listado y limpia el estado compartido. */
  protected goBack(): void {
    this.state.clear();
    void this.router.navigate(['/']);
  }

  /** Narrowing helpers para `strictTemplates`. */
  protected asReady(s: DetailViewState): { booking: Booking } {
    return s.status === 'ready' ? s : { booking: {} as Booking };
  }
  protected asError(s: DetailViewState): { message: string } {
    return s.status === 'error' ? s : { message: '' };
  }
  protected asSuccess(s: SubmitState): { remainingSpots: number } {
    return s.status === 'success' ? s : { remainingSpots: 0 };
  }
  protected asFailure(s: SubmitState): { message: string } {
    return s.status === 'failure' ? s : { message: '' };
  }
}
