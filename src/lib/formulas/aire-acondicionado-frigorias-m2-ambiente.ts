export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function aireAcondicionadoFrigoriasM2Ambiente(i: Inputs): Outputs {
  const m=Number(i.m2)||0; const o=String(i.orientacion||'norte_sur'); const p=String(i.piso||'intermedio');
  const base=o==='este_oeste'?150:100;
  const mult=p==='ultimo'?1.25:1;
  const fg=m*base*mult;
  const btu=fg*4;
  const esUltimo=p==='ultimo';
  const esCaluroso=o==='este_oeste';
  const fgFmt=Math.round(fg).toLocaleString('es-AR');
  const btuFmt=Math.round(btu).toLocaleString('es-AR');
  const _insight={
    title:'Frigorías recomendadas',
    text:`Para **${m} m²** necesitás unas **${fgFmt} frigorías** (~${btuFmt} BTU). `+(esUltimo?`Al ser **último piso** sumamos **+25%** por el calor que entra desde el techo. `:'')+(esCaluroso?`La orientación **este/oeste** recibe sol directo, por eso se calcula con 150 fg/m² en vez de 100. `:'')+`Elegí un equipo que iguale o supere ese valor para que no trabaje al límite.`,
    tone:(esUltimo||esCaluroso?'warn':'neutral') as const,
    icon:'❄️',
  };
  return { frigoriasRecomendadas:`${fgFmt} fg`, btuEquivalente:`${btuFmt} BTU`, observacion:esUltimo?'Piso último: +25% por techo':'Ambiente estándar', _insight };
}
