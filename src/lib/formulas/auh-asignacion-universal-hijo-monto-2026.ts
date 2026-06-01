export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function auhAsignacionUniversalHijoMonto2026(i: Inputs): Outputs {
  const h=Number(i.hijos)||0; const e=String(i.embarazo||'no')==='si';
  const porHijo=65000;
  const total=h*porHijo+(e?porHijo:0);
  const retenido=total*0.20;
  const cobro=total*0.80;
  const fmt=(n: number)=>'$'+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');

  const _insight = {
    title: 'El 20% se retiene hasta la Libreta',
    text: `Por ${h} hijo${h===1?'':'s'}${e?' más el embarazo':''} la AUH suma **${fmt(total)}/mes**, pero ANSES deposita solo el **80% (${fmt(cobro)})**. El **20% restante (${fmt(retenido)})** se acumula y se libera al presentar la Libreta AUH con controles de salud y escolaridad.`,
    tone: 'warn' as const,
    icon: '👨‍👩‍👧',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cobro mensual (80%)', value: Math.round(cobro) },
      { label: 'Retenido p/Libreta (20%)', value: Math.round(retenido) },
    ],
    prefix: '$',
    centerValue: fmt(total),
    centerLabel: 'AUH total/mes',
    ariaLabel: `Del total mensual de ${fmt(total)}, ${fmt(cobro)} se cobran y ${fmt(retenido)} quedan retenidos hasta presentar la Libreta.`,
  };

  return { auhMensual:fmt(total), retenido:fmt(retenido), cobroEfectivo:fmt(cobro), resumen:`${h} hijos${e?' + embarazo':''}: AUH $${total.toFixed(0)}/mes, cobro efectivo $${cobro.toFixed(0)}.`, _insight, _chart };
}
