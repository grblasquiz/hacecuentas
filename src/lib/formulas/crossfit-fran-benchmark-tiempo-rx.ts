export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
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
    },
    pt: {
      elite: 'Elite',
      avanzado: 'Avançado',
      intermedio: 'Intermediário',
      principiante: 'Iniciante',
      iniciando: 'Começando',
      objetivo: 'Objetivo: reduzir 30 segundos em 3 meses com treino estruturado.',
    },
  } as const)[__lang];
  const s=Number(i.tiempoSegundos)||0;
  let n='', ref='';
  if(s<150){n=T.elite;ref='<2:30'}
  else if(s<240){n=T.avanzado;ref='<4:00'}
  else if(s<360){n=T.intermedio;ref='<6:00'}
  else if(s<480){n=T.principiante;ref='6-8 min'}
  else {n=T.iniciando;ref='>8 min'}
  return { nivel:n, referencia:ref, objetivoMejora:T.objetivo };
}
