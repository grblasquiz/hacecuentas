/** Efectividad (conversion rate) = goles / tiros al arco (SoT). */
export interface Inputs {
  goles: number;
  tirosAlArco: number;
}
export interface Outputs {
  efectividad: number; // %
  tirosSinGol: number;
  categoria: string;
  benchmark: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function efectividadTirosAlArco(i: Inputs): Outputs {
  if (!i.tirosAlArco || i.tirosAlArco <= 0) throw new Error('Tiros al arco debe ser > 0.');
  if (i.goles < 0 || i.goles > i.tirosAlArco) throw new Error('Goles fuera de rango (no puede ser mayor a tiros al arco).');
  const pct = (i.goles / i.tirosAlArco) * 100;
  const fallidos = i.tirosAlArco - i.goles;

  // Benchmarks FBref top-5 ligas 2024-25:
  // Promedio liga: 32-38%
  // Delantero elite: 40-50%
  // Outlier (Haaland, Kane temp. alta): >50%
  // Delantero bajo rendimiento: < 25%
  let cat = 'Por debajo del promedio';
  let bm = 'Promedio top-5 ligas ronda 32-38%. Debajo de 25% indica problemas de definición.';
  if (pct >= 50) { cat = 'Outlier / temporada histórica'; bm = 'Solo los mejores 9 del mundo superan 50% sostenido (Haaland 2022-23: 52%).'; }
  else if (pct >= 40) { cat = 'Delantero de elite'; bm = 'Rango típico de goleadores top-10 europeos.'; }
  else if (pct >= 32) { cat = 'Rendimiento promedio liga'; bm = 'Promedio top-5 ligas 2024-25: 32-38%.'; }
  else if (pct >= 25) { cat = 'Por debajo del promedio'; bm = 'Zona gris — delanteros de equipos que generan menos ocasiones claras.'; }

  const _tone = pct >= 40 ? 'good' : pct < 25 ? 'warn' : 'neutral';
  const _insight = {
    title: cat,
    text: `Convertiste **${i.goles} de ${i.tirosAlArco}** tiros al arco: **${pct.toFixed(1)}%** de efectividad. ${
      pct >= 50
        ? 'Nivel de los mejores 9 del mundo en su mejor temporada.'
        : pct >= 40
        ? 'Rango de goleador de elite europeo.'
        : pct >= 32
        ? 'En línea con el promedio de las top-5 ligas (32-38%).'
        : pct >= 25
        ? 'Por debajo del promedio: zona gris de definición.'
        : 'Definición floja: bien debajo del 25% promedio de un delantero.'
    }`,
    tone: _tone,
    icon: '⚽',
  };
  const _chart = {
    type: 'scale',
    marker: Math.min(pct, 99.9),
    markerLabel: `${pct.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 25, color: '#f87171', colorDark: '#b91c1c' },
      { nombre: 'Debajo promedio', max: 32, color: '#fbbf24', colorDark: '#b45309' },
      { nombre: 'Promedio liga', max: 40, color: '#a3e635', colorDark: '#4d7c0f' },
      { nombre: 'Elite', max: 50, color: '#34d399', colorDark: '#047857' },
      { nombre: 'Histórico', max: 100, color: '#22d3ee', colorDark: '#0e7490' },
    ],
    ariaLabel: `Efectividad de definición: ${pct.toFixed(1)}%, categoría ${cat}`,
  };

  return {
    efectividad: Math.round(pct * 10) / 10,
    tirosSinGol: fallidos,
    categoria: cat,
    benchmark: bm,
    mensaje: `${i.goles}/${i.tirosAlArco} = ${pct.toFixed(1)}% efectividad (${cat}).`,
    _insight,
    _chart,
  };
}
