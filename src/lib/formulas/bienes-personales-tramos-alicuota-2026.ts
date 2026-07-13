export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function bienesPersonalesTramosAlicuota2026(i: Inputs): Outputs {
  const p=Number(i.patrimonio)||0; const v=Number(i.vivienda)||0;
  const MNI=384728044.57; const VIV_EX=1346548155.99;
  const vivExenta=Math.min(v,VIV_EX);
  const base=Math.max(0, p-vivExenta-MNI);
  let imp=0; let alic='0%';
  if (base>0) {
    if (base<=52664283.73) { imp=base*0.005; alic='0.5%'; }
    else if (base<=114105948.16) { imp=263321.42+(base-52664283.73)*0.0075; alic='0.75%'; }
    else { imp=724133.89+(base-114105948.16)*0.01; alic='1%'; }
  }
  const fmt=(n:number)=>'$'+Math.round(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const exento=Math.max(0, p-base);
  const efectiva=p>0 ? (imp/p)*100 : 0;
  const _insight = base>0
    ? {
        title: 'Cuánto pagás de Bienes Personales',
        text: `Sobre un patrimonio de **${fmt(p)}** tributás **${fmt(imp)}** (alícuota marginal **${alic}**), lo que representa una tasa efectiva del **${efectiva.toFixed(2)}%**. La porción gravada es **${fmt(base)}** tras descontar mínimo no imponible y vivienda exenta.`,
        tone: 'warn',
        icon: '🏛️',
      }
    : {
        title: 'No pagás Bienes Personales',
        text: `Tu patrimonio de **${fmt(p)}** queda íntegramente cubierto por el mínimo no imponible (**${fmt(MNI)}**)${vivExenta>0?` y la vivienda exenta (**${fmt(vivExenta)}**)`:''}, así que **no tributás** este año.`,
        tone: 'good',
        icon: '✅',
      };
  const _chart = base>0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Exento (MNI + vivienda)', value: Math.round(exento) },
      { label: 'Base gravada', value: Math.round(base) },
    ],
    prefix: '$',
    centerValue: fmt(p),
    centerLabel: 'Patrimonio',
    ariaLabel: `De un patrimonio de ${fmt(p)}, ${fmt(exento)} está exento y ${fmt(base)} queda gravado.`,
  } : undefined;
  const out: Outputs = { base:fmt(base), impuesto:fmt(imp), alicuota:alic, resumen:`Patrimonio $${p.toLocaleString('es-AR')}: impuesto $${imp.toFixed(0)} (${alic}).`, _insight };
  if (_chart) out._chart = _chart;
  return out;
}
