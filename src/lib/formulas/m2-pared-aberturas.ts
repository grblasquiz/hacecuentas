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
  _insight?: any;
  _chart?: any;
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

  const chart =
    m2Abert > 0
      ? {
          type: 'doughnut' as const,
          slices: [
            { label: 'Superficie a pintar', value: Number(neto.toFixed(2)) },
            { label: 'Aberturas', value: Number(m2Abert.toFixed(2)) },
          ],
          prefix: '',
          centerValue: bruto.toFixed(2) + ' m²',
          centerLabel: 'Pared total',
          ariaLabel: 'Composición de la pared: superficie neta a pintar más superficie de aberturas.',
        }
      : undefined;

  const netoR = Number(neto.toFixed(2));
  const pctR = Number(pct.toFixed(1));

  const insight = pctR >= 40
    ? {
        title: 'Mucha abertura, poca pared',
        text: `Las aberturas se comen el **${pctR}%** de la pared: te quedan sólo **${netoR.toFixed(2)} m² netos** para pintar. Comprá pintura por la superficie neta, no por la bruta, o vas a sobrar de más.`,
        tone: 'warn',
        icon: '🪟',
      }
    : {
        title: 'Superficie neta a cubrir',
        text: `Descontando las aberturas (${pctR}% de la pared), tenés **${netoR.toFixed(2)} m² netos** para pintar o revestir. Con un rendimiento típico de 10 m²/L por mano, calculá el material sobre estos m², no sobre los ${bruto.toFixed(2)} m² brutos.`,
        tone: 'neutral',
        icon: '🪟',
      };

  return {
    m2Bruto: Number(bruto.toFixed(2)),
    m2Aberturas: Number(m2Abert.toFixed(2)),
    m2Neto: netoR,
    porcentajeAberturas: pctR,
    resumen: `Pared de ${bruto.toFixed(2)} m² bruto − ${m2Abert.toFixed(2)} m² de aberturas (${pct.toFixed(1)}%) = **${neto.toFixed(2)} m² netos** para pintar o revestir.`,
    _insight: insight,
    _chart: chart,
  };
}
