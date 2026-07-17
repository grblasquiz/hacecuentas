export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/** Estimación transparente: el RPM se carga manualmente porque Meta no publica una tarifa fija. */
export function facebookIngresosVideos(i: Inputs): Outputs {
  const vistas = Math.max(0, Number(i.vistasMensuales) || 0);
  const rpmUsd = Math.max(0, Number(i.rpmUsd) || 0);
  const usdArs = Math.max(0, Number(i.usdArs) || 0);
  const brutoUsd = (vistas / 1000) * rpmUsd;
  const brutoArs = brutoUsd * usdArs;
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  return {
    ingresoUSD: `US$ ${brutoUsd.toFixed(2)}`,
    ingresoARS: `$ ${fmt.format(brutoArs)}`,
    rpmAplicado: `US$ ${rpmUsd.toFixed(2)} por 1.000 vistas`,
    vistasMonetizables: Math.round(vistas),
    _insight: {
      title: `Estimación: US$ ${brutoUsd.toFixed(2)} al mes`,
      text: `Con **${fmt.format(vistas)} vistas** y el RPM que cargaste (**US$ ${rpmUsd.toFixed(2)}**), la estimación bruta es **US$ ${brutoUsd.toFixed(2)}**. No es una tarifa prometida: la monetización, elegibilidad, país de la audiencia, formato y fill publicitario cambian el resultado real en Meta.`,
      tone: vistas >= 100000 ? 'good' : 'neutral',
      icon: '▶️',
    },
  };
}
