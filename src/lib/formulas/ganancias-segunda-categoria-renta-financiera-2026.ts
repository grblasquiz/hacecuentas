/** Impuesto cedular renta financiera 2026 (intereses, dividendos, bonos) */
export interface Inputs { interesesPlazoFijoArs: number; interesesBonosUsd: number; dividendosArs: number; gananciaCompraventaCedearsUsd: number; tipoCambioCierre: number; minimoNoImponible: number; }
export interface Outputs { impuestoIntereses: number; impuestoDividendos: number; impuestoBonosUsd: number; impuestoCedears: number; impuestoTotal: number; baseImponibleTotal: number; explicacion: string; }
export function gananciasSegundaCategoriaRentaFinanciera2026(i: Inputs): Outputs {
  const intArs = Number(i.interesesPlazoFijoArs);
  const intUsd = Number(i.interesesBonosUsd);
  const div = Number(i.dividendosArs);
  const ceuUsd = Number(i.gananciaCompraventaCedearsUsd);
  const tc = Number(i.tipoCambioCierre);
  const minimo = Number(i.minimoNoImponible) || 0;
  if (tc <= 0) throw new Error('Ingresá tipo de cambio');
  // Alicuotas 2026: 5% pesos, 15% USD, dividendos 7% (régimen general)
  const baseArs = Math.max(0, intArs - minimo);
  const impInt = baseArs * 0.05;
  const impBonos = intUsd * tc * 0.15;
  const impDiv = div * 0.07;
  const impCedears = ceuUsd * tc * 0.15;
  const total = impInt + impBonos + impDiv + impCedears;
  const base = intArs + (intUsd * tc) + div + (ceuUsd * tc);
  return {
    impuestoIntereses: Number(impInt.toFixed(2)),
    impuestoDividendos: Number(impDiv.toFixed(2)),
    impuestoBonosUsd: Number(impBonos.toFixed(2)),
    impuestoCedears: Number(impCedears.toFixed(2)),
    impuestoTotal: Number(total.toFixed(2)),
    baseImponibleTotal: Number(base.toFixed(2)),
    explicacion: `Impuesto cedular total: $${total.toFixed(2)} sobre base $${base.toFixed(2)}. Plazo fijo (5%): $${impInt.toFixed(2)}. Bonos USD (15%): $${impBonos.toFixed(2)}. Dividendos (7%): $${impDiv.toFixed(2)}. CEDEAR (15%): $${impCedears.toFixed(2)}.`,
  };
}
