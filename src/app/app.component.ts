import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { routeAnimations } from './core/animations/route.animations';

/**
 * Shell raíz: layout principal (header + slot de router).
 *
 * Se mantiene "tonto" a propósito: no maneja estado de dominio, sólo
 * orquesta la estructura visual y declara el trigger de animaciones
 * que se aplica al contenedor del `<router-outlet>`.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeAnimations],
})
export class AppComponent {
  /** Lee `data.animation` de la ruta activa para alimentar el trigger. */
  prepareRoute(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['animation'] ?? '';
  }
}
