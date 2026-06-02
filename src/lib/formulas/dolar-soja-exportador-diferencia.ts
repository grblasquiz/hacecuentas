export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function dolarSojaExportadorDiferencia(i: Inputs): Outputs {
  const u=Number(i.usdExportado)||0; const dof=Number(i.dolarOficial)||0; const dex=Number(i.dolarExportador)||0;
  const pof=u*dof; const pex=u*dex; const dif=pex-pof;
  const pctExtra = dof > 0 ? (dex/dof-1)*100 : 0;
  const out: Outputs = { pesosOficial:`$${Math.round(pof).toLocaleString('es-AR')}`, pesosExportador:`$${Math.round(pex).toLocaleString('es-AR')}`, diferencial:`+$${Math.round(dif).toLocaleString('es-AR')} (${pctExtra.toFixed(1)}%)` };
  if (u > 0 && dof > 0 && dex > 0) {
    out._insight = {
      title: 'Diferencia por el dólar exportador',
      text: `Liquidar **US$ ${u.toLocaleString('es-AR')}** al dólar exportador ($${dex}) en vez del oficial ($${dof}) suma **$${Math.round(dif).toLocaleString('es-AR')}** extra, un **${pctExtra.toFixed(1)}%** más de pesos por el mismo volumen.`,
      tone: dif > 0 ? 'good' : 'neutral',
      icon: '🌾',
    };
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Al dólar oficial', value: Math.round(pof) },
        { label: 'Plus exportador', value: Math.round(dif) },
      ],
      prefix: '$',
      centerValue: `$${Math.round(pex).toLocaleString('es-AR')}`,
      centerLabel: 'Total liquidado',
      ariaLabel: `De los $${Math.round(pex).toLocaleString('es-AR')} liquidados, $${Math.round(pof).toLocaleString('es-AR')} salen al dólar oficial y $${Math.round(dif).toLocaleString('es-AR')} son el plus del exportador.`,
    };
  }
  return out;
}
