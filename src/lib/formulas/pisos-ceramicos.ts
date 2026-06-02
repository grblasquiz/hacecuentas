/** Pisos cerámicos, porcellanato: cajas necesarias */
export interface Inputs {
  largo: number;
  ancho: number;
  dimensionPieza?: string; // "60x60"
  m2PorCaja?: number;
  desperdicio?: number;
  __lang?: string;
}
export interface Outputs {
  m2Totales: number;
  cajas: number;
  piezas: number;
  pegamentoKg: number;
  pastinaKg: number;
  m2PorCaja: number;
  _insight?: any;
}

export function pisosCeramicos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorDimensions: 'Ingresá largo y ancho del ambiente',
      insightTitle: 'Cuántas cajas comprar',
      insightText: (cajas: number, m2c: number, desp: number, peg: number) =>
        `Para tu ambiente comprá **${cajas} cajas** de ${m2c} m² (incluye **${desp}% de desperdicio** por cortes). Sumá **${peg} kg de pegamento** y pedí todo del mismo lote para que no varíe el tono. Guardá las piezas que sobren: son tu repuesto si más adelante se raja alguna.`,
    },
    en: {
      errorDimensions: 'Enter the room length and width',
      insightTitle: 'How many boxes to buy',
      insightText: (cajas: number, m2c: number, desp: number, peg: number) =>
        `For your room buy **${cajas} boxes** of ${m2c} m² (includes **${desp}% waste** for cuts). Add **${peg} kg of adhesive** and order everything from the same batch so the shade stays consistent. Keep the leftover tiles: they are your spares if one cracks later.`,
    },
  } as const)[__lang];
  const l = Number(i.largo);
  const a = Number(i.ancho);
  const pieza = String(i.dimensionPieza || '60x60');
  const m2Caja = Number(i.m2PorCaja) || 0;
  const desp = Number(i.desperdicio) || 10;
  if (!l || !a) throw new Error(T.errorDimensions);

  const m2 = l * a;
  const conDesp = m2 * (1 + desp / 100);

  // Si no ingresa m² por caja, estimar según tamaño
  let m2PorCajaCalc = m2Caja;
  if (!m2PorCajaCalc) {
    const tamanos: Record<string, number> = {
      '30x30': 1.62, // 18 piezas/caja
      '45x45': 1.62, // 8 piezas
      '60x60': 1.44, // 4 piezas
      '80x80': 1.28, // 2 piezas
      '100x100': 2,  // 2 piezas
      '60x120': 1.44, // 2 piezas
    };
    m2PorCajaCalc = tamanos[pieza] || 1.44;
  }

  const cajas = Math.ceil(conDesp / m2PorCajaCalc);

  // Estimar piezas: m² / (largo_pieza × ancho_pieza)
  const [lp, ap] = pieza.split('x').map(n => Number(n) / 100); // cm a m
  const piezas = Math.ceil(conDesp / (lp * ap));

  // Pegamento: 4-5 kg/m² (cerámico), 6-8 kg/m² (porcellanato grande)
  const pegamentoKg = Math.ceil(conDesp * 5);

  // Pastina: 0.3-0.5 kg/m²
  const pastinaKg = Math.ceil(conDesp * 0.4);

  return {
    m2Totales: Number(m2.toFixed(2)),
    cajas,
    piezas,
    pegamentoKg,
    pastinaKg,
    m2PorCaja: m2PorCajaCalc,
    _insight: {
      title: T.insightTitle,
      text: T.insightText(cajas, m2PorCajaCalc, desp, pegamentoKg),
      tone: 'neutral',
      icon: '🧱',
    },
  };
}
