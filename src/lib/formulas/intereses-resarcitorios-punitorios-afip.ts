export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function interesesResarcitoriosPunitoriosAfip(i: Inputs): Outputs {
  const d=Number(i.deuda)||0; const dias=Number(i.dias)||0;
  const res=d*0.06*(dias/30);
  const pun=d*0.08*(dias/30);
  const total=d+res;
  const fmt=(x:number)=>'$'+x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const pctSobreDeuda=d>0?((res/d)*100).toFixed(1).replace('.',','):'0';
  return {
    resarcitorios:fmt(res),
    punitorios:fmt(pun),
    totalAdeudar:fmt(total),
    resumen:`Deuda $${d.toLocaleString('es-AR')} × ${dias} días: total a regularizar $${total.toFixed(0)}.`,
    _insight: {
      title: 'Lo que suman los intereses',
      text: `Sobre una deuda de **${fmt(d)}** a ${dias} días, los intereses resarcitorios agregan **${fmt(res)}** (un **${pctSobreDeuda}%** extra) y llevan el total a regularizar a **${fmt(total)}**. Si AFIP inicia juicio de ejecución, los punitorios escalan a **${fmt(pun)}**.`,
      tone: 'warn',
      icon: '⚖️',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Deuda original', value: Math.round(d) },
        { label: 'Intereses resarcitorios', value: Math.round(res) },
      ],
      prefix: '$',
      centerValue: fmt(total),
      centerLabel: 'Total a regularizar',
      ariaLabel: `Total a regularizar de ${fmt(total)}: capital ${fmt(d)} más intereses resarcitorios ${fmt(res)}`,
    },
  };
}
