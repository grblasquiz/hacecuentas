/** Pintura por m²: rendimiento, manos */
export interface Inputs {
  m2: number;
  manos?: number;
  tipo?: string;
}
export interface Outputs {
  litros: number;
  latas4L: number;
  latas10L: number;
  latas20L: number;
  manosAplicadas: number;
  rendimiento: number;
}

const RENDIMIENTO: Record<string, number> = {
  latex_interior: 12, // m²/litro por mano
  latex_exterior: 10,
  esmalte_sintetico: 14,
  membrana_liquida: 1.5,
  impermeabilizante: 2.5,
  antihumedad: 5,
  barniz: 10,
  fondo: 12,
};

export function pinturaM2(i: Inputs): Outputs {
  const m2 = Number(i.m2);
  const manos = Number(i.manos) || 2;
  const tipo = String(i.tipo || 'latex_interior');
  if (!m2 || m2 <= 0) throw new Error('Ingresá los m²');
  if (!RENDIMIENTO[tipo]) throw new Error('Tipo no reconocido');

  const rend = RENDIMIENTO[tipo];
  const litros = (m2 * manos) / rend;
  const lta4 = Math.ceil(litros / 4);
  const lta10 = Math.ceil(litros / 10);
  const lta20 = Math.ceil(litros / 20);

  return {
    litros: Number(litros.toFixed(2)),
    latas4L: lta4,
    latas10L: lta10,
    latas20L: lta20,
    manosAplicadas: manos,
    rendimiento: rend,
  };
}
