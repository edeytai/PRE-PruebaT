import { TestBed } from '@angular/core/testing';

import { BookingStateService } from './booking-state.service';
import { Booking } from '../models/booking.model';

describe('BookingStateService', () => {
  let service: BookingStateService;

  const booking: Booking = {
    id: 42,
    className: 'CrossFit',
    instructor: 'Martín',
    schedule: 'Martes 19:30',
    availableSpots: 6,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingStateService);
  });

  it('debería iniciar sin selección', () => {
    expect(service.selected()).toBeNull();
    expect(service.hasSelection()).toBeFalse();
  });

  it('select() debería actualizar el Signal y emitir por el Observable', (done) => {
    service.selectedBooking$.subscribe((value) => {
      if (value) {
        expect(value.id).toBe(42);
        expect(service.selected()?.id).toBe(42);
        expect(service.hasSelection()).toBeTrue();
        done();
      }
    });

    service.select(booking);
  });

  it('clear() debería resetear el estado', () => {
    service.select(booking);
    service.clear();
    expect(service.selected()).toBeNull();
    expect(service.hasSelection()).toBeFalse();
  });
});
