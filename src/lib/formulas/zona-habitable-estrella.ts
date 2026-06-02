/** Calculadora Zona Habitable — d = √(L/L☉) × d☉ */
export interface Inputs { luminosidad: number; }
export interface Outputs { resultado: string; limiteInterno: number; limiteExterno: number; anchoZona: number; _insight?: any; }

export function zonaHabitableEstrella(i: Inputs): Outputs {
  const L = Number(i.luminosidad);
  if (L <= 0) throw new Error('La luminosidad debe ser mayor a 0');

  // Kopparapu et al. (2013) conservative limits for Sun:
  // Inner edge (runaway greenhouse): ~0.95 AU for Sun
  // Outer edge (maximum greenhouse): ~1.37 AU for Sun
  // Scale with √L
  const sqrtL = Math.sqrt(L);
  const inner = 0.95 * sqrtL;
  const outer = 1.37 * sqrtL;
  const width = outer - inner;

  const earthInside = inner <= 1 && 1 <= outer;
  return {
    resultado: `Zona habitable: ${inner.toFixed(4)} — ${outer.toFixed(4)} UA`,
    limiteInterno: Number(inner.toFixed(6)),
    limiteExterno: Number(outer.toFixed(6)),
    anchoZona: Number(width.toFixed(6)),
    _insight: {
      title: 'La franja de agua líquida',
      text: `Para una estrella de **${L} L☉**, la zona habitable se extiende de **${inner.toFixed(3)} a ${outer.toFixed(3)} UA** (ancho de **${width.toFixed(3)} UA**), donde un planeta podría tener agua líquida. ${earthInside ? 'A 1 UA, la Tierra caería dentro de esta franja.' : L > 1 ? 'Al ser más luminosa que el Sol, la zona se aleja: la órbita terrestre (1 UA) quedaría demasiado caliente.' : 'Al ser menos luminosa que el Sol, la zona se acerca: la órbita terrestre (1 UA) quedaría demasiado fría.'} Son límites conservadores de Kopparapu et al. (2013).`,
      tone: 'neutral' as const,
      icon: '🪐',
    },
  };
}
