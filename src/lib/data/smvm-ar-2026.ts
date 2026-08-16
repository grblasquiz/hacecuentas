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
 * techo desempleo $363.000). Para desempleo usar DESEMPLEO_PISO/DESEMPLEO_TECHO
 * (abajo), nunca SMVM_MENSUAL.
 */

// Valores oficiales junio 2026 — Res 9/2025 CNEPySMVyM (Boletín Oficial 03-12-2025).
export const SMVM_MENSUAL = 376_600;
export const SMVM_HORA = 1_883;
export const SMVM_FECHA = 'agosto 2026';
export const SMVM_RESOLUCION = 'Resolución 9/2025 CNEPySMVyM';

/**
 * Topes de la PRESTACIÓN POR DESEMPLEO (ANSES, Ley 24.013 / Decreto 267/2006).
 * Cuantía = 75% del promedio de las mejores 6 remuneraciones, acotada entre un
 * piso y un techo que ANSES fija por resolución. Equivalen a ~50%/100% del SMVM,
 * pero ANSES los aplica con rezago: jun-2026 = $181.500/$363.000 (= SMVM de mayo),
 * mientras el SMVM de junio ya es $367.800. ⚠️ ACTUALIZAR mensualmente.
 */
export const DESEMPLEO_PISO = 181_500;   // piso ANSES jun-2026
export const DESEMPLEO_TECHO = 363_000;  // techo ANSES jun-2026
