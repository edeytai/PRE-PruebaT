# Reservas de Gimnasio — Prueba Técnica Frontend (Angular 17)

Aplicación SPA en **Angular 17 (standalone)** que implementa la vista de un sistema de reservas de turnos para un gimnasio. Cumple los requisitos obligatorios de la consigna y todos los puntos extra propuestos.

> **Repositorio:** privado en GitHub. La consigna original pide repositorio público; cambialo a público desde **Settings → Danger Zone → Change visibility** cuando vayas a entregarlo.

---

## Cumplimiento de la consigna

### Obligatorio

- [x] **Listado de tarjetas** con clases disponibles.
- [x] **Vista de detalle** con botón "Reservar" (acción simulada).
- [x] **Estilos consistentes** (paleta + tipografía + spacing tokens) sin librerías UI.
- [x] **Responsive ≥ 768px** (mobile-first; 2 col en tablet, 3 col en desktop).
- [x] **Estados visuales**: loading (skeleton), error (con retry) y empty.
- [x] **Arquitectura de 3 componentes** (`AppComponent`, `BookingListComponent`, `BookingDetailComponent`) + un servicio de estado compartido.
- [x] **`HttpClient`** consumiendo `/api/bookings` (interceptor funcional como mock).
- [x] **Servicio inyectable** (`@Injectable({ providedIn: 'root' })`) con métodos tipados.
- [x] **Modelo `Booking`** según la interfaz sugerida (enriquecido con campos opcionales).
- [x] **TypeScript estricto** (`strict`, `strictTemplates`, `noImplicitOverride`, etc.).
- [x] **Sin librerías UI**: HTML + SCSS puros.

### Puntos extra (todos cubiertos)

- [x] **Standalone components** + **control flow** (`@if`, `@for`, `@switch`).
- [x] **Signals** para estado reactivo (`signal`, `computed`, `Signal<T>`).
- [x] **Reactive Forms** en el detalle (FormGroup tipado con validaciones).
- [x] **Tests unitarios** (Jasmine + Karma) para servicio, estado y componente clave.
- [x] **Lazy loading** del detalle (`loadComponent`).
- [x] **Animaciones** suaves entre listado y detalle (`@angular/animations`).
- [x] **Despliegue listo** para Vercel / Netlify / GitHub Pages (configs incluidas).

---

## Cómo correr el proyecto

### Requisitos

| Herramienta | Versión usada       | Mínima recomendada |
| ----------- | ------------------- | ------------------ |
| Node.js     | **v24.9.0**         | v18.13 / v20.9     |
| npm         | **11.8.0**          | 9+                 |
| Angular CLI | **17.3.x** (devDep) | 17+                |

> No hace falta instalar Angular CLI globalmente: ya está como `devDependency`. Los scripts usan `ng` desde `node_modules/.bin`.

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm start
# alias de: ng serve
# Abrir http://localhost:4200
```

### Build de producción

```bash
npm run build
# Output: dist/gym-bookings/browser
```

### Tests

```bash
# Modo watch (abre navegador)
npm test

# CI / headless con cobertura
npm run test:ci
# Reporte HTML en: coverage/gym-bookings/index.html
```

---

## Arquitectura

```
src/
├── app/
│   ├── app.component.{ts,html,scss}        # shell (header + outlet + footer)
│   ├── app.config.ts                       # providers raíz (router, http, animations)
│   ├── app.routes.ts                       # routing + lazy loading
│   ├── core/
│   │   ├── animations/route.animations.ts  # transiciones list <-> detail
│   │   ├── interceptors/
│   │   │   └── bookings-mock.interceptor.ts  # mock funcional de /api/bookings
│   │   ├── models/booking.model.ts         # Booking, ReservationRequest/Response
│   │   └── services/
│   │       ├── booking.service.ts          # HttpClient: get/getById/reserve
│   │       └── booking-state.service.ts    # estado compartido (BehaviorSubject + Signal)
│   └── features/bookings/
│       ├── booking-list/                   # ruta '/'              (eager)
│       └── booking-detail/                 # ruta '/bookings/:id'  (lazy)
├── assets/data/bookings.json               # dataset mockeado
├── styles.scss                             # design tokens globales
└── index.html
```

### Capas

1. **Modelos** (`core/models`): contratos TypeScript puros. No dependen de Angular.
2. **Servicios HTTP** (`core/services/booking.service.ts`): única vía hacia el "backend".
3. **Mock HTTP** (`core/interceptors`): intercambiable por un backend real sin tocar nada más.
4. **Estado compartido** (`core/services/booking-state.service.ts`): cross-component, sobrevive a la navegación.
5. **Features** (`features/bookings`): componentes presentacionales + lógica de vista.

---

## Estrategia de comunicación entre componentes

Se eligió **servicio compartido con `BehaviorSubject` + `Signal`** en lugar de `@Input()` / `@Output()`.

### Por qué

- `BookingListComponent` y `BookingDetailComponent` **no son padre-hijo**: el listado vive en la ruta `'/'` y el detalle en `'/bookings/:id'`. El `<router-outlet>` los renderiza de forma alternada como hermanos, así que un par `@Input()` / `@Output()` no aplica de forma natural.
- El `BookingStateService` cachea la última reserva seleccionada, evitando un "flash de loading" cuando el usuario abre el detalle desde la lista (el detalle igualmente hace el fetch para datos frescos).
- Exponer el mismo estado **como `Observable` y como `Signal`** permite consumirlo de la forma más conveniente en cada caso:
  - `Observable` para componer con otros streams (RxJS).
  - `Signal` para plantillas con `OnPush` sin `| async` ni suscripciones manuales.

### Ejemplo

```ts
// list -> setea
this.state.select(booking);
this.router.navigate(['/bookings', booking.id]);

