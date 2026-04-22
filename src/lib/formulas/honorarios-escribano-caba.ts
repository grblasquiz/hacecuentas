/**
 * Honorarios Escribano CABA — compraventa inmueble.
 * Tabla escalonada orientativa Colegio de Escribanos de CABA 2026.
 * Sobre valor de escritura: 1.25% hasta 1er tramo, decrece en tramos superiores.
 * Luego IVA 21% + aportes Caja Notarial ~10% s/ honorarios.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function honorariosEscribanoCaba(i: Inputs): Outputs {
  const v = Math.max(0, Number(i.valorEscritura) || 0);
  if (v <= 0) throw new Error('Ingresá el valor de escritura');

  // Escala oficial aproximada CABA 2026 (ARS):
  // hasta 30M → 1.25%
  // 30M-100M → 30M*1.25% + exceso*1.00%
  // 100M-300M → tope anterior + exceso*0.85%
  // >300M → tope anterior + exceso*0.70%
  let honorarios = 0;
  const T1 = 30_000_000, T2 = 100_000_000, T3 = 300_000_000;
  if (v <= T1) honorarios = v * 0.0125;
  else if (v <= T2) honorarios = T1 * 0.0125 + (v - T1) * 0.01;
  else if (v <= T3) honorarios = T1 * 0.0125 + (T2 - T1) * 0.01 + (v - T2) * 0.0085;
  else honorarios = T1 * 0.0125 + (T2 - T1) * 0.01 + (T3 - T2) * 0.0085 + (v - T3) * 0.007;

  const iva = honorarios * 0.21;
  const aportes = honorarios * 0.10; // Caja Notarial + Colegio
  const gastosFijos = 180000; // sellados, inscripción, certificados aprox.
  const total = honorarios + iva + aportes + gastosFijos;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  return {
    honorarios: fmt(honorarios),
    iva: fmt(iva),
    aportes: fmt(aportes),
    gastosFijos: fmt(gastosFijos),
    total: fmt(total),
    resumen: `Honorarios ${fmt(honorarios)} + IVA 21% + aportes ~10% + gastos. Total estimado ${fmt(total)}.`,
  };
}
