/** Mundial 2026 - Goles en prórroga */
export interface Inputs { minutosJugados: number; }
export interface Outputs { probGol: string; probPenales: string; contexto: string; _insight?: any; _chart?: any; }

export function mundial2026GolesProrroga(i: Inputs): Outputs {
  const m = Number(i.minutosJugados);
  if (isNaN(m) || m < 0 || m > 30) throw new Error('Minutos fuera de rango (0-30)');
  const base = 0.38;
  const restante = Math.max(0, (30 - m) / 30) * base;
  const penales = 1 - restante;
  const pctGol = restante * 100;
  const pctPen = penales * 100;
  const minRest = 30 - m;

  const insight = penales >= 0.62
    ? {
        title: 'La balanza apunta a los penales',
        text: `Con **${minRest} min** restantes hay **${pctPen.toFixed(1)}%** de chances de terminar en penales contra **${pctGol.toFixed(1)}%** de que caiga un gol antes. Cuanto menos tiempo queda, más cerca está la tanda.`,
        tone: 'warn',
        icon: '🥅',
      }
    : {
        title: 'Todavía hay prórroga por jugar',
        text: `Quedan **${minRest} min** y la chance de gol en el alargue es **${pctGol.toFixed(1)}%**, todavía por encima del piso histórico. La definición por penales está en **${pctPen.toFixed(1)}%**.`,
        tone: 'neutral',
        icon: '⚽',
      };

  return {
    probGol: `${pctGol.toFixed(1)}% de que caiga gol en los ${minRest} minutos restantes`,
    probPenales: `${pctPen.toFixed(1)}% de probabilidad de ir a penales`,
    contexto: `Desde Francia 1998: 38% de las prórrogas en Mundiales tuvieron al menos un gol. 62% se definieron por penales. Los goles suelen caer entre los minutos 100-120.`,
    _insight: insight,
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Gol en la prórroga', value: Number(pctGol.toFixed(1)) },
        { label: 'Definición por penales', value: Number(pctPen.toFixed(1)) },
      ],
      suffix: '%',
      centerValue: `${pctPen.toFixed(0)}%`,
      centerLabel: 'a penales',
      ariaLabel: `Probabilidad de gol en la prórroga (${pctGol.toFixed(1)}%) versus definición por penales (${pctPen.toFixed(1)}%)`,
    },
  };
}
