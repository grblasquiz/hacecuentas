/**
 * Calculadora de tela necesaria para una prenda
 */

export interface Inputs {
  prenda: number; talla: number; anchoTela: number; direccional: number;
}

export interface Outputs {
  metrosNetos: string; metrosCompra: string; consejo: string;
}

export function telaNecesariaPrendaVestido(inputs: Inputs): Outputs {
  const pr = Math.round(Number(inputs.prenda));
  const ta = Math.round(Number(inputs.talla));
  const at = Number(inputs.anchoTela);
  const dir = Math.round(Number(inputs.direccional));
  if (!pr || !ta || !at) throw new Error('Completá los campos');
  const baseMetros: Record<number, number> = { 1: 1.8, 2: 2.5, 3: 1.5, 4: 0.8, 5: 2.0, 6: 1.2, 7: 0.8, 8: 2.2 };
  const bm = baseMetros[pr] || 1.8;
  const tallaMult: Record<number, number> = { 1: 0.85, 2: 0.92, 3: 1.0, 4: 1.08, 5: 1.15, 6: 1.25 };
  const tm = tallaMult[ta] || 1.0;
  // Ancho: base 140 cm
  const anchoMult = at < 95 ? 1.5 : at < 125 ? 1.25 : at < 150 ? 1.0 : at < 170 ? 0.93 : 0.80;
  const direcMult = dir === 1 ? 1.20 : 1.0;
  const netos = bm * tm * anchoMult * direcMult;
  const compra = netos * 1.13; // 13% margen extra
  const notas = [];
  if (dir === 1) notas.push('Estampado direccional: 20% extra');
  if (at < 100) notas.push('Tela angosta: 50% más metros');
  if (at > 160) notas.push('Tela ancha: 10% menos metros');
  return {
    metrosNetos: `${netos.toFixed(2)} m`,
    metrosCompra: `${compra.toFixed(2)} m (con 13% margen)`,
    consejo: notas.length ? notas.join(' · ') : 'Tela lisa estándar, consumo estándar.',
  };
}
