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
  // Clústeres de consultas GSC 30-abr–29-jul 2026 consolidados en hubs canónicos.
  '/embarazo/dias-fertiles',
  '/trabajo/indemnizacion-por-despido',
  '/mx/trabajo/sueldo-neto',
  '/salud/peso-ideal-imc',
  '/inversiones/interes-compuesto',
  '/auto/auto-o-uber',
  '/matematica/potencias-y-raices',
  '/matematica/regla-de-tres',
  '/valores-bcra',
  '/tecnologia/impresion-3d',
  '/hogar/huella-de-carbono',
  '/estudio/cuanto-tardo-en-leer',
  '/mx/impuestos/isr-por-mi-cuenta',
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
  '/calculadora-prestamo-personal-cuota-mensual',
  '/calculadora-edad-humana-conejo-anos',
  '/calculadora-porcentajes',
  '/calculadora-costo-viaje-combustible-kilometros',
  '/calculadora-arba-sellos-inmobiliarios-pba-compraventa',
  '/calculadora-propina-por-pais-viaje',
  '/calculadora-consumo-electrico-aparato-kwh-mes',
  '/calculadora-split-gastos-grupo-amigos',
  '/calculadora-conversion-medidas-cocina-tazas-gramos',
  '/calculadora-seguro-auto-estimado',
  '/blog',
];

/**
 * Intenciones detectadas en GSC y landing canónica que debe absorber todas
 * sus variantes. Evita volver a crear calculadoras podadas por cada keyword.
 */
export const GSC_QUERY_TARGETS: Record<string, string[]> = {
  '/embarazo/dias-fertiles': ['calcular ciclo menstrual', 'calculadora menstrual', 'ciclo menstrual calcular'],
  '/trabajo/indemnizacion-por-despido': ['calcular indemnización', 'calcular indemnizacion', 'calculadora de liquidación', 'calculadora de finiquito'],
  '/mx/trabajo/sueldo-neto': ['sueldo neto mexico', 'sueldo bruto a neto', 'calculadora impuestos sueldo'],
  '/salud/peso-ideal-imc': ['imc tabla', 'tabla de peso', 'tabla de peso y altura'],
  '/inversiones/interes-compuesto': ['tna a tea', 'calculadora tna a tea', 'tea a tem'],
  '/auto/auto-o-uber': ['precio remis x km 2026', 'cuanto cuesta el km de remis', 'cuanto sale el kilometro en remis'],
  '/matematica/potencias-y-raices': ['mcm', 'mínimo común múltiplo', 'que es el mcm', 'como calcular el mcm'],
  '/matematica/regla-de-tres': ['regla de 3', 'regla de tres', 'como hacer una regla de tres'],
  '/valores-bcra': ['uva bcra', 'valor uva bcra', 'valor uva hoy bcra', 'badlar hoy'],
  '/tecnologia/impresion-3d': ['coste de impresora 3d por hora', 'impresora 3d coste por hora'],
  '/hogar/huella-de-carbono': ['cuantos arboles debo plantar para compensar mi huella de carbono', 'arboles necesarios para compensar emisiones co2'],
  '/estudio/cuanto-tardo-en-leer': ['palabras por minuto', 'palabras por minuto lectura', 'lectura de palabras por minuto'],
  '/mx/impuestos/isr-por-mi-cuenta': ['calculadora de impuestos rif', 'calculadora rif de impuestos', 'calculadora rif'],
};

/**
 * Aliases que GSC reportó con impresiones y que deben responder 301
 * hacia su canonical (verificados por seo-audit.ts con --live).
 *
 * NOTA: /calculadora-combustible-viaje-auto, /conversor-tazas-gramos-cocina-recetas
 * y /calculadora-impuesto-sellos-inmueble-contrato NO van acá: son páginas vivas
 * con canonicalSlug (patrón deliberado de consolidación jul-2026 — 200 + rel=canonical
 * a la cabeza de familia, sin 301). El audit las reporta como canonical_consolidation.
 */
export const GSC_ALIAS_301: Record<string, string> = {
  '/calculadora-comision-mercadolibre-venta': '/calculadora-comision-venta-vendedor',
  '/calculadora-mercadolibre-comision-venta': '/calculadora-comision-venta-vendedor',
  '/calculadora-tiempo-lectura-libro-paginas': '/calculadora-tiempo-lectura-paginas-estudio',
  '/calculadora-dividir-gastos-viaje-amigos': '/calculadora-split-gastos-grupo-amigos',
  '/calculadora-seguro-auto-estimacion-precio': '/calculadora-seguro-auto-estimado',
};
