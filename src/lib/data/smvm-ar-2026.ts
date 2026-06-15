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
 * Jun-2026: 367.800 / 200 = 1.839.
 *
 * NOTA: el tope de la prestación por desempleo (ANSES) NO es igual al SMVM
 * vigente — ANSES lo ajusta con ~1 mes de lag (jun-2026: SMVM $367.800 vs
 * techo desempleo $363.000). No reutilizar estas constantes para desempleo.
 */

// Valores oficiales junio 2026 — Res 9/2025 CNEPySMVyM (Boletín Oficial 03-12-2025).
export const SMVM_MENSUAL = 367_800;
export const SMVM_HORA = 1_839;
export const SMVM_FECHA = 'junio 2026 (Res 9/2025)';
export const SMVM_RESOLUCION = 'Resolución 9/2025 CNEPySMVyM';
