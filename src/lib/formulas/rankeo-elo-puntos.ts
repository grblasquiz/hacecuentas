/** Calculadora de ELO y Rating */
export interface Inputs {
  eloPropio: number;
  eloRival: number;
  resultado: string;
  kFactor: number;
  __lang?: string;
}
export interface Outputs {
  nuevoElo: number;
  cambio: number;
  probabilidadVictoria: number;
  mensaje: string;
}

export function rankeoEloPuntos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorEloPropio: 'Ingresá tu ELO actual',
      errorEloRival: 'Ingresá el ELO del rival',
      errorResultado: 'Seleccioná el resultado',
      errorKFactor: 'Ingresá un factor K válido',
      victoria: 'victoria',
      derrota: 'derrota',
      empate: 'empate',
    },
    en: {
      errorEloPropio: 'Enter your current ELO',
      errorEloRival: 'Enter the opponent\'s ELO',
      errorResultado: 'Select the result',
      errorKFactor: 'Enter a valid K factor',
      victoria: 'win',
      derrota: 'loss',
      empate: 'draw',
    },
  } as const)[__lang];

  const elo = Number(i.eloPropio);
  const eloR = Number(i.eloRival);
  const S = Number(i.resultado);
  const K = Number(i.kFactor);

  if (!elo && elo !== 0) throw new Error(T.errorEloPropio);
  if (!eloR && eloR !== 0) throw new Error(T.errorEloRival);
  if (isNaN(S) || (S !== 0 && S !== 0.5 && S !== 1)) throw new Error(T.errorResultado);
  if (!K || K <= 0) throw new Error(T.errorKFactor);

  // Expected score: E = 1 / (1 + 10^((eloR - elo)/400))
  const E = 1 / (1 + Math.pow(10, (eloR - elo) / 400));
  const cambio = K * (S - E);
  const nuevoElo = Math.round(elo + cambio);

  const resultadoTexto = S === 1 ? T.victoria : S === 0 ? T.derrota : T.empate;
  const signo = cambio >= 0 ? '+' : '';

  const mensaje = __lang === 'en'
    ? `${resultadoTexto.charAt(0).toUpperCase() + resultadoTexto.slice(1)} against opponent with ${eloR} ELO. Expected probability: ${(E * 100).toFixed(1)}%. Change: ${signo}${cambio.toFixed(1)} pts. New ELO: ${nuevoElo}.`
    : `${resultadoTexto.charAt(0).toUpperCase() + resultadoTexto.slice(1)} contra rival de ${eloR} ELO. Probabilidad esperada: ${(E * 100).toFixed(1)}%. Cambio: ${signo}${cambio.toFixed(1)} pts. Nuevo ELO: ${nuevoElo}.`;

  return {
    nuevoElo,
    cambio: Number(cambio.toFixed(1)),
    probabilidadVictoria: Number((E * 100).toFixed(1)),
    mensaje,
  };
}
