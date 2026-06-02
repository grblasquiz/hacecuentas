export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ensayosSemanalesMejorarWritingIdioma(i: Inputs): Outputs {
  const n=String(i.nivelMeta||'b1');
  const p:Record<string,[number,number]>={b1:[2,150],b2:[2,250],c1:[3,400],c2:[3,500]};
  const [num,pal]=p[n]||p.b1;
  const palSem = num * pal;
  const _insight = {
    title: 'Tu plan de escritura',
    text: `Para llegar a nivel **${n.toUpperCase()}** escribí **${num} ensayos/semana** de **${pal} palabras** cada uno: unas **${palSem.toLocaleString('es-AR')} palabras semanales** de práctica constante.`,
    tone: 'good',
    icon: '✍️',
  };
  return { ensayosSem:num.toString(), palabras:`${pal} palabras c/u`, resumen:`Meta ${n.toUpperCase()}: ${num} ensayos/sem × ${pal} palabras.`, _insight };
}
