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

  return {
    conversionArcoPct: Number(pctArco.toFixed(2)),
    conversionTotalPct: Number(pctTotal.toFixed(2)),
    categoria: cat,
    benchmarkLiga: bench,
    detalle: `${goles} goles / ${ta} tiros al arco = **${pctArco.toFixed(1)}%** (${cat})${total ? `. Conversión sobre ${total} tiros totales: ${pctTotal.toFixed(1)}%` : ''}. ${bench}`,
  };
}
