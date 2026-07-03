/**
 * Config central de eventos estacionales de fin de semana (Fase 6).
 *
 * Fuente única de fechas → NO hardcodear años en componentes. Las ventanas se
 * definen por mes-día ('MM-DD') y se evalúan para el año en curso, así el mismo
 * config sirve todos los años. Cada evento enlaza a una herramienta/hub evergreen
 * (no se crea una URL por fecha).
 *
 * Uso: getActiveSeasonalEvent(new Date()) → el evento activo hoy (o null).
 * Pensado para un banner estacional reutilizable en home/hub.
 */

export interface SeasonalEvent {
  key: string;
  label: string;
  emoji: string;
  /** ventana activa inclusive, formato 'MM-DD' (hemisferio sur / AR) */
  from: string;
  to: string;
  /** herramienta o hub evergreen asociado */
  href: string;
  cta: string;
}

// Ordenados por prioridad de match (el primero que matchee gana si se solapan).
export const SEASONAL_EVENTS: SeasonalEvent[] = [
  { key: 'ano-nuevo', label: 'Año Nuevo', emoji: '🎆', from: '12-26', to: '01-02', href: '/calculadora-cerveza-invitado-evento', cta: 'Bebida para el brindis' },
  { key: 'navidad', label: 'Navidad', emoji: '🎄', from: '12-10', to: '12-25', href: '/calculadoras-fin-de-semana#fiesta-bebidas-y-comida-para-invitados', cta: 'Organizá la cena de Navidad' },
  { key: 'vacaciones-verano', label: 'Vacaciones de verano', emoji: '🏖️', from: '01-03', to: '02-28', href: '/calculadora-costo-viaje-combustible-kilometros', cta: 'Calculá la escapada' },
  { key: 'carnaval', label: 'Carnaval', emoji: '🎭', from: '02-14', to: '03-04', href: '/calculadora-costo-viaje-combustible-kilometros', cta: 'Escapada de finde largo' },
  { key: 'pascuas', label: 'Pascuas', emoji: '🐰', from: '03-28', to: '04-21', href: '/calculadora-conversion-medidas-cocina-tazas-gramos', cta: 'Recetas para Pascuas' },
  { key: 'dia-madre', label: 'Día de la Madre', emoji: '💐', from: '10-12', to: '10-19', href: '/calculadora-presupuesto-cumpleanos', cta: 'Organizá el festejo' },
  // Día del Amigo (ventana corta) va ANTES de vacaciones-invierno (ventana ancha)
  // porque el primer match gana y se solapan (16-20 jul ⊂ 11-27 jul).
  { key: 'dia-amigo', label: 'Día del Amigo', emoji: '🍻', from: '07-16', to: '07-20', href: '/calculadora-cerveza-invitado-evento', cta: 'Organizá la juntada' },
  { key: 'vacaciones-invierno', label: 'Vacaciones de invierno', emoji: '⛄', from: '07-11', to: '07-27', href: '/calculadora-costo-viaje-combustible-kilometros', cta: 'Planificá la escapada' },
  { key: 'halloween', label: 'Halloween', emoji: '🎃', from: '10-25', to: '10-31', href: '/calculadora-presupuesto-cumpleanos', cta: 'Armá la fiesta' },
  { key: 'invierno-pileta', label: 'Frío: proyectos en casa', emoji: '🔨', from: '06-01', to: '07-10', href: '/calculadora-pintura-por-m2-litros-latas', cta: 'Proyecto de finde en casa' },
];

/** 0-padded 'MM-DD' en la timezone dada. */
function monthDay(date: Date, timeZone: string): string {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone, month: '2-digit', day: '2-digit' }).formatToParts(date);
  const mm = p.find((x) => x.type === 'month')?.value ?? '01';
  const dd = p.find((x) => x.type === 'day')?.value ?? '01';
  return `${mm}-${dd}`;
}

/** ¿md está dentro de [from, to] inclusive, con wrap-around de fin de año? */
function inWindow(md: string, from: string, to: string): boolean {
  if (from <= to) return md >= from && md <= to;
  // wrap (ej. 12-26 → 01-02): activo si md >= from (dic) o md <= to (ene)
  return md >= from || md <= to;
}

/**
 * Evento estacional activo en la fecha dada (o null). El primero que matchea en
 * el orden de SEASONAL_EVENTS gana.
 */
export function getActiveSeasonalEvent(
  date: Date,
  timeZone: string = 'America/Argentina/Buenos_Aires',
): SeasonalEvent | null {
  const md = monthDay(date, timeZone);
  for (const ev of SEASONAL_EVENTS) {
    if (inWindow(md, ev.from, ev.to)) return ev;
  }
  return null;
}
