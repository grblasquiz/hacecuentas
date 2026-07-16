/**
 * Días laborables entre dos fechas en República Dominicana, descontando fines de
 * semana y los feriados oficiales 2026 (Ministerio de Trabajo, Ley 139-97 — los
 * feriados que caen martes a viernes se trasladan al lunes). Utilidad de
 * calendario, sin dinero.
 */

export interface Inputs {
  fechaInicio: string;      // YYYY-MM-DD
  fechaFin: string;         // YYYY-MM-DD
  incluirSabados?: string;  // 'si' cuenta los sábados como laborables
}
export interface Outputs { [k: string]: any; _insight?: any; }

// Feriados oficiales de RD 2026 (ya trasladados según la Ley 139-97), YYYY-MM-DD.
// Reyes (05-ene, de mar 6), Trabajo (04-may, de vie 1) y Constitución (09-nov,
// de vie 6) trasladados a lunes; el resto en su fecha.
const FERIADOS_2026 = new Set([
  '2026-01-01', // Año Nuevo (jue)
  '2026-01-05', // Día de Reyes (trasladado del mar 6)
  '2026-01-21', // Ntra. Sra. de la Altagracia (inamovible)
  '2026-01-26', // Día de Duarte (lun)
  '2026-02-27', // Día de la Independencia (inamovible)
  '2026-04-03', // Viernes Santo
  '2026-05-04', // Día del Trabajo (trasladado del vie 1)
  '2026-06-04', // Corpus Christi
  '2026-08-16', // Día de la Restauración (dom)
  '2026-09-24', // Ntra. Sra. de las Mercedes (inamovible)
  '2026-11-09', // Día de la Constitución (trasladado del vie 6)
  '2026-12-25', // Navidad
]);

const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function parseUTC(s: string): number {
  const [y, m, d] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}
function toISO(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function compute(i: Inputs): Outputs {
  const ini = String(i.fechaInicio || '');
  const fin = String(i.fechaFin || '');
  if (!RE_FECHA.test(ini) || !RE_FECHA.test(fin)) {
    throw new Error('Ingresá las fechas en formato AAAA-MM-DD');
  }
  const msIni = parseUTC(ini);
  const msFin = parseUTC(fin);
  if (Number.isNaN(msIni) || Number.isNaN(msFin)) throw new Error('Fechas inválidas');
  if (msFin < msIni) throw new Error('La fecha final debe ser posterior a la inicial');
  const DIA = 86_400_000;
  const totalDias = Math.round((msFin - msIni) / DIA) + 1; // ambos extremos inclusive
  if (totalDias > 3660) throw new Error('El rango no puede superar 10 años');

  const cuentaSabado = String(i.incluirSabados || 'no') === 'si';
  let laborables = 0;
  let finesDeSemana = 0;
  let feriadosHabiles = 0; // feriados que caen en día que de otro modo sería laborable

  for (let ms = msIni; ms <= msFin; ms += DIA) {
    const dow = new Date(ms).getUTCDay(); // 0 dom … 6 sáb
    const esDomingo = dow === 0;
    const esSabado = dow === 6;
    const esFinde = esDomingo || (esSabado && !cuentaSabado);
    if (esFinde) { finesDeSemana++; continue; }
    if (FERIADOS_2026.has(toISO(ms))) { feriadosHabiles++; continue; }
    laborables++;
  }

  const _insight = {
    title: 'Días laborables del período',
    text: `Entre el ${ini} y el ${fin} hay **${totalDias}** días en total: **${laborables}** laborables, ${finesDeSemana} de fin de semana y ${feriadosHabiles} feriado(s) que caen en día hábil. ${cuentaSabado ? 'Los sábados se cuentan como laborables.' : 'Los sábados no se cuentan como laborables.'}`,
    tone: 'neutral',
    icon: '📅',
  };

  return {
    laborables: `${laborables} días`,
    totalDias: `${totalDias} días`,
    finesDeSemana: `${finesDeSemana} días`,
    feriados: `${feriadosHabiles} feriado(s)`,
    detalle: `${totalDias} días corridos → ${laborables} laborables (− ${finesDeSemana} de fin de semana y ${feriadosHabiles} feriado(s) hábiles).`,
    _insight,
  };
}
