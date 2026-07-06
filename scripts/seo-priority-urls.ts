/**
 * URLs prioritarias del plan de recuperación GSC (julio 2026).
 *
 * Criterio: Google las probó entre abril y julio 2026 (posición 8-13,
 * impresiones reales, CTR bajo) — son la vía más corta para recuperar clicks.
 * Consumido por seo-audit.ts, seo-render-check.ts y seo-structured-data.ts.
 *
 * Los paths son las URLs CANÓNICAS finales (los alias 301 de GSC ya están
 * resueltos acá: combustible-viaje-auto → costo-viaje-combustible-kilometros,
 * mercadolibre → comision-venta-vendedor, etc.).
 */
export const PRIORITY_PATHS: string[] = [
  '/calculadora-conversor-metros-lineales-a-metros-cuadrados',
  '/dias-entre-dos-fechas',
  '/calculadora-comision-venta-vendedor',
  '/calculadora-edad-exacta',
  '/calculadora-calorias-quemadas-deporte',
  '/calculadora-pace-ritmo-running',
  '/calculadora-tiempo-lectura-paginas-estudio',
  '/calculadora-costo-m2-construccion-argentina',
  '/sueldo-en-mano-argentina',
  '/calculadora-estimador-costo-viaje-taxi-remis',
  '/simulador-jubilacion-anses',
  '/calculadora-indice-asistencia-faltas',
  '/calculadora-millas-latam-destino',
  '/calculadora-bebidas-evento-litros-por-persona',
  '/calculadora-twitter-x-monetizacion-ingreso',
  '/calculadora-duracion-bateria-mah-consumo',
  '/calculadora-palabras-paginas-conversor',
  '/calculadora-video-bitrate-tamano-archivo',
  '/calculadora-tejas-techo-m2',
  '/calculadora-sueldo-por-hora',
  '/calculadora-costo-por-kilometro-auto',
  '/calculadora-patente-auto-provincia',
  '/calculadora-aguinaldo-sac',
  '/calculadora-cuota-prestamo',
  '/calculadora-edad-humana-conejo-anos',
  '/calculadora-porcentajes',
  '/calculadora-costo-viaje-combustible-kilometros',
  '/calculadora-sellos-compra-inmueble-caba-pba',
  '/calculadora-propina-por-pais-viaje',
  '/calculadora-consumo-electrico-aparato-kwh-mes',
  '/calculadora-split-gastos-grupo-amigos',
  '/calculadora-conversion-medidas-cocina-tazas-gramos',
  '/calculadora-seguro-auto-estimado',
  '/blog',
];

/**
 * Aliases que GSC reportó con impresiones y que deben responder 301
 * hacia su canonical (verificados por seo-audit.ts con --live).
 */
export const GSC_ALIAS_301: Record<string, string> = {
  '/calculadora-combustible-viaje-auto': '/calculadora-costo-viaje-combustible-kilometros',
  '/calculadora-comision-mercadolibre-venta': '/calculadora-comision-venta-vendedor',
  '/calculadora-mercadolibre-comision-venta': '/calculadora-comision-venta-vendedor',
  '/calculadora-tiempo-lectura-libro-paginas': '/calculadora-tiempo-lectura-paginas-estudio',
  '/calculadora-dividir-gastos-viaje-amigos': '/calculadora-split-gastos-grupo-amigos',
  '/calculadora-seguro-auto-estimacion-precio': '/calculadora-seguro-auto-estimado',
  '/conversor-tazas-gramos-cocina-recetas': '/calculadora-conversion-medidas-cocina-tazas-gramos',
  '/calculadora-impuesto-sellos-inmueble-contrato': '/calculadora-sellos-compra-inmueble-caba-pba',
};
