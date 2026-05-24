import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { BookingService } from './booking.service';
import { Booking } from '../models/booking.model';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  const fixture: Booking[] = [
    {
      id: 1,
      className: 'Yoga',
      instructor: 'Laura',
      schedule: 'Lunes 18:00',
      availableSpots: 10,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería emitir el listado al llamar a getBookings()', () => {
    service.getBookings().subscribe((res) => expect(res).toEqual(fixture));

    const req = httpMock.expectOne('/api/bookings');
    expect(req.request.method).toBe('GET');
    req.flush(fixture);
  });

  it('debería pedir el detalle por id', () => {
    service.getBookingById(1).subscribe((res) => expect(res.id).toBe(1));

    const req = httpMock.expectOne('/api/bookings/1');
    expect(req.request.method).toBe('GET');
    req.flush(fixture[0]);
  });

  it('debería postear una reserva con la lista de asistentes', () => {
    service
      .reserve({ bookingId: 1, attendees: ['Ana', 'Luis'] })
      .subscribe((res) => {
        expect(res.remainingSpots).toBe(8);
        expect(res.reservedFor).toEqual(['Ana', 'Luis']);
      });

    const req = httpMock.expectOne('/api/bookings/1/reservations');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      bookingId: 1,
      attendees: ['Ana', 'Luis'],
    });
    req.flush({
      ok: true,
      bookingId: 1,
      reservedFor: ['Ana', 'Luis'],
      remainingSpots: 8,
    });
  });

  it('debería propagar errores HTTP', (done) => {
    service.getBookingById(999).subscribe({
      next: () => fail('no debería emitir next'),
      error: (err) => {
        expect(err.status).toBe(404);
        done();
      },
    });

    httpMock
      .expectOne('/api/bookings/999')
      .flush('not found', { status: 404, statusText: 'Not Found' });
  });
});
