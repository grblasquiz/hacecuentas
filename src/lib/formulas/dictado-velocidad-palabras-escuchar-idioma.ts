export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function dictadoVelocidadPalabrasEscucharIdioma(i: Inputs): Outputs {
  const n=String(i.nivel||'a1');
  const w:Record<string,number>={a1:60,a2:70,b1:90,b2:120,c1:140,c2:160};
  const v=w[n]||60;
  const rep=v<90?'2-3 reproducciones':'1-2 reproducciones';
  const ppm=Math.round(v/60*10)/10; // palabras por minuto de habla natural ronda 140-160
  const _insight={
    title:'Tu velocidad de dictado',
    text:`Para nivel **${n.toUpperCase()}** conviene dictar a **${v} palabras por minuto** con **${rep}**. ` +
      (v<90
        ? `Es un ritmo pausado: a esta altura el oído todavía necesita repetir para procesar cada frase.`
        : v<140
          ? `Ya es un ritmo cercano al habla real (~150 WPM); una o dos pasadas alcanzan.`
          : `Casi velocidad nativa (~${v} WPM): apuntás a comprensión en tiempo real, sin muletas de repetición.`),
    tone:'neutral' as 'good'|'warn'|'neutral',
    icon:'🎧',
  };
  const _chart={
    type:'scale',
    marker:v,
    markerLabel:`${v} WPM`,
    min:40,
    segments:[
      { nombre:'Principiante', max:80, color:'#bbf7d0', colorDark:'#15803d' },
      { nombre:'Intermedio', max:110, color:'#86efac', colorDark:'#16a34a' },
      { nombre:'Avanzado', max:140, color:'#4ade80', colorDark:'#22c55e' },
      { nombre:'Nativo', max:180, color:'#22c55e', colorDark:'#15803d' },
    ],
    ariaLabel:`Velocidad de dictado para ${n.toUpperCase()}: ${v} palabras por minuto.`,
  };
  return { wpm:`${v} WPM`, reproduc:rep, resumen:`${n.toUpperCase()}: dictado ${v} WPM, ${rep}.`, _insight, _chart };
}
