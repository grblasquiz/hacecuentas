/** Porcentaje de conversión de tiros al arco de un futbolista */
export interface Inputs {
  goles: number;
  tirosAlArco: number;
  tirosTotales?: number; // opcional
}

export interface Outputs {
  conversionArcoPct: number;
  conversionTotalPct: number;
  categoria: string;
  benchmarkLiga: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function getCategoria(pct: number): string {
  if (pct >= 30) return 'Elite mundial (top scorer)';
  if (pct >= 22) return 'Delantero top de liga';
  if (pct >= 17) return 'Delantero eficaz';
  if (pct >= 12) return 'Promedio profesional';
  if (pct >= 7)  return 'Bajo / en baja';
  return 'Muy bajo (pura pólvora mojada)';
}

export function porcentajeConversionTiros(i: Inputs): Outputs {
  const goles = Number(i.goles);
  const ta = Number(i.tirosAlArco);
  const total = Number(i.tirosTotales);

  if (goles < 0) throw new Error('Goles inválidos');
  if (!ta || ta <= 0) throw new Error('Ingresá los tiros al arco (>0)');
  if (goles > ta) throw new Error('Los goles no pueden superar los tiros al arco');

  const pctArco = (goles / ta) * 100;
  let pctTotal = 0;
  if (total && total >= ta) {
    pctTotal = (goles / total) * 100;
  }

  const cat = getCategoria(pctArco);
  const bench = 'Top 5 ligas promedio: 10-12% (total) · 28-32% (on target). Top strikers: 18-25% (total).';

  const tono = pctArco >= 17 ? 'good' : pctArco >= 12 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Qué dice tu conversión',
    text: `Convertís **${pctArco.toFixed(1)}%** de los tiros al arco (${goles} en ${ta}): nivel **${cat}**.${total ? ` Sobre el total de ${total} remates bajás a **${pctTotal.toFixed(1)}%**.` : ''}`,
    tone: tono,
    icon: '⚽',
  };
  const _chart = {
    type: 'scale',
    marker: Number(pctArco.toFixed(1)),
    markerLabel: `${pctArco.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Muy bajo', max: 7, color: '#dc2626', colorDark: '#f87171' },
      { nombre: 'Bajo', max: 12, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Promedio', max: 17, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Eficaz', max: 22, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Top de liga', max: 30, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Elite mundial', max: Math.max(40, Math.ceil(pctArco) + 1), color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `Conversión de ${pctArco.toFixed(1)}% sobre tiros al arco, en la franja ${cat}.`,
  };

  return {
    conversionArcoPct: Number(pctArco.toFixed(2)),
    conversionTotalPct: Number(pctTotal.toFixed(2)),
    categoria: cat,
    benchmarkLiga: bench,
    detalle: `${goles} goles / ${ta} tiros al arco = **${pctArco.toFixed(1)}%** (${cat})${total ? `. Conversión sobre ${total} tiros totales: ${pctTotal.toFixed(1)}%` : ''}. ${bench}`,
    _insight,
    _chart,
  };
}
