import {
  animate,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

/**
 * Animaciones de transición entre rutas.
 *
 * El trigger `routeAnimations` se aplica en el contenedor que envuelve al
 * `<router-outlet>`; el data attribute `animation` de cada ruta alimenta
 * el discriminador. Aquí definimos dos transiciones simétricas:
 *
 *   list ⇄ detail  →  slide horizontal con fade
 *
 * Se respeta `prefers-reduced-motion` desde styles.scss (se anulan las
 * transiciones globalmente).
 */
export const routeAnimations = trigger('routeAnimations', [
  transition('list => detail', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true },
    ),
    query(':enter', [style({ opacity: 0, transform: 'translateX(24px)' })], {
      optional: true,
    }),
    group([
      query(
        ':leave',
        [
          animate(
            '220ms ease-out',
            style({ opacity: 0, transform: 'translateX(-24px)' }),
          ),
        ],
        { optional: true },
      ),
      query(
        ':enter',
        [
          animate(
            '260ms 80ms ease-out',
            style({ opacity: 1, transform: 'translateX(0)' }),
          ),
        ],
        { optional: true },
      ),
    ]),
  ]),

  transition('detail => list', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true },
    ),
    query(':enter', [style({ opacity: 0, transform: 'translateX(-24px)' })], {
      optional: true,
    }),
    group([
      query(
        ':leave',
        [
          animate(
            '220ms ease-out',
            style({ opacity: 0, transform: 'translateX(24px)' }),
          ),
        ],
        { optional: true },
      ),
      query(
        ':enter',
        [
          animate(
            '260ms 80ms ease-out',
            style({ opacity: 1, transform: 'translateX(0)' }),
          ),
        ],
        { optional: true },
      ),
    ]),
  ]),
]);
