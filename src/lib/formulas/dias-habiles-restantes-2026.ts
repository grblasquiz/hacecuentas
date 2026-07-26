/**
 * ¿Cuántos días hábiles quedan en 2026? — desde hoy (o una fecha elegida)
 * hasta el 31/12/2026, descontando fines de semana y feriados oficiales.
 * Datos: src/lib/data/feriados-ar-2026.ts + src/lib/data/feriados-latam-2026.ts
 * (fuentes únicas verificadas del repo — no se inventan feriados).
 */

import { FERIADOS_AR_2026 } from '../data/feriados-ar-2026';
import { FERIADOS_LATAM_2026 } from '../data/feriados-latam-2026';

export interface DiasHabilesRestantes2026Inputs {
  pais: string;
  fechaDesde: string;
}

export interface DiasHabilesRestantes2026Outputs {
  resultado: number;
  resumen: string;
  detalle: string;
  explicacion: string;
}

const FIN = new Date(2026, 11, 31);

function parseLocal(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmt(d: Date): string {
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Set de fechas 'YYYY-MM-DD' no laborables por feriado, según país. */
export function feriadosDePais(pais: string): { fechas: Map<string, string>; nombrePais: string } {
  const fechas = new Map<string, string>();
  if (pais === 'argentina') {
    for (const f of FERIADOS_AR_2026) fechas.set(f.fecha, f.nombre);
    return { fechas, nombrePais: 'Argentina' };
  }
  const p = (FERIADOS_LATAM_2026 as Record<string, any>)[pais];
  if (!p) {
    for (const f of FERIADOS_AR_2026) fechas.set(f.fecha, f.nombre);
    return { fechas, nombrePais: 'Argentina' };
  }
  for (const f of p.feriados) fechas.set(f.fecha, f.nombre);
  return { fechas, nombrePais: p.pais };
}

function iso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function diasHabilesRestantes2026(
  inputs: DiasHabilesRestantes2026Inputs
): DiasHabilesRestantes2026Outputs {
  const pais = inputs.pais || 'argentina';
  const { fechas: feriados, nombrePais } = feriadosDePais(pais);

  let desde: Date;
  const raw = (inputs.fechaDesde || '').trim();
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    desde = parseLocal(raw);
  } else {
    desde = new Date();
  }
  desde.setHours(0, 0, 0, 0);

  if (desde > FIN) {
    return {
      resultado: 0,
      resumen: 'La fecha elegida es posterior al 31/12/2026: no quedan días hábiles de 2026 por contar.',
      detalle: '',
      explicacion: 'Elegí una fecha dentro de 2026 (o dejá el campo vacío para contar desde hoy).',
    };
  }
  const inicio2026 = new Date(2026, 0, 1);
  if (desde < inicio2026) desde = inicio2026;

  let habiles = 0;
  let finde = 0;
  let feriadosEnSemana = 0;
  let feriadosRestantes = 0;
  const listaFeriados: string[] = [];
  let totalDias = 0;

  const d = new Date(desde);
  while (d <= FIN) {
    totalDias++;
    const dow = d.getDay();
    const key = iso(d);
    const esFeriado = feriados.has(key);
    if (esFeriado) {
      feriadosRestantes++;
      listaFeriados.push(`• ${fmt(d)} — ${feriados.get(key)}`);
    }
    if (dow === 0 || dow === 6) {
      finde++;
    } else if (esFeriado) {
      feriadosEnSemana++;
    } else {
      habiles++;
    }
    d.setDate(d.getDate() + 1);
  }

  const resumen =
    `Desde el ${fmt(desde)} hasta el 31 de diciembre de 2026 quedan ${habiles} días hábiles en ${nombrePais}. ` +
    `En el mismo período hay ${totalDias} días de calendario: ${finde} caen en fin de semana y ` +
    `${feriadosRestantes} son feriados o días no laborables oficiales (${feriadosEnSemana} de ellos caen de lunes a viernes y por eso se descuentan).`;

  const detalle = listaFeriados.length
    ? `Feriados de ${nombrePais} que quedan en 2026:\n${listaFeriados.join('\n')}`
    : `No quedan feriados oficiales de ${nombrePais} en lo que resta de 2026.`;

  const explicacion =
    `Se cuentan los días de lunes a viernes entre la fecha elegida y el 31/12/2026, y se descuentan los feriados oficiales de ${nombrePais} que caen en día de semana. ` +
    `Los feriados que caen sábado o domingo no restan días hábiles (ya eran no laborables). El día inicial se incluye en el conteo si es hábil.`;

  return { resultado: habiles, resumen, detalle, explicacion };
}
