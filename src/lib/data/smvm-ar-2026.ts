/**
 * Salario Mínimo Vital y Móvil (SMVM) — fuente única Argentina.
 *
 * Lo fija el Consejo Nacional del Empleo, la Productividad y el SMVM
 * (CNEPySMVyM) por resolución. La Resolución 4/2026 fijó el cronograma desde septiembre de 2026.
 * Fuente: https://www.argentina.gob.ar/normativa/nacional/norma-429565/texto
 *
 * ⚠️ ACTUALIZAR mensualmente. El fetcher `scripts/update-data/fetchers/smvm.ts`
 * patchea SMVM_MENSUAL, SMVM_HORA y SMVM_FECHA como literales (preservando los
 * underscores de miles) y toca el `lastUpdated` del calc salario-minimo.
 *
 * Relación oficial: el valor hora jornalizado = mensual / 200 (8 h × 25 días).
 * Sep-2026: 383.800 / 200 = 1.919.
 *
 * La prestación por desempleo usa como piso el 50% del SMVM vigente y como
 * techo el 100%, según el art. 2 de la Resolución 4/2026.
 */

// Valores oficiales septiembre 2026 — Res 4/2026 CNEPySMVyM (Boletín Oficial 02-09-2026).
export const SMVM_MENSUAL = 383_800;
export const SMVM_HORA = 1_919;
export const SMVM_FECHA = 'septiembre 2026';
export const SMVM_RESOLUCION = 'Resolución 4/2026 CNEPySMVyM';

/**
 * Topes de la PRESTACIÓN POR DESEMPLEO (ANSES, Ley 24.013 / Decreto 267/2006).
 * Cuantía = 75% del promedio de las mejores 6 remuneraciones, acotada entre un
 * piso y un techo equivalentes al 50%/100% del SMVM vigente.
 */
export const DESEMPLEO_PISO = 191_900;   // 50% del SMVM, septiembre 2026
export const DESEMPLEO_TECHO = 383_800;  // 100% del SMVM, septiembre 2026
