/**
 * Feriados Argentina 2026 — calendario completo con filtros
 */

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

interface Feriado {
  fecha: string; // YYYY-MM-DD
  nombre: string;
  tipo: 'inamovible' | 'trasladable' | 'no-laborable' | 'puente';
  mes: number;
}

const FERIADOS_2026: Feriado[] = [
  { fecha: '2026-01-01', nombre: 'Año Nuevo', tipo: 'inamovible', mes: 1 },
  { fecha: '2026-02-16', nombre: 'Carnaval', tipo: 'trasladable', mes: 2 },
  { fecha: '2026-02-17', nombre: 'Carnaval', tipo: 'trasladable', mes: 2 },
  { fecha: '2026-03-23', nombre: 'Día no laborable turístico (puente del 24 de marzo)', tipo: 'puente', mes: 3 },
  { fecha: '2026-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'inamovible', mes: 3 },
  { fecha: '2026-04-02', nombre: 'Día del Veterano y de los Caídos en Malvinas', tipo: 'inamovible', mes: 4 },
  { fecha: '2026-04-03', nombre: 'Viernes Santo', tipo: 'inamovible', mes: 4 },
  { fecha: '2026-05-01', nombre: 'Día del Trabajador', tipo: 'inamovible', mes: 5 },
  { fecha: '2026-05-25', nombre: 'Día de la Revolución de Mayo', tipo: 'inamovible', mes: 5 },
  { fecha: '2026-06-15', nombre: 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes', tipo: 'trasladable', mes: 6 },
  { fecha: '2026-06-20', nombre: 'Paso a la Inmortalidad del Gral. Manuel Belgrano', tipo: 'inamovible', mes: 6 },
  { fecha: '2026-07-09', nombre: 'Día de la Independencia', tipo: 'inamovible', mes: 7 },
  { fecha: '2026-07-10', nombre: 'Día no laborable turístico (puente del 9 de julio)', tipo: 'puente', mes: 7 },
  { fecha: '2026-08-17', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'trasladable', mes: 8 },
  { fecha: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'trasladable', mes: 10 },
  { fecha: '2026-11-23', nombre: 'Día de la Soberanía Nacional', tipo: 'trasladable', mes: 11 },
  { fecha: '2026-12-07', nombre: 'Día no laborable turístico (puente del 8 de diciembre)', tipo: 'puente', mes: 12 },
  { fecha: '2026-12-08', nombre: 'Inmaculada Concepción de María', tipo: 'no-laborable', mes: 12 },
  { fecha: '2026-12-25', nombre: 'Navidad', tipo: 'inamovible', mes: 12 },
];

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function parseLocal(s: string): Date {
  const p = String(s || '').split('-').map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}

function formatFecha(fechaStr: string): string {
  const d = parseLocal(fechaStr);
  const dia = d.getDate();
  const mes = MESES[d.getMonth() + 1];
  const dow = DIAS_SEMANA[d.getDay()];
  return `${dow} ${dia} de ${mes.toLowerCase()}`;
}

function tipoLabel(tipo: string): string {
  switch (tipo) {
    case 'inamovible': return 'Inamovible';
    case 'trasladable': return 'Trasladable';
    case 'no-laborable': return 'No laborable';
    case 'puente': return 'Puente turístico';
    default: return tipo;
  }
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