// detail -> lee
const cached = this.state.selected(); // Signal call
```

---

## Simulación de la API

Se implementó un **HTTP Interceptor funcional** (`bookingsMockInterceptor`) registrado en `app.config.ts` vía `withInterceptors([...])`.

### Endpoints que reconoce

| Método | Ruta                             | Respuesta                                       |
| ------ | -------------------------------- | ----------------------------------------------- |
| GET    | `/api/bookings`                  | `Booking[]` (200)                               |
| GET    | `/api/bookings/:id`              | `Booking` (200) o 404                           |
| POST   | `/api/bookings/:id/reservations` | `ReservationResponse` (201) o 409 si falta cupo |

### Características

- **Latencia simulada** de ~450 ms para que los estados de loading sean perceptibles.
- **Inyección de errores opt-in** vía `localStorage`:
  ```js
  // Desde DevTools: 50% de las requests fallarán con 500
  localStorage.setItem('mock:errorRate', '0.5')
  ```
- **Estado mutable durante la sesión**: el interceptor decrementa los cupos al "reservar" para que la UI refleje el cambio (no hay persistencia entre recargas).

### Por qué interceptor y no `of(...)` directo en el servicio

Porque permite que el `BookingService` use `HttpClient` con rutas REST convencionales (`/api/bookings`). El día de mañana se reemplaza el interceptor por un backend real y el resto del código no se entera.

---

## Diseño y UX

- **Paleta**: slate + acento ámbar (definida en CSS variables en `styles.scss`).
- **Tipografía**: Inter (vía Google Fonts).
- **Spacing scale** de 4px con tokens nombrados.
- **Estados visuales**:
  - Loading: skeleton screens animados (no spinner).
  - Error: banner con icono y botón de reintentar.
  - Empty: mensaje contextual.
- **Animaciones**: slide horizontal + fade entre listado y detalle (`@angular/animations`).
- **Accesibilidad**:
  - Focus visible con outline ámbar.
  - `role="status"` y `role="alert"` en feedback de reserva.
  - `aria-busy` durante carga.
  - `@media (prefers-reduced-motion: reduce)` anula animaciones para usuarios sensibles.
- **Responsive**:
  - `< 768px`: 1 columna.
  - `>= 768px`: 2 columnas.
  - `>= 1024px`: 3 columnas.

---

## Tests

Tres specs cubriendo las capas clave:

| Archivo                          | Cubre                                                 |
| -------------------------------- | ----------------------------------------------------- |
| `booking.service.spec.ts`        | GET/POST + propagación de errores HTTP                |
| `booking-state.service.spec.ts`  | `select` / `clear` + reactividad de Signal/Observable |
| `booking-list.component.spec.ts` | Estados loading / success / empty / error             |

```bash
npm run test:ci   # headless + coverage
```

---

## Despliegue

### Vercel

1. `vercel link` (o importar el repo desde [vercel.com/new](https://vercel.com/new)).
2. Vercel detecta `vercel.json` y usa `npm run build`.
3. Publica `dist/gym-bookings/browser`.

### Netlify

1. Conectar el repo desde el dashboard.
2. `netlify.toml` ya define build, publish y SPA fallback.

### GitHub Pages

1. Settings -> Pages -> **Source: GitHub Actions**.
2. El workflow `.github/workflows/deploy-gh-pages.yml` corre en cada push a `main`.
3. La app se publica en `https://<usuario>.github.io/<repo>/` (el `--base-href` se ajusta automáticamente al nombre del repo).

---

## Decisiones y honestidad técnica

- **Node v24 vs Angular 17**: Angular 17 oficialmente soporta Node 18/20. v24 funciona en la práctica pero puede emitir warnings de engines durante `npm install`. Si bloquean el install, correr `npm install --engine-strict=false`.
- **Estado compartido vs `@Input` / `@Output`**: aunque la consigna acepta cualquiera, opté por servicio + Signal porque las vistas son hermanas bajo el router (ver sección "Estrategia de comunicación").
- **Sin `provideExperimentalZonelessChangeDetection`**: Angular 17 todavía la marca experimental. Se mantiene Zone.js para evitar inestabilidad en testing.
- **Mock por interceptor**: preferido sobre `json-server` para no agregar una dependencia extra ni un proceso paralelo durante `ng serve`.
- **Cobertura de tests**: hay 3 specs (servicio, estado, componente). No es exhaustiva — la prueba pide "unit tests para el servicio o un componente clave" y se cumple holgadamente, pero quedan sin cubrir el detalle y el interceptor por tiempo.

---

## Convenciones de commits

Los commits siguen un estilo cercano a **Conventional Commits**:

```
feat(scope): ...     # nueva funcionalidad
chore(scope): ...    # config / tooling
style: ...           # cambios visuales sin lógica
test: ...            # tests
docs: ...            # documentación
```

El historial es **incremental** (uno por capa/feature) y refleja la progresión natural del trabajo en lugar de un single squash.
