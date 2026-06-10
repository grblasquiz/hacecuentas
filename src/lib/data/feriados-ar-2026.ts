// ────────────────────────────────────────────────────────────────────────────
// FERIADOS ARGENTINA 2026 — FUENTE ÚNICA DE VERDAD
// ────────────────────────────────────────────────────────────────────────────
// Antes cada calc hardcodeaba su propia lista de feriados → drift y errores
// (Soberanía mal, puentes faltantes, nombres inconsistentes). Centralizar acá
// evita que se vuelvan a desincronizar: una sola lista, una sola revisión anual.
//
// Mismo patrón que src/lib/data/brasil-2026.ts y monotributo-2026.ts.
//
// dataAsOf: 2026-06-07. Verificado contra el Boletín Oficial:
//   - Ley 27.399 — Régimen de feriados nacionales y días no laborables.
//   - Decreto 1584/2010 — feriados trasladables (regla del lunes).
//   - Resolución 164/2025 (Min. Turismo) — 3 puentes turísticos: 23/3, 10/7, 7/12.
//
// Todas las FECHAS son las OBSERVADAS (con traslados ya aplicados). El campo
// opcional `trasladadoDe` guarda la fecha original cuando hubo traslado.
//
// Nota sobre tipos: Carnaval (lun/mar) se modela como 'trasladable' para mantener
// idéntico el output de las calcs ya desplegadas; legalmente es un feriado de
// fecha móvil (atado a la Pascua) que NO sigue la regla del lunes. No cambia el
// conteo de "feriados nacionales" (inamovibles + trasladables = 15).
// ────────────────────────────────────────────────────────────────────────────

export type TipoFeriado = 'inamovible' | 'trasladable' | 'no-laborable' | 'puente';

export interface Feriado {
  /** Fecha observada en formato YYYY-MM-DD (con traslados ya aplicados). */
  fecha: string;
  /** Nombre oficial completo. */
  nombre: string;
  tipo: TipoFeriado;
  /** Mes 1-12 (derivado de la fecha, expuesto para filtros rápidos). */
  mes: number;
  /** Fecha original YYYY-MM-DD si el feriado fue trasladado. */
  trasladadoDe?: string;
}

/**
 * Calendario completo AR 2026: 15 feriados nacionales (inamovibles + trasladables)
 * + 3 puentes turísticos + 1 día no laborable = 19 entradas, en orden cronológico.
 */
export const FERIADOS_AR_2026: Feriado[] = [
  { fecha: '2026-01-01', nombre: 'Año Nuevo', tipo: 'inamovible', mes: 1 },
  { fecha: '2026-02-16', nombre: 'Carnaval', tipo: 'trasladable', mes: 2 },
  { fecha: '2026-02-17', nombre: 'Carnaval', tipo: 'trasladable', mes: 2 },
  { fecha: '2026-03-23', nombre: 'Día no laborable turístico (puente del 24 de marzo)', tipo: 'puente', mes: 3 },
  { fecha: '2026-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'inamovible', mes: 3 },
  { fecha: '2026-04-02', nombre: 'Día del Veterano y de los Caídos en Malvinas', tipo: 'inamovible', mes: 4 },
  { fecha: '2026-04-03', nombre: 'Viernes Santo', tipo: 'inamovible', mes: 4 },
  { fecha: '2026-05-01', nombre: 'Día del Trabajador', tipo: 'inamovible', mes: 5 },
  { fecha: '2026-05-25', nombre: 'Día de la Revolución de Mayo', tipo: 'inamovible', mes: 5 },
  { fecha: '2026-06-15', nombre: 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes', tipo: 'trasladable', mes: 6, trasladadoDe: '2026-06-17' },
  { fecha: '2026-06-20', nombre: 'Paso a la Inmortalidad del Gral. Manuel Belgrano', tipo: 'inamovible', mes: 6 },
  { fecha: '2026-07-09', nombre: 'Día de la Independencia', tipo: 'inamovible', mes: 7 },
  { fecha: '2026-07-10', nombre: 'Día no laborable turístico (puente del 9 de julio)', tipo: 'puente', mes: 7 },
  { fecha: '2026-08-17', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'trasladable', mes: 8 },
  { fecha: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'trasladable', mes: 10 },
  { fecha: '2026-11-23', nombre: 'Día de la Soberanía Nacional', tipo: 'trasladable', mes: 11, trasladadoDe: '2026-11-20' },
  { fecha: '2026-12-07', nombre: 'Día no laborable turístico (puente del 8 de diciembre)', tipo: 'puente', mes: 12 },
  { fecha: '2026-12-08', nombre: 'Inmaculada Concepción de María', tipo: 'no-laborable', mes: 12 },
  { fecha: '2026-12-25', nombre: 'Navidad', tipo: 'inamovible', mes: 12 },
];

export const META = {
  anio: 2026,
  dataAsOf: '2026-06-07',
  fuente: 'Boletín Oficial — Ley 27.399 + Decreto 1584/2010 + Resolución 164/2025',
  fuenteUrl: 'https://www.argentina.gob.ar/interior/feriados-nacionales-2026',
  /** Recordatorio: reverificar y regenerar para el año siguiente cada enero. */
  revisarEn: '2027-01',
} as const;

/** Vigencia del dato (YYYY-MM-DD) — alias de META.dataAsOf para el sello de frescura (src/lib/data-freshness.ts). */
export const DATA_AS_OF: string = META.dataAsOf;

export const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Parsea 'YYYY-MM-DD' como fecha LOCAL (medianoche), no UTC. */
export function parseLocal(s: string): Date {
  const p = String(s || '').split('-').map(Number);
  return new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
}

/** "lunes 15 de junio" a partir de 'YYYY-MM-DD'. */
export function formatFecha(fechaStr: string): string {
  const d = parseLocal(fechaStr);
  const dia = d.getDate();
  const mes = MESES[d.getMonth() + 1];
  const dow = DIAS_SEMANA[d.getDay()];
  return `${dow} ${dia} de ${mes.toLowerCase()}`;
}

/** Etiqueta humana capitalizada para un tipo de feriado. */
export function tipoLabel(tipo: string): string {
  switch (tipo) {
    case 'inamovible': return 'Inamovible';
    case 'trasladable': return 'Trasladable';
    case 'no-laborable': return 'No laborable';
    case 'puente': return 'Puente turístico';
    default: return tipo;
  }
}

/**
 * Feriados nacionales propiamente dichos: inamovibles + trasladables (15).
 * Excluye los puentes turísticos y el día no laborable (Inmaculada).
 */
export function feriadosNacionales(): Feriado[] {
  return FERIADOS_AR_2026.filter(f => f.tipo === 'inamovible' || f.tipo === 'trasladable');
}

/** Puentes turísticos (Resolución 164/2025). */
export function puentes(): Feriado[] {
  return FERIADOS_AR_2026.filter(f => f.tipo === 'puente');
}

/**
 * Devuelve la entrada del calendario que cae en la fecha dada, o null.
 * Acepta Date o string 'YYYY-MM-DD'.
 */
export function feriadoEnFecha(fecha: Date | string): Feriado | null {
  const iso = typeof fecha === 'string'
    ? fecha.slice(0, 10)
    : `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  return FERIADOS_AR_2026.find(f => f.fecha === iso) || null;
}

/**
 * ¿Es día no laborable a efectos de "días hábiles"? True si la fecha cae en
 * cualquier entrada del calendario (feriado, puente o día no laborable).
 */
export function esDiaNoHabilPorFeriado(fecha: Date | string): boolean {
  return feriadoEnFecha(fecha) !== null;
}
