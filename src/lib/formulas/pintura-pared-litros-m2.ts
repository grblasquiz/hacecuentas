/** Pintura: litros por habitación completa */
export interface Inputs { largo: number; ancho: number; alto: number; puertas?: number; ventanas?: number; manos?: string; tipoPintura?: string; }
export interface Outputs { litrosTotal: number; m2Paredes: number; baldes4L: number; baldes10L: number; }

const REND: Record<string, number> = { latex_interior: 12, latex_exterior: 10, esmalte: 14, fondo: 12 };
const M2_PUERTA = 1.6;
const M2_VENTANA = 1.8;

export function pinturaParedLitrosM2(i: Inputs): Outputs {
  const largo = Number(i.largo); const ancho = Number(i.ancho); const alto = Number(i.alto);
  if (!largo || !ancho || !alto) throw new Error('Ingresá las medidas de la habitación');
  const puertas = Number(i.puertas) || 0;
  const ventanas = Number(i.ventanas) || 0;
  const manos = Number(i.manos) || 2;
  const tipo = String(i.tipoPintura || 'latex_interior');

  const perimetro = 2 * (largo + ancho);
  const m2Bruto = perimetro * alto;
  const m2Neto = Math.max(0, m2Bruto - (puertas * M2_PUERTA) - (ventanas * M2_VENTANA));
  const rend = REND[tipo] || 12;
  const litros = (m2Neto * manos) / rend;

  return {
    litrosTotal: Number(litros.toFixed(1)),
    m2Paredes: Number(m2Neto.toFixed(1)),
    baldes4L: Math.ceil(litros / 4),
    baldes10L: Math.ceil(litros / 10),
  };
}
