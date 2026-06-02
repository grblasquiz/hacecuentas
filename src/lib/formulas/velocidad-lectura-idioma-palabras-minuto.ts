export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function velocidadLecturaIdiomaPalabrasMinuto(i: Inputs): Outputs {
  const n=String(i.nivel||'c1');
  const w:Record<string,number>={nativo:250,c2:200,c1:150,b2:100,b1:80,a2:40};
  const v=w[n]||100;
  const pctNum=v/250*100;
  const pct=pctNum.toFixed(0);
  const tone: 'good' | 'warn' | 'neutral' = pctNum >= 80 ? 'good' : pctNum >= 50 ? 'neutral' : 'warn';
  return {
    wpm:`${v} WPM`,
    vsNativo:`${pct}%`,
    resumen:`Nivel ${n}: ~${v} WPM (${pct}% velocidad nativa).`,
    _insight: {
      title: 'Velocidad de lectura por nivel',
      text: `En nivel **${n.toUpperCase()}** se lee a unas **${v} palabras por minuto**, el **${pct}%** de la velocidad de un lector nativo (~250 WPM). Cuanto mayor el dominio del idioma, menos releés y más rápido procesás.`,
      tone,
      icon: '🌐',
    },
  };
}
