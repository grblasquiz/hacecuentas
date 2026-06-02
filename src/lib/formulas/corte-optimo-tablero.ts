/**
 * Calculadora de corte óptimo de tablero de MDF/melamina
 */

export interface Inputs {
  piezaAncho: number; piezaAlto: number; piezasNecesarias: number;
}

export interface Outputs {
  piezasPorTabla: string; tablasNecesarias: string; desperdicio: string; orientacion: string;
  _insight?: any; _chart?: any;
}

export function corteOptimoTablero(inputs: Inputs): Outputs {
  const pw = Number(inputs.piezaAncho);
  const ph = Number(inputs.piezaAlto);
  const need = Math.round(Number(inputs.piezasNecesarias));
  if (!pw || !ph || !need) throw new Error('Completá los campos');
  const TW = 274, TH = 183;
  const sierra = 0.3; // 3 mm ≈ 0.3 cm
  // Orientación A
  const aX = Math.floor((TW + sierra) / (pw + sierra));
  const aY = Math.floor((TH + sierra) / (ph + sierra));
  const piezasA = aX * aY;
  // Orientación B: rotar pieza
  const bX = Math.floor((TW + sierra) / (ph + sierra));
  const bY = Math.floor((TH + sierra) / (pw + sierra));
  const piezasB = bX * bY;
  const piezasMax = Math.max(piezasA, piezasB);
  const orient = piezasA >= piezasB ? `${pw}cm largo × ${ph}cm ancho (${aX}×${aY})` : `${ph}cm largo × ${pw}cm ancho (${bX}×${bY})`;
  if (piezasMax === 0) throw new Error('La pieza no cabe en la tabla estándar');
  const tablas = Math.ceil(need / piezasMax);
  const usado = piezasMax * pw * ph;
  const desperdicio = ((TW * TH - usado) / (TW * TH)) * 100;
  const sobran = tablas * piezasMax - need;

  const tone = desperdicio <= 15 ? 'good' : desperdicio <= 35 ? 'neutral' : 'warn';
  const aprovecha = (100 - desperdicio).toFixed(0);
  const insightText = desperdicio <= 15
    ? `Aprovechás el **${aprovecha}%** de cada tablero: ${piezasMax} piezas por placa con solo **${desperdicio.toFixed(1)}%** de descarte. Plan de corte muy eficiente.`
    : desperdicio <= 35
    ? `Sacás **${piezasMax} piezas** por tablero y necesitás **${tablas} placa${tablas > 1 ? 's' : ''}**, con **${desperdicio.toFixed(1)}%** de descarte. Probá rotar la pieza o ajustar medidas para mejorar el aprovechamiento.`
    : `El descarte es alto: **${desperdicio.toFixed(1)}%** del tablero queda sin usar (solo ${piezasMax} pieza${piezasMax > 1 ? 's' : ''} por placa). Reconsiderá las medidas de la pieza o el tamaño del tablero.`;

  return {
    piezasPorTabla: `${piezasMax} piezas por tabla`,
    tablasNecesarias: `${tablas} tabla${tablas > 1 ? 's' : ''} (sobran ${sobran})`,
    desperdicio: `${desperdicio.toFixed(1)}% sin usar`,
    orientacion: orient,
    _insight: {
      title: 'Aprovechamiento del tablero',
      text: insightText,
      tone,
      icon: '🪚',
    },
    _chart: {
      type: 'scale',
      marker: Number(desperdicio.toFixed(1)),
      markerLabel: `${desperdicio.toFixed(1)}% descarte`,
      min: 0,
      segments: [
        { nombre: 'Eficiente', max: 15, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Aceptable', max: 35, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Alto descarte', max: 100, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Nivel de descarte del tablero: ${desperdicio.toFixed(1)} por ciento sin usar`,
    },
  };
}
