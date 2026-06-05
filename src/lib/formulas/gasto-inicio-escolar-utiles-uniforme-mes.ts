export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function gastoInicioEscolarUtilesUniformeMes(i: Inputs): Outputs {
  const n=String(i.nivel||'primaria'); const p=String(i.privado||'no')==='si';
  // Valores en pesos argentinos (ARS), referencia canasta escolar 2026
  // Fuentes: INDEC canasta escolar, relevamientos FIEL y cámaras educativas
  const utiRange:Record<string,[number,number]>={
    inicial:[90000,130000],
    primaria:[200000,320000],
    secundaria:[350000,550000],
  };
  const uniRange:Record<string,[number,number]>={
    inicial:[40000,70000],
    primaria:[50000,90000],
    secundaria:[60000,110000],
  };
  const [uMin,uMax]=utiRange[n]||[200000,320000];
  const u=Math.round((uMin+uMax)/2);
  const [uniMin,uniMax]=uniRange[n]||[50000,90000];
  const uni=p?Math.round((uniMin+uniMax)/2):0;
  const total=u+uni;

  const fmt=(v:number)=>'$'+v.toLocaleString('es-AR');

  const _insight = {
    title: 'Estimación gasto inicio escolar 2026',
    text: p
      ? `Para ${n} en escuela **privada** estimás entre **${fmt(uMin+uniMin)}** y **${fmt(uMax+uniMax)}**: útiles ${fmt(uMin)}–${fmt(uMax)} más uniforme ${fmt(uniMin)}–${fmt(uniMax)}. El uniforme representa el **${Math.round(uni/total*100)}%** del total estimado.`
      : `Para ${n} en escuela **pública** el inicio ronda **${fmt(uMin)}–${fmt(uMax)}**, casi todo en útiles (sin uniforme obligatorio).`,
    tone: 'neutral',
    icon: '🎒',
  };
  const out: Outputs = {
    util: fmt(u),
    uniforme: fmt(uni),
    total: fmt(total),
    resumen: `${n} ${p?'privada':'pública'}: útiles ${fmt(u)} + uniforme ${fmt(uni)} = ${fmt(total)} estimado (ARS 2026).`,
    _insight,
  };
  if (uni > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [ { label: 'Útiles', value: u }, { label: 'Uniforme', value: uni } ],
      prefix: '$',
      centerValue: fmt(total),
      centerLabel: 'inicio escolar',
      ariaLabel: `Desglose del gasto de inicio escolar: útiles ${fmt(u)}, uniforme ${fmt(uni)}.`,
    };
  }
  return out;
}
