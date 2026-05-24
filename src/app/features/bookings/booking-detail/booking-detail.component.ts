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
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, of, tap } from 'rxjs';

import { Booking } from '../../../core/models/booking.model';
import { BookingService } from '../../../core/services/booking.service';
import { BookingStateService } from '../../../core/services/booking-state.service';

type DetailViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; booking: Booking };

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; reservedFor: string[]; remainingSpots: number }
  | { status: 'failure'; message: string };

/** Forma tipada del control de un asistente individual. */
type AttendeeControl = FormControl<string>;

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

  @Input() id: string | null = null;

  protected readonly view = signal<DetailViewState>({ status: 'loading' });
  protected readonly submit = signal<SubmitState>({ status: 'idle' });

  /**
   * Form de reserva con un FormArray de asistentes (uno por cupo).
   *
   * Decisión UX: en vez de pedir "cantidad de cupos" y un único nombre
   * (lo cual deja ambiguos los nombres de los acompañantes), pedimos un
   * nombre por cada cupo a reservar. La cantidad se deriva del largo del
   * FormArray (no hay control separado), y se manipula con `addAttendee`
   * / `removeAttendee` desde la UI.
   */
  protected readonly form = new FormGroup({
    attendees: new FormArray<AttendeeControl>([this.makeAttendee()], {
      validators: [Validators.required],
    }),
  });

  protected get attendees(): FormArray<AttendeeControl> {
    return this.form.controls.attendees;
  }

  /** Cupos solicitados = largo del FormArray (mantenido en sync por add/remove). */
  protected readonly requestedSpots = signal(1);

  protected readonly canAddAttendee: Signal<boolean> = computed(() => {
    const v = this.view();
    return v.status === 'ready' && this.requestedSpots() < v.booking.availableSpots;
  });

  protected readonly canRemoveAttendee: Signal<boolean> = computed(
    () => this.requestedSpots() > 1,
  );

  protected readonly canSubmit: Signal<boolean> = computed(() => {
    const v = this.view();
    const s = this.submit();
    return (
      v.status === 'ready' &&
      v.booking.availableSpots > 0 &&
      s.status !== 'submitting'
    );
  });

  protected readonly booking: Signal<Booking | null> = computed(() => {
    const v = this.view();
    return v.status === 'ready' ? v.booking : null;
  });

  /** Porcentaje de ocupación (0-100) para la barra de capacidad. */
  protected readonly occupancyPct: Signal<number> = computed(() => {
    const b = this.booking();
    if (!b) return 0;
    // Asumimos capacidad total estimada = availableSpots + ya reservados.
    // Sin un campo `capacity` real, mostramos la barra a partir del max
    // visto del dataset (10), que se acerca al tope teórico.
    const total = 10;
    const occupied = Math.max(0, total - b.availableSpots);
    return Math.min(100, Math.round((occupied / total) * 100));
  });

  ngOnInit(): void {
    const numericId = Number(this.id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      this.view.set({ status: 'error', message: 'Identificador inválido.' });
      return;
    }

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

  protected addAttendee(): void {
    if (!this.canAddAttendee()) return;
    this.attendees.push(this.makeAttendee());
    this.requestedSpots.set(this.attendees.length);
  }

  protected removeAttendee(index: number): void {
    if (!this.canRemoveAttendee()) return;
    this.attendees.removeAt(index);
    this.requestedSpots.set(this.attendees.length);
  }

  protected onSubmit(): void {
    const view = this.view();
    if (view.status !== 'ready') return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const names = this.attendees.getRawValue().map((n) => n.trim());
    this.submit.set({ status: 'submitting' });

    this.bookingService
      .reserve({ bookingId: view.booking.id, attendees: names })
      .pipe(
        tap((res) => {
          this.submit.set({
            status: 'success',
            reservedFor: res.reservedFor,
            remainingSpots: res.remainingSpots,
          });
          this.view.set({
            status: 'ready',
            booking: { ...view.booking, availableSpots: res.remainingSpots },
          });
          this.resetAttendees();
        }),
        catchError((err: { status?: number }) => {
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

  protected goBack(): void {
    this.state.clear();
    void this.router.navigate(['/']);
  }

  /** Crea un control de asistente con las validaciones estándar. */
  private makeAttendee(): AttendeeControl {
    return new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    });
  }

  private resetAttendees(): void {
    while (this.attendees.length > 1) {
      this.attendees.removeAt(this.attendees.length - 1);
    }
    this.attendees.at(0).reset('');
    this.requestedSpots.set(1);
  }

  /** Narrowing helpers para `strictTemplates`. */
  protected asError(s: DetailViewState): { message: string } {
    return s.status === 'error' ? s : { message: '' };
  }
  protected asSuccess(s: SubmitState): {
    reservedFor: string[];
    remainingSpots: number;
  } {
    return s.status === 'success' ? s : { reservedFor: [], remainingSpots: 0 };
  }
  protected asFailure(s: SubmitState): { message: string } {
    return s.status === 'failure' ? s : { message: '' };
  }

  /** Cast helper para iterar el FormArray como FormControl[] en la plantilla. */
  protected asAttendeeControl(c: unknown): AttendeeControl {
    return c as AttendeeControl;
  }
}
