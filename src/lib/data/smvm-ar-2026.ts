/**
 * Salario Mínimo Vital y Móvil (SMVM) — fuente única Argentina.
 *
 * Lo fija el Consejo Nacional del Empleo, la Productividad y el SMVM
 * (CNEPySMVyM) por resolución. La Res 9/2025 estableció un cronograma de
 * aumentos mensuales entre noviembre 2025 y agosto 2026.
 *
 * ⚠️ ACTUALIZAR mensualmente. El fetcher `scripts/update-data/fetchers/smvm.ts`
 * patchea SMVM_MENSUAL, SMVM_HORA y SMVM_FECHA como literales (preservando los
 * underscores de miles) y toca el `lastUpdated` del calc salario-minimo.
 *
 * Relación oficial: el valor hora jornalizado = mensual / 200 (8 h × 25 días).
 * Ago-2026: 376.600 / 200 = 1.883.
 *
 * La prestación por desempleo usa como piso el 50% del SMVM vigente y como
 * techo el 100%, según el art. 2 de la Resolución 9/2025.
 */

// Valores oficiales agosto 2026 — Res 9/2025 CNEPySMVyM (Boletín Oficial 03-12-2025).
export const SMVM_MENSUAL = 376_600;
export const SMVM_HORA = 1_883;
export const SMVM_FECHA = 'agosto 2026';
export const SMVM_RESOLUCION = 'Resolución 9/2025 CNEPySMVyM';

/**
 * Topes de la PRESTACIÓN POR DESEMPLEO (ANSES, Ley 24.013 / Decreto 267/2006).
 * Cuantía = 75% del promedio de las mejores 6 remuneraciones, acotada entre un
 * piso y un techo equivalentes al 50%/100% del SMVM vigente.
 */
export const DESEMPLEO_PISO = 188_300;   // 50% del SMVM, agosto 2026
export const DESEMPLEO_TECHO = 376_600;  // 100% del SMVM, agosto 2026
