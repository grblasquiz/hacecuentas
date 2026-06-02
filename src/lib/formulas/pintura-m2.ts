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
  _insight?: any;
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

  const litrosR = Number(litros.toFixed(2));
  const conMargen = litros * 1.1;
  let compra: string;
  if (conMargen >= 18) compra = `un balde de **20 L**`;
  else if (conMargen >= 8) compra = `un balde de **10 L**`;
  else compra = `**${Math.ceil(conMargen / 4)} lata${Math.ceil(conMargen / 4) === 1 ? '' : 's'} de 4 L**`;

  const _insight = {
    title: 'Cuánto y en qué presentación',
    text: `Necesitás **${litrosR} L** para ${m2} m² con ${manos} mano${manos === 1 ? '' : 's'} (rinde ${rend} m²/L). Con el 10% de margen para retoques (~${conMargen.toFixed(1)} L), te conviene comprar ${compra}.`,
    tone: 'neutral' as const,
    icon: '🪣',
  };

  return {
    litros: litrosR,
    latas4L: lta4,
    latas10L: lta10,
    latas20L: lta20,
    manosAplicadas: manos,
    rendimiento: rend,
    _insight,
  };
}
