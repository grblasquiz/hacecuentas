export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function dictadoVelocidadPalabrasEscucharIdioma(i: Inputs): Outputs {
  const n=String(i.nivel||'a1');
  // WPM objetivos basados en MCER y especificaciones Cambridge/IELTS:
  // A1≈75, A2≈95, B1≈115, B2≈145, C1≈175, C2≈200
  const w:Record<string,number>={a1:75,a2:95,b1:115,b2:145,c1:175,c2:200};
  const rep:Record<string,string>={a1:'4-5 reproducciones',a2:'3-4 reproducciones',b1:'2-3 reproducciones',b2:'2 reproducciones',c1:'1-2 reproducciones',c2:'1 reproducción'};
  const v=w[n]||75;
  const r=rep[n]||'2-3 reproducciones';
  const ejemplos:Record<string,string>={
    a1:'Slow News, Speakly Slow, VOA Special English',
    a2:'News in Slow English, VOA Learning English',
    b1:'BBC Learning English 6 Minute, noticias lentas',
    b2:'TED-Ed, podcasts educativos, Netflix dramas',
    c1:'BBC News, NPR, Joe Rogan (~180 WPM)',
    c2:'The Daily NYT, standup comedy, conversaciones nativas',
  };
  const ej=ejemplos[n]||'';
  const _insight={
    title:'Velocidad de dictado recomendada',
    text:`Para nivel **${n.toUpperCase()}** (MCER): dictá a **${v} palabras por minuto** con **${r}**. ` +
      (v<100
        ? `Contenido recomendado: ${ej}. Ritmo pausado, ideal para consolidar segmentación de palabras.`
        : v<150
          ? `Contenido recomendado: ${ej}. Ritmo cercano a medios formativos.`
          : `Contenido recomendado: ${ej}. Velocidad cercana a habla nativa (~150-160 WPM en conversación).`),
    tone:'neutral' as 'good'|'warn'|'neutral',
    icon:'🎧',
  };
  const _chart={
    type:'scale',
    marker:v,
    markerLabel:`${v} WPM`,
    min:50,
    segments:[
      { nombre:'Principiante (A1-A2)', max:100, color:'#bbf7d0', colorDark:'#15803d' },
      { nombre:'Intermedio (B1-B2)', max:150, color:'#86efac', colorDark:'#16a34a' },
      { nombre:'Avanzado (C1)', max:180, color:'#4ade80', colorDark:'#22c55e' },
      { nombre:'Nativo (C2+)', max:220, color:'#22c55e', colorDark:'#15803d' },
    ],
    ariaLabel:`Velocidad de dictado para ${n.toUpperCase()}: ${v} palabras por minuto.`,
  };
  return { wpm:`${v} WPM`, reproduc:r, resumen:`${n.toUpperCase()}: dictado a ${v} WPM — ${r}.`, _insight, _chart };
}
