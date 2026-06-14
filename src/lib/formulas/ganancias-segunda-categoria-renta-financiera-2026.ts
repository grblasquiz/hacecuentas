/** Impuesto cedular renta financiera 2026 (intereses, dividendos, bonos) */
export interface Inputs { interesesPlazoFijoArs: number; interesesBonosUsd: number; dividendosArs: number; gananciaCompraventaCedearsUsd: number; tipoCambioCierre: number; minimoNoImponible: number; }
export interface Outputs { impuestoIntereses: number; impuestoDividendos: number; impuestoBonosUsd: number; impuestoCedears: number; impuestoTotal: number; baseImponibleTotal: number; explicacion: string; _chart?: any; _insight?: any; }
export function gananciasSegundaCategoriaRentaFinanciera2026(i: Inputs): Outputs {
  const intArs = Number(i.interesesPlazoFijoArs);
  const intUsd = Number(i.interesesBonosUsd);
  const div = Number(i.dividendosArs);
  const ceuUsd = Number(i.gananciaCompraventaCedearsUsd);
  const tc = Number(i.tipoCambioCierre);
  const minimo = Number(i.minimoNoImponible) || 0;
  if (tc <= 0) throw new Error('Ingresá tipo de cambio');
  // Alicuotas cedulares 2026 (Ley 27.430):
  //  - 5% sobre rentas de titulos/ON en pesos sin ajuste (excedente del MNI)
  //  - 15% sobre rentas en USD o con clausula de ajuste (al TC cierre)
  //  - 15% sobre compraventa en mercados del exterior (ADR)
  //  - 7% sobre dividendos de sociedades argentinas
  // EXENTOS (no se cargan aca): plazo fijo en pesos comun (Ley 27.541) y UVA (Ley 27.638);
  // compraventa de CEDEAR/acciones cursada en BYMA (art. 26 inc. u LIG).
  const baseArs = Math.max(0, intArs - minimo);
  const impInt = baseArs * 0.05;
  const impBonos = intUsd * tc * 0.15;
  const impDiv = div * 0.07;
  const impCedears = ceuUsd * tc * 0.15;
  const total = impInt + impBonos + impDiv + impCedears;
  const base = intArs + (intUsd * tc) + div + (ceuUsd * tc);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Títulos pesos (5%)', value: impInt },
      { label: 'Rentas USD (15%)', value: impBonos },
      { label: 'Dividendos (7%)', value: impDiv },
      { label: 'Exterior/ADR (15%)', value: impCedears },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Impuesto total',
    ariaLabel: 'Composición del impuesto cedular por tipo de renta financiera.',
  };
  return {
    impuestoIntereses: Number(impInt.toFixed(2)),
    impuestoDividendos: Number(impDiv.toFixed(2)),
    impuestoBonosUsd: Number(impBonos.toFixed(2)),
    impuestoCedears: Number(impCedears.toFixed(2)),
    impuestoTotal: Number(total.toFixed(2)),
    baseImponibleTotal: Number(base.toFixed(2)),
    explicacion: `Impuesto cedular total: $${total.toFixed(2)} sobre base gravada $${base.toFixed(2)}. Títulos/ON pesos (5%): $${impInt.toFixed(2)}. Rentas USD (15%): $${impBonos.toFixed(2)}. Dividendos AR (7%): $${impDiv.toFixed(2)}. Compraventa exterior/ADR (15%): $${impCedears.toFixed(2)}.`,
    _chart: chart,
  };
}
