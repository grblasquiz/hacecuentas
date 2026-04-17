/**
 * Calculadora de corte óptimo de tablero de MDF/melamina
 */

export interface Inputs {
  piezaAncho: number; piezaAlto: number; piezasNecesarias: number;
}

export interface Outputs {
  piezasPorTabla: string; tablasNecesarias: string; desperdicio: string; orientacion: string;
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
  return {
    piezasPorTabla: `${piezasMax} piezas por tabla`,
    tablasNecesarias: `${tablas} tabla${tablas > 1 ? 's' : ''} (sobran ${tablas * piezasMax - need})`,
    desperdicio: `${desperdicio.toFixed(1)}% sin usar`,
    orientacion: orient,
  };
}
