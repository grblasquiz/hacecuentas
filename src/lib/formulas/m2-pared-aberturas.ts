/** m² netos de pared descontando aberturas (ventanas, puertas, huecos) */
export interface Inputs {
  largoPared: number;
  altoPared: number;
  ventanaAncho?: number;
  ventanaAlto?: number;
  ventanaCantidad?: number;
  puertaAncho?: number;
  puertaAlto?: number;
  puertaCantidad?: number;
  otroHueco?: number; // m² adicionales a descontar
}

export interface Outputs {
  m2Bruto: number;
  m2Aberturas: number;
  m2Neto: number;
  porcentajeAberturas: number;
  resumen: string;
}

export function m2ParedAberturas(i: Inputs): Outputs {
  const L = Number(i.largoPared);
  const H = Number(i.altoPared);
  if (!L || !H || L <= 0 || H <= 0) throw new Error('Ingresá largo y alto de la pared');

  const vA = Number(i.ventanaAncho || 0);
  const vH = Number(i.ventanaAlto || 0);
  const vN = Number(i.ventanaCantidad || 0);
  const pA = Number(i.puertaAncho || 0);
  const pH = Number(i.puertaAlto || 0);
  const pN = Number(i.puertaCantidad || 0);
  const otro = Number(i.otroHueco || 0);

  const bruto = L * H;
  const m2Vent = vA * vH * vN;
  const m2Puer = pA * pH * pN;
  const m2Abert = m2Vent + m2Puer + otro;
  const neto = Math.max(0, bruto - m2Abert);
  const pct = bruto > 0 ? (m2Abert / bruto) * 100 : 0;

  return {
    m2Bruto: Number(bruto.toFixed(2)),
    m2Aberturas: Number(m2Abert.toFixed(2)),
    m2Neto: Number(neto.toFixed(2)),
    porcentajeAberturas: Number(pct.toFixed(1)),
    resumen: `Pared de ${bruto.toFixed(2)} m² bruto − ${m2Abert.toFixed(2)} m² de aberturas (${pct.toFixed(1)}%) = **${neto.toFixed(2)} m² netos** para pintar o revestir.`,
  };
}
