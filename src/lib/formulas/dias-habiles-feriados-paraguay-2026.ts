/**
 * Días hábiles entre dos fechas — Paraguay 2026.
 *
 * Cuenta los días hábiles (lunes a viernes, opcionalmente incluyendo sábado) entre
 * dos fechas, descontando los 13 feriados nacionales de 2026 (FERIADOS_PY_2026),
 * ya con los traslados confirmados por el Ejecutivo. Devuelve además los días
 * corridos, los feriados que caen en el rango y cuántos fines de semana hay.
 */
import { FERIADOS_PY_2026 } from '../data/paraguay-2026.ts';

export interface Inputs {
  fechaInicio?: string;   // YYYY-MM-DD
  fechaFin?: string;      // YYYY-MM-DD
  incluyeSabado?: string; // 'si' cuenta el sábado como hábil
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

const FERIADOS = new Set(FERIADOS_PY_2026.map((f) => f.fecha));

function parseFecha(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
  if (!m) throw new Error('Ingresá las fechas en formato AAAA-MM-DD');
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}
function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function compute(i: Inputs): Outputs {
  const inicio = parseFecha(i.fechaInicio || '');
  const fin = parseFecha(i.fechaFin || '');
  if (fin < inicio) throw new Error('La fecha final debe ser posterior (o igual) a la inicial');
  const incluyeSabado = String(i.incluyeSabado || 'no') === 'si';

  let corridos = 0;
  let habiles = 0;
  let feriadosEnRango = 0;
  let finesSemana = 0;
  const feriadosLista: string[] = [];

  const d = new Date(inicio.getTime());
  while (d <= fin) {
    corridos++;
    const dow = d.getUTCDay(); // 0 dom, 6 sáb
    const esFeriado = FERIADOS.has(iso(d));
    const esFinde = dow === 0 || dow === 6;
    if (esFinde) finesSemana++;
    if (esFeriado) {
      feriadosEnRango++;
      const info = FERIADOS_PY_2026.find((f) => f.fecha === iso(d));
      if (info) feriadosLista.push(`${info.fecha} — ${info.nombre}`);
    }
    const esHabil = esFeriado ? false : (incluyeSabado ? dow !== 0 : dow !== 0 && dow !== 6);
    if (esHabil) habiles++;
    d.setUTCDate(d.getUTCDate() + 1);
  }

  const _table = {
    title: 'Feriados nacionales de Paraguay 2026 (fechas observadas)',
    headers: ['Fecha', 'Feriado'],
    rows: FERIADOS_PY_2026.map((f) => [f.fecha.split('-').reverse().join('/'), f.nombre]),
    note: '13 feriados. Los feriados movibles (Héroes, Paz del Chaco, Jura de la Constitución, Boquerón) pueden ser reubicados por decreto del Ejecutivo; verificá el calendario oficial.',
  };

  const _insight = {
    type: 'highlight',
    icon: '📅',
    text: `Entre ${i.fechaInicio} y ${i.fechaFin} hay **${habiles} días hábiles** (${incluyeSabado ? 'lun a sáb' : 'lun a vie'}), sobre ${corridos} días corridos. En el rango caen ${feriadosEnRango} feriado${feriadosEnRango === 1 ? '' : 's'} nacional${feriadosEnRango === 1 ? '' : 'es'}.`,
  };

  return {
    diasHabiles: `${habiles} días hábiles`,
    diasCorridos: `${corridos} días`,
    feriados: `${feriadosEnRango} feriado${feriadosEnRango === 1 ? '' : 's'}`,
    finesSemana: `${finesSemana} días de fin de semana`,
    detalle: `${corridos} días corridos − ${finesSemana} de fin de semana${incluyeSabado ? ' (solo domingos)' : ''} − ${feriadosEnRango} feriados hábiles = ${habiles} días hábiles.` +
      (feriadosLista.length ? ` Feriados en el rango: ${feriadosLista.join('; ')}.` : ''),
    _insight,
    _table,
  };
}
