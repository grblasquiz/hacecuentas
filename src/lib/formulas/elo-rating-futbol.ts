/** ELO rating para fútbol — K=20 por defecto, con ventaja de localía +100 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

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

  const nuevoR = Math.round(nuevo);
  const localTxt = localia === 'local' ? 'de local (+100)' : localia === 'visitante' ? 'de visitante (-100)' : 'en cancha neutral';
  const resTxt = resultado === 'victoria' ? 'la victoria' : resultado === 'empate' ? 'el empate' : 'la derrota';
  return {
    nuevoRating: nuevoR,
    variacion: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`,
    probabilidadVictoria: `${(esperado * 100).toFixed(1)}%`,
    ratingAjustadoConLocalia: Math.round(rAdj),
    tier,
    _insight: {
      title: 'Tu nuevo rating',
      text: `Jugando ${localTxt}, el modelo daba **${(esperado * 100).toFixed(0)}%** de chances de ganar. Con ${resTxt}, el rating ${delta >= 0 ? 'sube' : 'baja'} **${delta >= 0 ? '+' : ''}${delta.toFixed(1)}** y queda en **${nuevoR}** — nivel "${tier}".`,
      tone: delta > 0 ? 'good' : delta < 0 ? 'warn' : 'neutral',
      icon: '⚽',
    },
    _chart: {
      type: 'scale',
      marker: nuevoR,
      markerLabel: `${nuevoR}`,
      min: 1400,
      segments: [
        { nombre: 'Nivel bajo', max: 1600, color: '#ef4444', colorDark: '#f87171' },
        { nombre: 'Nivel medio', max: 1700, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Liga competitiva', max: 1800, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Clasificación europea', max: 1900, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Candidato Champions', max: 2000, color: '#22c55e', colorDark: '#4ade80' },
        { nombre: 'Elite mundial', max: Math.max(2200, nuevoR + 50), color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `Rating ${nuevoR} en el nivel ${tier}`,
    },
  };
}
