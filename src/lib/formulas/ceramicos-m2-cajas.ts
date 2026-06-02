export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function ceramicosM2Cajas(i: Inputs): Outputs {
  const m = Number(i.m2) || 0; const cpc = Number(i.m2PorCaja) || 1.5;
  const total_m2 = m * 1.10;
  const cajas = Math.ceil(total_m2 / cpc);
  const comprado = cajas * cpc;
  const sobrante = Math.max(0, comprado - m);
  const _insight = {
    title: 'Cuántas cajas comprar',
    text: `Para cubrir **${m} m²** comprá **${cajas} cajas** (${comprado.toFixed(1)} m²). Te quedan **${sobrante.toFixed(1)} m² de margen** para cortes, roturas y reposición futura.`,
    tone: 'neutral',
    icon: '🔲',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Superficie a cubrir', value: Number(m.toFixed(1)) },
      { label: 'Margen (cortes/descarte)', value: Number(sobrante.toFixed(1)) },
    ],
    prefix: '',
    centerValue: `${comprado.toFixed(1)} m²`,
    centerLabel: `${cajas} cajas`,
    ariaLabel: `${comprado.toFixed(1)} m² comprados: ${m.toFixed(1)} m² a cubrir más ${sobrante.toFixed(1)} m² de margen`,
  };
  return { cajas: cajas.toString(), m2Comprar: comprado.toFixed(1),
    resumen: `${cajas} cajas = ${comprado.toFixed(1)} m² (${m} m² + 10% descarte).`, _insight, _chart };
}
