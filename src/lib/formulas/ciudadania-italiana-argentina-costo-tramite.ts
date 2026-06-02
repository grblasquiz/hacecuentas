export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function ciudadaniaItalianaArgentinaCostoTramite(i: Inputs): Outputs {
  const v=String(i.viaConsulado||'consulado'); const d=Number(i.documentos)||8;
  const cons=v==='consulado'?300:0;
  const trad=d*35000;
  const apost=d*20000;
  const gest=500000;
  const consArs=cons*1400;
  const total=trad+apost+gest+consArs;
  const fmtArs=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const viaLabel=v==='consulado'?'por consulado':'por vía judicial';
  const _insight = {
    title: 'Costo estimado del trámite',
    text: `Tramitar la ciudadanía italiana **${viaLabel}** con **${d} documento${d!==1?'s':''}** sale alrededor de **${fmtArs(total)}**. El grueso se lo lleva la **gestoría/honorarios (${fmtArs(gest)})**, seguido de traducciones y apostillas que dependen de cuántos documentos juntes.`,
    tone: 'warn',
    icon: '🇮🇹',
  };
  const slices = [
    { label: 'Gestoría/honorarios', value: gest },
    { label: 'Traducciones', value: trad },
    { label: 'Apostillas', value: apost },
  ];
  if (consArs > 0) slices.push({ label: 'Arancel consular', value: consArs });
  const _chart = {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: fmtArs(total),
    centerLabel: 'Total',
    ariaLabel: `Costo total ${fmtArs(total)}: gestoría ${fmtArs(gest)}, traducciones ${fmtArs(trad)}, apostillas ${fmtArs(apost)}${consArs>0?`, arancel consular ${fmtArs(consArs)}`:''}.`,
  };
  return { consulado:v==='consulado'?'Arancel EUR 300':'No aplica', traducciones:'$'+trad.toLocaleString('es-AR'), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Ciudadanía italiana ${v}: ~$${total.toFixed(0)} total.`, _insight, _chart };
}
