export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function gastosEscriturarViviendaPrimeraCasa(i: Inputs): Outputs {
  const v=Number(i.valorCasa)||0;
  const sen=v*0.15;
  const escr=v*0.07;
  const mue=Math.min(v*0.05,5000000);
  const tot=sen+escr+mue;
  const fmt=(x:number)=>'$'+x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const pctSobreCasa = v > 0 ? (tot / v) * 100 : 0;
  const _insight = {
    title: 'Tu desembolso inicial',
    text: `Para una casa de **${fmt(v)}** necesitás juntar unos **${fmt(tot)}** de entrada (${pctSobreCasa.toFixed(0)}% del valor): ${fmt(sen)} de seña, ${fmt(escr)} de escritura y ${fmt(mue)} de muebles.`,
    tone: 'warn',
    icon: '🔑',
  };
  const _chart = v > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Seña', value: Math.round(sen) },
      { label: 'Escritura', value: Math.round(escr) },
      { label: 'Muebles', value: Math.round(mue) },
    ],
    prefix: '$',
    centerValue: fmt(tot),
    centerLabel: 'inicial',
    ariaLabel: `Desglose del desembolso inicial: seña ${fmt(sen)}, escritura ${fmt(escr)}, muebles ${fmt(mue)}.`,
  } : undefined;
  return { senia:fmt(sen), gastosEscritura:fmt(escr), muebles:fmt(mue), totalInicial:fmt(tot), resumen:`Casa $${v.toLocaleString('es-AR')}: desembolso inicial ~$${tot.toFixed(0)}.`, _insight, _chart };
}
