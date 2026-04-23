/** ELO rating para fútbol — K=20 por defecto, con ventaja de localía +100 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function eloRatingFutbol(i: Inputs): Outputs {
  const rActual = Number(i.ratingActual) || 1500;
  const rRival = Number(i.ratingRival) || 1500;
  const resultado = String(i.resultado || 'victoria');
  const localia = String(i.localia || 'local'); // local, visitante, neutral
  const k = Number(i.kFactor) || 20;

  const ventaja = localia === 'local' ? 100 : localia === 'visitante' ? -100 : 0;
  const rAdj = rActual + ventaja;

  const esperado = 1 / (1 + Math.pow(10, (rRival - rAdj) / 400));

  const resNum: Record<string, number> = {
    victoria: 1,
    empate: 0.5,
    derrota: 0,
  };
  const s = resNum[resultado] ?? 0.5;

  const delta = k * (s - esperado);
  const nuevo = rActual + delta;

  const tier = nuevo >= 2000 ? 'Elite mundial (top 5)'
    : nuevo >= 1900 ? 'Candidato Champions'
    : nuevo >= 1800 ? 'Clasificación europea'
    : nuevo >= 1700 ? 'Liga competitiva'
    : nuevo >= 1600 ? 'Nivel medio'
    : 'Nivel bajo';

  return {
    nuevoRating: Math.round(nuevo),
    variacion: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`,
    probabilidadVictoria: `${(esperado * 100).toFixed(1)}%`,
    ratingAjustadoConLocalia: Math.round(rAdj),
    tier,
  };
}
