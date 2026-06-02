/**
 * Hipoteca Banco Ciudad Procrear — línea UVA subsidiada.
 * Tasa Procrear ~3.5% anual + UVA (beneficiarios ANSES/cupo subsidio).
 * Incluye bonificación parcial de seguro si calificás para subsidio.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

export function hipotecaCiudadProcrear(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  const plazoAnios = Math.max(1, Number(i.plazoAnios) || 20);
  const tnaPct = Math.max(0, Number(i.tna) || 3.5);
  const uvaHoy = Math.max(1, Number(i.uvaActual) || 1400);
  const tieneSubsidio = String(i.subsidio || 'no') === 'si';

  if (monto <= 0) throw new Error('Ingresá el monto del préstamo');

  const capitalUvas = monto / uvaHoy;
  const n = plazoAnios * 12;
  const iMens = tnaPct / 100 / 12;
  const cuotaPuraUvas = capitalUvas * (iMens * Math.pow(1 + iMens, n)) / (Math.pow(1 + iMens, n) - 1);
  const cuotaPuraArs = cuotaPuraUvas * uvaHoy;

  const seguros = monto * (tieneSubsidio ? 0.0003 : 0.0006);
  const cuotaTotal = cuotaPuraArs + seguros;
  const cft = tnaPct + 1.0 + 0.5;
  const subsidioMensual = tieneSubsidio ? cuotaTotal * 0.2 : 0;
  const cuotaConSubsidio = cuotaTotal - subsidioMensual;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;

  const _insight = {
    title: 'Tu cuota Procrear',
    text: tieneSubsidio
      ? `Tu cuota inicial es **${fmt(cuotaConSubsidio)}** gracias al **subsidio ANSES** de **${fmt(subsidioMensual)}/mes** (sin él pagarías ${fmt(cuotaTotal)}). Ojo: al ser **UVA**, la cuota se ajusta por inflación cada mes, así que en pesos irá subiendo con el tiempo.`
      : `Tu cuota inicial es **${fmt(cuotaTotal)}** (capital + interés ${tnaPct}% más **${fmt(seguros)}** de seguros). Al ser un préstamo **UVA**, la cuota se ajusta por inflación: en pesos irá creciendo mes a mes, algo a contemplar en tu presupuesto.`,
    tone: 'warn' as const,
    icon: '🏠',
  };

  // Donut: composición de la cuota total (capital+interés + seguros = cuota total mensual)
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital + interés', value: Math.round(cuotaPuraArs) },
      { label: 'Seguros', value: Math.round(seguros) },
    ],
    prefix: '$',
    centerValue: fmt(cuotaTotal),
    centerLabel: 'Cuota mensual',
    ariaLabel: `La cuota mensual de ${fmt(cuotaTotal)} se compone de ${fmt(cuotaPuraArs)} de capital más interés y ${fmt(seguros)} de seguros.`,
  };

  return {
    cuotaInicial: fmt(cuotaConSubsidio),
    cuotaSinSubsidio: fmt(cuotaTotal),
    seguros: fmt(seguros),
    subsidioAnses: tieneSubsidio ? fmt(subsidioMensual) : 'No aplica',
    cftUvaAprox: `${cft.toFixed(2)}%`,
    capitalUvas: `${capitalUvas.toFixed(2)} UVAs`,
    resumen: `Cuota inicial ${fmt(cuotaConSubsidio)}${tieneSubsidio ? ' (con subsidio ANSES)' : ''}. Línea Procrear Banco Ciudad tasa ${tnaPct}% + UVA.`,
    _insight,
    _chart,
  };
}
