/** Propina recomendada por país y ocasión */
export interface Inputs {
  monto: number;
  pais: string;
  servicio?: 'restaurante' | 'taxi' | 'hotel' | string;
  personas?: number;
}
export interface Outputs {
  porcentajeSugerido: number;
  propinaSugerida: number;
  totalConPropina: number;
  porPersona: number;
  regla: string;
  _insight?: any;
  _chart?: any;
}

// Datos aproximados por país — guías turísticas 2026
const PAISES: Record<string, { nombre: string; restaurante: number; taxi: number; hotel: number; regla: string; }> = {
  'argentina':    { nombre: 'Argentina',        restaurante: 10, taxi: 0,  hotel: 0,  regla: '10 % sugerido en restaurantes. Taxi y hotel no esperados.' },
  'usa':          { nombre: 'Estados Unidos',   restaurante: 20, taxi: 15, hotel: 5,  regla: 'Obligatorio 15–20 % en restaurantes. Taxi 15 %. Hotel $2–5/maleta.' },
  'uk':           { nombre: 'Reino Unido',      restaurante: 12, taxi: 10, hotel: 2,  regla: 'Muchos locales cobran service charge de 12.5 %. Si no, 10 %.' },
  'espana':       { nombre: 'España',           restaurante: 5,  taxi: 0,  hotel: 0,  regla: 'Opcional. 5 % si el servicio fue excepcional. Redondear en taxi.' },
  'francia':      { nombre: 'Francia',          restaurante: 5,  taxi: 5,  hotel: 1,  regla: 'Incluido por ley (service compris). 5 % extra opcional.' },
  'italia':       { nombre: 'Italia',           restaurante: 10, taxi: 0,  hotel: 1,  regla: 'Suelen cobrar \'coperto\' (cubierto). Propina adicional 5–10 %.' },
  'mexico':       { nombre: 'México',           restaurante: 15, taxi: 0,  hotel: 2,  regla: 'Esperado 10–15 % en restaurantes. Propina al conductor solo si ayudó con equipaje.' },
  'brasil':       { nombre: 'Brasil',           restaurante: 10, taxi: 0,  hotel: 0,  regla: '\'Taxa de serviço\' 10 % suele venir incluida en cuenta.' },
  'alemania':     { nombre: 'Alemania',         restaurante: 10, taxi: 10, hotel: 1,  regla: 'Se redondea hacia arriba, o se agrega 10 %. Se dice \'stimmt so\'.' },
  'japon':        { nombre: 'Japón',            restaurante: 0,  taxi: 0,  hotel: 0,  regla: 'NO se deja propina — puede considerarse ofensivo. El servicio está incluido.' },
  'chile':        { nombre: 'Chile',            restaurante: 10, taxi: 0,  hotel: 0,  regla: '10 % sugerido en restaurantes. Preguntan antes de cobrar.' },
  'uruguay':      { nombre: 'Uruguay',          restaurante: 10, taxi: 0,  hotel: 0,  regla: '10 % en restaurantes, no obligatorio.' },
};

export function propinaViaje(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const pais = String(i.pais || 'argentina');
  const serv = String(i.servicio || 'restaurante');
  const personas = Number(i.personas) || 1;
  if (!monto || monto <= 0) throw new Error('Ingresá el monto de la cuenta');

  const info = PAISES[pais] || PAISES.argentina;
  const pct = info[serv as 'restaurante' | 'taxi' | 'hotel'] ?? 10;
  const propina = monto * pct / 100;
  const total = monto + propina;
  const porPers = total / personas;

  const servNombre: Record<string, string> = { restaurante: 'restaurante', taxi: 'taxi', hotel: 'hotel' };
  const sNombre = servNombre[serv] || serv;
  const fmtAR = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

  let tone: 'good' | 'warn' | 'neutral';
  let icon: string;
  let text: string;
  if (pct === 0) {
    tone = 'good';
    icon = '🧳';
    text = `En **${info.nombre}** no se espera propina de ${sNombre}: pagás solo **${fmtAR(monto)}**. ${info.regla}`;
  } else if (pct >= 15) {
    tone = 'warn';
    icon = '✈️';
    text = `Ojo en **${info.nombre}**: la propina de ${sNombre} (**${pct}%**) suma **${fmtAR(propina)}**, llevando el total a **${fmtAR(total)}**${personas > 1 ? ` (${fmtAR(porPers)} por persona)` : ''}. ${info.regla}`;
  } else {
    tone = 'neutral';
    icon = '✈️';
    text = `En **${info.nombre}**, la propina de ${sNombre} ronda **${pct}%**: sumá **${fmtAR(propina)}** para un total de **${fmtAR(total)}**${personas > 1 ? ` (${fmtAR(porPers)} por persona)` : ''}. ${info.regla}`;
  }

  const _insight = {
    title: `Propina en ${info.nombre}`,
    text,
    tone,
    icon,
  };

  const _chart = propina > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: sNombre.charAt(0).toUpperCase() + sNombre.slice(1), value: Math.round(monto) },
      { label: 'Propina', value: Math.round(propina) },
    ],
    prefix: '$',
    centerValue: fmtAR(total),
    centerLabel: 'Total',
    ariaLabel: `Composición del total en ${info.nombre}: consumo más propina`,
  } : undefined;

  return {
    porcentajeSugerido: pct,
    propinaSugerida: Math.round(propina),
    totalConPropina: Math.round(total),
    porPersona: Math.round(porPers),
    regla: info.regla,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
