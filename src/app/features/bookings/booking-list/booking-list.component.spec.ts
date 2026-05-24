import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { BookingListComponent } from './booking-list.component';
import { Booking } from '../../../core/models/booking.model';

describe('BookingListComponent', () => {
  let fixture: ComponentFixture<BookingListComponent>;
  let httpMock: HttpTestingController;

  const data: Booking[] = [
    {
      id: 1,
      className: 'Yoga',
      instructor: 'Laura',
      schedule: 'Lunes 18:00',
      availableSpots: 10,
    },
    {
      id: 2,
      className: 'CrossFit',
      instructor: 'Martín',
      schedule: 'Martes 19:30',
      availableSpots: 0,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingListComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería mostrar el estado de loading inicialmente', () => {
    fixture.detectChanges();
    const skeletons = fixture.nativeElement.querySelectorAll('.card--skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('debería renderizar las tarjetas tras una carga exitosa', () => {
    fixture.detectChanges();
    httpMock.expectOne('/api/bookings').flush(data);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.card:not(.card--skeleton)');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Yoga');
    expect(fixture.nativeElement.textContent).toContain('Sin cupos');
  });

  it('debería mostrar empty state cuando el listado llega vacío', () => {
    fixture.detectChanges();
    httpMock.expectOne('/api/bookings').flush([]);
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.state--empty');
    expect(empty).toBeTruthy();
  });

  it('debería mostrar el estado de error cuando falla el request', () => {
    fixture.detectChanges();
    httpMock
      .expectOne('/api/bookings')
      .flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.state--error');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Reintentar');
  });
});
