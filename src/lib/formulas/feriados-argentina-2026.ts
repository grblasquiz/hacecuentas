/**
 * Feriados Argentina 2026 — calendario completo con filtros.
 * Datos: src/lib/data/feriados-ar-2026.ts (fuente única).
 */

import { FERIADOS_AR_2026 as FERIADOS_2026, MESES, parseLocal, formatFecha, tipoLabel } from '../data/feriados-ar-2026';

export interface FeriadosArgentina2026Inputs {
  mes: string;
  tipo: string;
}

export interface FeriadosArgentina2026Outputs {
  totalFeriados: number;
  feriadosRestantes: number;
  proximoFeriado: string;
  diasHastaProximo: number;
  listaFeriados: string;
  explicacion: string;
  _insight?: any;
}

export function feriadosArgentina2026(inputs: FeriadosArgentina2026Inputs): FeriadosArgentina2026Outputs {
  const mesFilter = inputs.mes || 'todos';
  const tipoFilter = inputs.tipo || 'todos';

  // "Feriados nacionales" = inamovibles + trasladables (15). Los puentes turísticos
  // y el día no laborable (Inmaculada) son días libres pero NO feriados nacionales.
  const nacionales = FERIADOS_2026.filter(f => f.tipo === 'inamovible' || f.tipo === 'trasladable').length;

  // Filter
  let filtrados = [...FERIADOS_2026];

  if (mesFilter !== 'todos') {
    const mesNum = parseInt(mesFilter, 10);
    filtrados = filtrados.filter(f => f.mes === mesNum);
  }

  if (tipoFilter !== 'todos') {
    filtrados = filtrados.filter(f => f.tipo === tipoFilter);
  }

  // Próximo feriado
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const futuros = FERIADOS_2026.filter(f => {
    const d = parseLocal(f.fecha);
    return d >= hoy;
  });

  let proximoFeriado = 'No hay más feriados en 2026';
  let diasHastaProximo = 0;

  if (futuros.length > 0) {
    const prox = futuros[0];
    const proxDate = parseLocal(prox.fecha);
    diasHastaProximo = Math.ceil((proxDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    proximoFeriado = `${prox.nombre} — ${formatFecha(prox.fecha)}`;
    if (diasHastaProximo === 0) {
      proximoFeriado += ' (¡es hoy!)';
    } else if (diasHastaProximo === 1) {
      proximoFeriado += ' (mañana)';
    } else {
      proximoFeriado += ` (en ${diasHastaProximo} días)`;
    }
  }

  // Lista formateada
  const lista = filtrados.map(f => {
    return `• ${formatFecha(f.fecha)} — ${f.nombre} [${tipoLabel(f.tipo)}]`;
  }).join('\n');

  const feriadosRestantes = futuros.length;

  // Explicación
  const totalTxt = filtrados.length;
  let explicacion: string;
  if (mesFilter !== 'todos' && tipoFilter !== 'todos') {
    explicacion = `Mostrando ${totalTxt} feriado(s) de tipo "${tipoLabel(tipoFilter)}" en ${MESES[parseInt(mesFilter, 10)]}. En total, Argentina tiene ${nacionales} feriados nacionales en 2026 (más 3 puentes turísticos y 1 día no laborable).`;
  } else if (mesFilter !== 'todos') {
    explicacion = `En ${MESES[parseInt(mesFilter, 10)]} 2026 hay ${totalTxt} feriado(s). Quedan ${feriadosRestantes} feriados en lo que resta del año.`;
  } else if (tipoFilter !== 'todos') {
    explicacion = `Hay ${totalTxt} feriado(s) de tipo "${tipoLabel(tipoFilter)}" en 2026. Quedan ${feriadosRestantes} feriados en lo que resta del año.`;
  } else {
    explicacion = `Argentina tiene ${nacionales} feriados nacionales en 2026 (más 3 puentes turísticos y el día no laborable del 8 de diciembre). Quedan ${feriadosRestantes} días no laborables por disfrutar.`;
  }

  // Insight
  let _insight: FeriadosArgentina2026Outputs['_insight'];
  if (futuros.length === 0) {
    _insight = {
      title: 'No quedan feriados',
      text: `Ya pasaron los **${nacionales}** feriados nacionales de 2026. El próximo descanso largo recién llega con el calendario del año siguiente.`,
      tone: 'neutral',
      icon: '📅',
    };
  } else {
    const prox = futuros[0];
    const nombreProx = prox.nombre;
    const cercano = diasHastaProximo <= 14;
    _insight = {
      title: cercano ? '¡Feriado a la vuelta!' : 'Próximo feriado',
      text: diasHastaProximo === 0
        ? `Hoy es feriado: **${nombreProx}**. Todavía quedan **${feriadosRestantes - 1}** feriados más en lo que resta de 2026.`
        : `Faltan **${diasHastaProximo} días** para el próximo feriado (**${nombreProx}**). En total te quedan **${feriadosRestantes}** feriados por disfrutar este año.`,
      tone: cercano ? 'good' : 'neutral',
      icon: cercano ? '🎉' : '📅',
    };
  }

  return {
    totalFeriados: filtrados.length,
    feriadosRestantes,
    proximoFeriado,
    diasHastaProximo,
    listaFeriados: lista || 'No hay feriados con ese filtro.',
    explicacion,
    _insight,
  };
}
