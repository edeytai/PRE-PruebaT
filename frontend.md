# Prueba Técnica – Frontend Developer (Angular)

## 🎯 Objetivo

Evaluar conocimientos prácticos en el desarrollo de aplicaciones Angular modernas, abarcando:

1. **Diseño e implementación visual** — HTML semántico, CSS/SCSS y estructura de componentes.
2. **Arquitectura y comunicación** — separación de responsabilidades y comunicación entre componentes.
3. **Manejo de datos asíncronos** — consumo de servicios HTTP con `HttpClient` y observables (RxJS).
4. **Buenas prácticas** — tipado estricto, organización del código y legibilidad.

---

## 📋 Enunciado

Construir una pequeña aplicación en **Angular** que represente la vista de un **sistema de reservas de turnos para un gimnasio**.

La aplicación debe permitir al usuario:

- Visualizar un listado de clases disponibles.
- Seleccionar una clase para ver su detalle.
- Reservar un cupo (acción simulada, sin persistencia real).

### Boceto de referencia

```
┌─────────────────────────────────────┐
│  🏋️  Reservas disponibles           │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  Tarjeta de clase 1  [Ver más]│  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Tarjeta de clase 2  [Ver más]│  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Tarjeta de clase 3  [Ver más]│  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

         ▼ Al hacer clic en "Ver más"

┌─────────────────────────────────────┐
│  Clase:     Yoga                    │
│  Profesor:  Laura Gómez             │
│  Horario:   Lunes 18:00             │
│  Cupos:     10 disponibles          │
│                                     │
│        [   Reservar   ]             │
└─────────────────────────────────────┘
```

---

## ✅ Requisitos funcionales

### 1. Diseño y UX

- Replicar la estructura del boceto: **listado de tarjetas + vista de detalle**.
- Estilos consistentes (paleta básica, tipografía legible, espaciado).
- **Responsividad mínima**: la aplicación debe verse correctamente en pantallas de **≥ 768px**.
- Estados visuales:
  - **Loading** mientras se obtienen las reservas.
  - **Error** si la llamada HTTP falla.
  - **Empty state** si no hay clases disponibles.

### 2. Arquitectura de componentes

La aplicación debe contener **al menos** los siguientes componentes:

| Componente               | Responsabilidad                                              |
| ------------------------ | ------------------------------------------------------------ |
| `AppComponent`           | Estructura general y layout principal.                       |
| `BookingListComponent`   | Listado de reservas disponibles (tarjetas).                  |
| `BookingDetailComponent` | Detalle de una reserva seleccionada con botón de "Reservar". |

La comunicación entre `BookingListComponent` y `BookingDetailComponent` debe implementarse mediante **una de las siguientes opciones**:

- `@Input()` / `@Output()` (comunicación padre-hijo).
- Un servicio compartido con `Subject` / `BehaviorSubject` (RxJS).

> Justificá brevemente en el README la opción elegida.

### 3. Consumo de servicios

- Simular un endpoint REST `GET /bookings` usando `HttpClient`.
- La respuesta puede mockearse con cualquiera de estas alternativas:
  - `json-server`.
  - Un **HTTP interceptor** que devuelva datos mockeados.
  - Un servicio que retorne un `Observable<Booking[]>` con `of(...)` o `from(...)`.
- El servicio debe ser **inyectable** (`@Injectable({ providedIn: 'root' })`) y exponer métodos tipados.

### 4. Modelo de datos sugerido

```ts
interface Booking {
  id: number;
  className: string; // "Yoga", "Crossfit", "Spinning"...
  instructor: string;
  schedule: string; // "Lunes 18:00"
  availableSpots: number;
}
```

---

## 🛠️ Stack y restricciones técnicas

- **Angular 15+** (idealmente 17 con standalone components).
- **TypeScript** con `strict: true`.
- **Sin librerías UI** — nada de Angular Material, PrimeNG, Bootstrap, Tailwind, etc.  
  Toda la presentación debe resolverse con **HTML + CSS/SCSS puros**.
- Se permiten librerías de utilidades pequeñas (RxJS ya viene con Angular).

---

## 📦 Entregables

1. **Repositorio público en GitHub** con commits incrementales (no un único commit final).
2. **`README.md`** con:
   - Instrucciones de instalación (`npm install`) y ejecución (`ng serve`).
   - Versión de Node y Angular CLI utilizada.
   - Breve explicación de la **arquitectura de componentes** y la **estrategia de comunicación** elegida.
   - Cómo se simula la API (mock, interceptor o json-server).
3. **Código fuente** estructurado siguiendo buenas prácticas:
   - Carpetas por feature o por tipo (`components/`, `services/`, `models/`).
   - Nombres descriptivos.
   - Sin código muerto ni comentarios irrelevantes.

---

## 🌟 Puntos extra (opcionales)

Estos puntos no son obligatorios, pero suman:

- Uso de **standalone components** y la nueva **control flow syntax** (`@if`, `@for`).
- **Signals** para el manejo de estado reactivo.
- **Reactive Forms** si se incluye un formulario de reserva.
- **Tests unitarios** para el servicio o un componente clave (Jasmine/Karma o Jest).
- **Lazy loading** de un módulo o ruta.
- Animaciones suaves al cambiar entre lista y detalle.
- Despliegue en Vercel / Netlify / GitHub Pages con link funcional.

---

## 📊 Criterios de evaluación

| Criterio                                     | Peso |
| -------------------------------------------- | ---- |
| Cumplimiento de requisitos funcionales       | 30%  |
| Calidad del código y arquitectura            | 25%  |
| Comunicación entre componentes               | 15%  |
| Consumo de servicios y manejo de observables | 15%  |
| Diseño visual y responsividad                | 10%  |
| Documentación (README)                       | 5%   |

---

## ⏱️ Tiempo estimado

Entre **1 y 2 horas** de trabajo. No esperamos una aplicación de producción: priorizá **claridad, prolijidad y decisiones bien justificadas** por sobre la cantidad de features.

---

## 📤 Cómo entregar

Enviá el link del repositorio (y opcionalmente el deploy) por el medio acordado. Si tomaste decisiones de diseño no triviales o dejaste algo afuera por tiempo, mencionalo en el README — valoramos la honestidad técnica.

¡Éxitos! 🚀
