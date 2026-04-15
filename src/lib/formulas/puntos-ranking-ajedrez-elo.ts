/** Variación de puntos ELO en ajedrez */
export interface Inputs {
  eloJugador: number;
  eloRival: number;
  resultado: string;
  factorK: string;
}

export interface Outputs {
  result: number;
  nuevoElo: number;
  esperado: number;
  detalle: string;
}

export function puntosRankingAjedrezElo(i: Inputs): Outputs {
  const elo = Number(i.eloJugador);
  const eloR = Number(i.eloRival);
  const res = Number(i.resultado);
  const k = Number(i.factorK) || 20;

  if (!elo || elo <= 0) throw new Error('Ingresá tu rating ELO');
  if (!eloR || eloR <= 0) throw new Error('Ingresá el rating ELO del rival');
  if (isNaN(res) || (res !== 0 && res !== 0.5 && res !== 1)) throw new Error('Seleccioná un resultado válido');

  const esperado = 1 / (1 + Math.pow(10, (eloR - elo) / 400));
  const variacion = k * (res - esperado);
  const nuevoElo = elo + variacion;

  const resTexto = res === 1 ? 'ganaste' : res === 0.5 ? 'empataste' : 'perdiste';
  const signo = variacion >= 0 ? '+' : '';

  return {
    result: Number(variacion.toFixed(1)),
    nuevoElo: Math.round(nuevoElo),
    esperado: Number(esperado.toFixed(4)),
    detalle: `Con ELO **${elo}** vs **${eloR}** (${resTexto}), variación: **${signo}${variacion.toFixed(1)} puntos**. Nuevo ELO: **${Math.round(nuevoElo)}**. Resultado esperado: ${(esperado * 100).toFixed(1)}%.`,
  };
}
