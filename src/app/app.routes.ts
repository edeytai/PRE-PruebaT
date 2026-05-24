import { Routes } from '@angular/router';

import { BookingListComponent } from './features/bookings/booking-list/booking-list.component';

/**
 * Rutas de la aplicación.
 *
 * - `''`             → listado de reservas (eager: pantalla principal).
 * - `'bookings/:id'` → detalle de reserva (lazy-loaded via loadComponent).
 *
 * El lazy loading del detalle saca esa pantalla del bundle inicial y
 * cumple el "punto extra" de la consigna.
 */
export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: BookingListComponent,
    data: { animation: 'list' },
  },
  {
    path: 'bookings/:id',
    loadComponent: () =>
      import('./features/bookings/booking-detail/booking-detail.component').then(
        (m) => m.BookingDetailComponent,
      ),
    data: { animation: 'detail' },
  },
  { path: '**', redirectTo: '' },
];
