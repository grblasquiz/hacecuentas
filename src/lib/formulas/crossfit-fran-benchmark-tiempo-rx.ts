export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function crossfitFranBenchmarkTiempoRx(i: Inputs): Outputs {
  const __lang = i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      elite: 'Elite',
      avanzado: 'Avanzado',
      intermedio: 'Intermedio',
      principiante: 'Principiante',
      iniciando: 'Iniciando',
      objetivo: 'Objetivo: bajar 30 segundos en 3 meses con entrenamiento estructurado.',
      insightTitle: 'Tu nivel en Fran (21-15-9 Rx)',
      insightText: (mmss: string, nivel: string, ref: string) => `Tu tiempo de **${mmss}** te ubica en nivel **${nivel}** (referencia ${ref}). En Fran cada segundo cuenta: la transición rápida entre thrusters y pull-ups es lo que más separa los niveles.`,
      markerLabel: 'Tu tiempo',
    },
    pt: {
      elite: 'Elite',
      avanzado: 'Avançado',
      intermedio: 'Intermediário',
      principiante: 'Iniciante',
      iniciando: 'Começando',
      objetivo: 'Objetivo: reduzir 30 segundos em 3 meses com treino estruturado.',
      insightTitle: 'Seu nível no Fran (21-15-9 Rx)',
      insightText: (mmss: string, nivel: string, ref: string) => `Seu tempo de **${mmss}** te coloca no nível **${nivel}** (referência ${ref}). No Fran cada segundo conta: a transição rápida entre thrusters e pull-ups é o que mais separa os níveis.`,
      markerLabel: 'Seu tempo',
    },
  } as const)[__lang];
  const s=Number(i.tiempoSegundos)||0;
  let n='', ref='';
  if(s<150){n=T.elite;ref='<2:30'}
  else if(s<240){n=T.avanzado;ref='<4:00'}
  else if(s<360){n=T.intermedio;ref='<6:00'}
  else if(s<480){n=T.principiante;ref='6-8 min'}
  else {n=T.iniciando;ref='>8 min'}
  const mmss = `${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
  const tone = s < 240 ? 'good' : 'neutral';
  const _insight = {
    title: T.insightTitle,
    text: T.insightText(mmss, n, ref),
    tone,
    icon: '🏋️',
  };
  const _chart = {
    type: 'scale',
    marker: s,
    markerLabel: T.markerLabel,
    min: 0,
    segments: [
      { nombre: T.elite, max: 150, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: T.avanzado, max: 240, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: T.intermedio, max: 360, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: T.principiante, max: 480, color: '#ea580c', colorDark: '#f97316' },
      { nombre: T.iniciando, max: Math.max(600, s + 30), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Tiempo ${mmss}: nivel ${n}.`,
  };
  return { nivel:n, referencia:ref, objetivoMejora:T.objetivo, _insight, _chart };
}
