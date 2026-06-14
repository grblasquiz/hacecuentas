export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function interesesResarcitoriosPunitoriosAfip(i: Inputs): Outputs {
  const d=Number(i.deuda)||0; const dias=Number(i.dias)||0;
  // Tasas mensuales en pesos vigentes desde 1/7/2025 (Res. 823/2025 Min. Economía).
  // Se actualizan bimestralmente (Res. 3/2024): resarcitorios = 1,3× y punitorios = 1,5× la tasa
  // activa de descubierto en cta. cte. del BNA. Verificar el bimestre vigente en la calculadora de ARCA.
  const TASA_RESARCITORIA_MENSUAL = 0.0275; // 2,75%
  const TASA_PUNITORIA_MENSUAL = 0.035;     // 3,50%
  const res=d*TASA_RESARCITORIA_MENSUAL*(dias/30);
  const pun=d*TASA_PUNITORIA_MENSUAL*(dias/30);
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
