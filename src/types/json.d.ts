/**
 * Declaración global para que TypeScript permita importar archivos JSON
 * como módulos tipados. Lo usa el interceptor para leer bookings.json
 * sin pasar por una request real.
 */
declare module '*.json' {
  const value: unknown;
  export default value;
}
