export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function gastoInicioEscolarUtilesUniformeMes(i: Inputs): Outputs {
  const n=String(i.nivel||'primaria'); const p=String(i.privado||'no')==='si';
  const uti:Record<string,number>={inicial:75,primaria:150,secundaria:225};
  const uni=p?300:0;
  const u=uti[n]||150;
  const total=u+uni;
  const _insight = {
    title: 'Tu gasto de inicio escolar',
    text: p
      ? `Para ${n} en escuela **privada** estimás **$${total}**: $${u} de útiles más $${uni} de uniforme. El uniforme se lleva el **${Math.round(uni/total*100)}%** del total.`
      : `Para ${n} en escuela **pública** el inicio ronda **$${total}**, casi todo en útiles (no hay uniforme obligatorio).`,
    tone: 'neutral',
    icon: '🎒',
  };
  const out: Outputs = { util:`$${u}`, uniforme:`$${uni}`, total:`$${total}`, resumen:`${n} ${p?'privada':'pública'}: útiles $${u} + uniforme $${uni} = $${total}.`, _insight };
  if (uni > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [ { label: 'Útiles', value: u }, { label: 'Uniforme', value: uni } ],
      prefix: '$',
      centerValue: `$${total}`,
      centerLabel: 'inicio escolar',
      ariaLabel: `Desglose del gasto de inicio escolar: útiles $${u}, uniforme $${uni}.`,
    };
  }
  return out;
}
