/**
 * Hipoteca UVA Santander Argentina — sistema francés sobre capital en UVAs.
 * Tasa Santander UVA 2026 ~4.75% anual + UVA.
 * Seguro de vida ~0.035%/mes + seguro todo riesgo vivienda ~0.025%/mes.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }

export function hipotecaUvaSantander(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  const plazoAnios = Math.max(1, Number(i.plazoAnios) || 20);
  const tnaPct = Math.max(0, Number(i.tna) || 4.75);
  const uvaHoy = Math.max(1, Number(i.uvaActual) || 1400);

  if (monto <= 0) throw new Error('Ingresá el monto del préstamo');

  const capitalUvas = monto / uvaHoy;
  const n = plazoAnios * 12;
  const iMens = tnaPct / 100 / 12;
  const cuotaPuraUvas = capitalUvas * (iMens * Math.pow(1 + iMens, n)) / (Math.pow(1 + iMens, n) - 1);
  const cuotaPuraArs = cuotaPuraUvas * uvaHoy;

  const seguros = monto * 0.0006;
  const cuotaTotal = cuotaPuraArs + seguros;
  const cft = tnaPct + 1.3 + 0.7;
  const totalAPagar = cuotaTotal * n;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;

  // Composición de la cuota inicial: cuota pura + seguros
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cuota pura', value: Math.round(cuotaPuraArs) },
      { label: 'Seguros', value: Math.round(seguros) },
    ],
    prefix: '$',
    centerValue: fmt(cuotaTotal),
    centerLabel: 'Cuota inicial',
    ariaLabel: 'Composición de la cuota inicial: cuota pura y seguros',
  };

  // Insight: la cuota arranca en X pero se ajusta mensualmente por UVA (inflación).
  const segPct = seguros / cuotaTotal;
  const insight = {
    title: 'La cuota inicial es solo el punto de partida',
    text: `Arrancás pagando **${fmt(cuotaTotal)}/mes** (cuota pura ${fmt(cuotaPuraArs)} + seguros ${fmt(seguros)}, ~${Math.round(segPct * 100)}%). Como es UVA, **el monto en pesos sube cada mes con la inflación**: la tasa Santander ${tnaPct}% es solo el costo financiero real sobre el capital.`,
    tone: 'warn',
    icon: '🏦',
  };

  return {
    cuotaInicial: fmt(cuotaTotal),
    cuotaPura: fmt(cuotaPuraArs),
    seguros: fmt(seguros),
    cftUvaAprox: `${cft.toFixed(2)}%`,
    capitalUvas: `${capitalUvas.toFixed(2)} UVAs`,
    totalAproxPagado: fmt(totalAPagar),
    resumen: `Cuota inicial ${fmt(cuotaTotal)} ajustable por UVA. Tasa Santander ${tnaPct}% + UVA.`,
    _chart: chart,
    _insight: insight,
  };
}
