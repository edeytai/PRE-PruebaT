import { Routes } from '@angular/router';

import { BookingListComponent } from './features/bookings/booking-list/booking-list.component';

/**
 * Rutas de la aplicación.
 *
 * - `''` → listado de reservas (eager: es la pantalla principal).
 *
 * El detalle se agrega en el siguiente commit usando lazy loading.
 */
export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: BookingListComponent,
    data: { animation: 'list' },
  },
  { path: '**', redirectTo: '' },
];
