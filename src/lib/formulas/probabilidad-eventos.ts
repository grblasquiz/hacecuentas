/** Probabilidad de eventos simples */
export interface Inputs { favorables: number; posibles: number; }
export interface Outputs {
  probabilidad: number;
  porcentaje: string;
  odds: string;
  complemento: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function probabilidadEventos(i: Inputs): Outputs {
  const fav = Math.floor(Number(i.favorables));
  const pos = Math.floor(Number(i.posibles));
  if (isNaN(fav) || fav < 0) throw new Error('Ingresá un número válido de casos favorables');
  if (isNaN(pos) || pos < 1) throw new Error('Ingresá un número válido de casos posibles (mayor a 0)');
  if (fav > pos) throw new Error('Los casos favorables no pueden superar los posibles');

  const prob = fav / pos;
  const comp = 1 - prob;
  const desfav = pos - fav;

  // Simplificar odds con MCD
  function mcd(a: number, b: number): number {
    while (b) { [a, b] = [b, a % b]; }
    return a;
  }
  const divisor = fav > 0 && desfav > 0 ? mcd(fav, desfav) : 1;
  const oddsStr = fav > 0 && desfav > 0
    ? `${fav / divisor}:${desfav / divisor}`
    : fav === 0 ? '0:1 (imposible)' : '1:0 (seguro)';

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });

  const pct = prob * 100;
  const _insight = {
    title: 'Qué tan probable es',
    text: `De **${pos.toLocaleString('es-AR')} casos posibles**, **${fav.toLocaleString('es-AR')}** son favorables: el evento ocurre el **${pct.toFixed(2)}%** de las veces (odds ${oddsStr}). La chance de que NO pase es **${(comp * 100).toFixed(2)}%**.`,
    tone: 'neutral',
    icon: '🎯',
  };

  const _chart = {
    type: 'scale' as const,
    marker: Number(pct.toFixed(2)),
    markerLabel: 'P = ' + pct.toFixed(1) + ' %',
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Muy improbable', max: 20, color: '#fca5a5', colorDark: '#7f1d1d' },
      { nombre: 'Improbable', max: 40, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Parejo', max: 60, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Probable', max: 80, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Casi seguro', max: 100, color: '#86efac', colorDark: '#14532d' },
    ],
    ariaLabel: 'Escala de probabilidad del evento, de muy improbable a casi seguro.',
  };

  return {
    probabilidad: Number(prob.toFixed(6)),
    porcentaje: `${(prob * 100).toFixed(2)}%`,
    odds: oddsStr,
    complemento: Number(comp.toFixed(6)),
    detalle: `P = ${fav}/${pos} = ${fmt.format(prob)} = ${(prob * 100).toFixed(2)}%. Odds a favor: ${oddsStr}. Complemento (no ocurra): ${(comp * 100).toFixed(2)}%.`,
    _insight,
    _chart,
  };
}
