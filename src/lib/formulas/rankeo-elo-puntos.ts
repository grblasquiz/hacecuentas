/** Calculadora de ELO y Rating */
export interface Inputs {
  eloPropio: number;
  eloRival: number;
  resultado: string;
  kFactor: number;
}
export interface Outputs {
  nuevoElo: number;
  cambio: number;
  probabilidadVictoria: number;
  mensaje: string;
}

export function rankeoEloPuntos(i: Inputs): Outputs {
  const elo = Number(i.eloPropio);
  const eloR = Number(i.eloRival);
  const S = Number(i.resultado);
  const K = Number(i.kFactor);

  if (!elo && elo !== 0) throw new Error('Ingresá tu ELO actual');
  if (!eloR && eloR !== 0) throw new Error('Ingresá el ELO del rival');
  if (isNaN(S) || (S !== 0 && S !== 0.5 && S !== 1)) throw new Error('Seleccioná el resultado');
  if (!K || K <= 0) throw new Error('Ingresá un factor K válido');

  // Expected score: E = 1 / (1 + 10^((eloR - elo)/400))
  const E = 1 / (1 + Math.pow(10, (eloR - elo) / 400));
  const cambio = K * (S - E);
  const nuevoElo = Math.round(elo + cambio);

  const resultadoTexto = S === 1 ? 'victoria' : S === 0 ? 'derrota' : 'empate';
  const signo = cambio >= 0 ? '+' : '';

  return {
    nuevoElo,
    cambio: Number(cambio.toFixed(1)),
    probabilidadVictoria: Number((E * 100).toFixed(1)),
    mensaje: `${resultadoTexto.charAt(0).toUpperCase() + resultadoTexto.slice(1)} contra rival de ${eloR} ELO. Probabilidad esperada: ${(E * 100).toFixed(1)}%. Cambio: ${signo}${cambio.toFixed(1)} pts. Nuevo ELO: ${nuevoElo}.`,
  };
}
