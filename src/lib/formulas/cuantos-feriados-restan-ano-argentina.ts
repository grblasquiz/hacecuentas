/**
 * Cuántos feriados restan del año — Argentina 2026.
 * Datos: src/lib/data/feriados-ar-2026.ts (fuente única).
 *
 * Cuenta, desde una fecha de referencia (la ingresada o hoy), cuántos feriados
 * nacionales quedan en 2026, lista los próximos y muestra el siguiente con los
 * días que faltan. Los puentes turísticos y el día no laborable (8/12) se
 * informan aparte, no se suman al conteo de "feriados nacionales".
 */

import {
  FERIADOS_AR_2026,
  feriadosNacionales,
  parseLocal,
  formatFecha,
  tipoLabel,
} from '../data/feriados-ar-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }

export function cuantosFeriadosRestanAnoArgentina(i: Inputs): Outputs {
  // Fecha de referencia: la ingresada, o hoy si el campo viene vacío.
  const raw = String(i.fecha1 || '').trim();
  let desde: Date;
  if (raw) {
    const parts = raw.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return { resultado: '—', resumen: 'Fecha inválida. Usá el formato AAAA-MM-DD (ej.: 2026-06-08).' };
    }
    desde = new Date(parts[0], parts[1] - 1, parts[2]);
    if (isNaN(desde.getTime())) {
      return { resultado: '—', resumen: 'Fecha inválida. Usá el formato AAAA-MM-DD (ej.: 2026-06-08).' };
    }
  } else {
    desde = new Date();
  }
  desde.setHours(0, 0, 0, 0);

  // Feriados nacionales (inamovibles + trasladables) que quedan desde la fecha (inclusive).
  const restantesNac = feriadosNacionales().filter(f => parseLocal(f.fecha) >= desde);
  // Días no laborables extra que quedan (puentes turísticos + Inmaculada 8/12).
  const restantesExtra = FERIADOS_AR_2026.filter(
    f => (f.tipo === 'puente' || f.tipo === 'no-laborable') && parseLocal(f.fecha) >= desde
  );
  // Todo lo que queda (feriados + puentes + no laborable), en orden cronológico.
  const restantesTodos = FERIADOS_AR_2026.filter(f => parseLocal(f.fecha) >= desde);

  const quedanNac = restantesNac.length;
  const quedanExtra = restantesExtra.length;

  const refTxt = formatFecha(
    `${desde.getFullYear()}-${String(desde.getMonth() + 1).padStart(2, '0')}-${String(desde.getDate()).padStart(2, '0')}`
  );

  // Lista de lo que queda.
  const lista = restantesTodos.length
    ? restantesTodos.map(f => `• ${formatFecha(f.fecha)} — ${f.nombre} [${tipoLabel(f.tipo)}]`).join('\n')
    : 'No quedan feriados en 2026.';

  // Próximo feriado nacional y días que faltan.
  let resumen: string;
  let _insight: any;
  if (restantesTodos.length === 0) {
    resumen = `Desde el ${refTxt} ya no quedan feriados ni días no laborables en 2026. El próximo descanso largo llega con el calendario del año siguiente.`;
    _insight = {
      title: 'No quedan feriados',
      text: 'Ya pasaron todos los feriados de 2026. El calendario se renueva en enero del año siguiente.',
      tone: 'neutral',
      icon: '📅',
    };
  } else {
    const prox = restantesTodos[0];
    const proxDate = parseLocal(prox.fecha);
    const diasHasta = Math.round((proxDate.getTime() - desde.getTime()) / 86400000);
    const cuando = diasHasta === 0 ? 'es hoy' : diasHasta === 1 ? 'es mañana' : `en ${diasHasta} días`;
    const extraTxt = quedanExtra > 0
      ? ` Sumá ${quedanExtra} día(s) no laborable(s) más entre puentes turísticos y el 8 de diciembre.`
      : '';
    resumen = `Desde el ${refTxt} quedan ${quedanNac} feriado(s) nacional(es) en 2026.${extraTxt} El próximo es ${prox.nombre} (${formatFecha(prox.fecha)}, ${cuando}).`;
    const cercano = diasHasta <= 14;
    _insight = {
      title: cercano ? '¡Feriado a la vuelta!' : 'Próximo descanso',
      text: diasHasta === 0
        ? `Hoy es **${prox.nombre}**. Todavía quedan **${restantesTodos.length - 1}** días no laborables más en 2026.`
        : `Faltan **${diasHasta} días** para **${prox.nombre}**. En total te quedan **${quedanNac} feriados nacionales** (y ${quedanExtra} días no laborables extra) en lo que resta de 2026.`,
      tone: cercano ? 'good' : 'neutral',
      icon: cercano ? '🎉' : '📅',
    };
  }

  return {
    resultado: `${quedanNac} feriado${quedanNac === 1 ? '' : 's'}`,
    resumen,
    lista,
    _insight,
  };
}
