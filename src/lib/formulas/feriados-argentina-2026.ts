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
  { fecha: '2026-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'inamovible', mes: 3 },
  { fecha: '2026-04-02', nombre: 'Día del Veterano y de los Caídos en Malvinas', tipo: 'inamovible', mes: 4 },
  { fecha: '2026-04-03', nombre: 'Viernes Santo', tipo: 'inamovible', mes: 4 },
  { fecha: '2026-05-01', nombre: 'Día del Trabajador', tipo: 'inamovible', mes: 5 },
  { fecha: '2026-05-25', nombre: 'Día de la Revolución de Mayo', tipo: 'inamovible', mes: 5 },
  { fecha: '2026-06-15', nombre: 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes', tipo: 'trasladable', mes: 6 },
  { fecha: '2026-06-20', nombre: 'Paso a la Inmortalidad del Gral. Manuel Belgrano', tipo: 'inamovible', mes: 6 },
  { fecha: '2026-07-09', nombre: 'Día de la Independencia', tipo: 'inamovible', mes: 7 },
  { fecha: '2026-08-17', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'trasladable', mes: 8 },
  { fecha: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'trasladable', mes: 10 },
  { fecha: '2026-11-20', nombre: 'Día de la Soberanía Nacional', tipo: 'trasladable', mes: 11 },
  { fecha: '2026-12-08', nombre: 'Inmaculada Concepción de María', tipo: 'no-laborable', mes: 12 },
  { fecha: '2026-12-25', nombre: 'Navidad', tipo: 'inamovible', mes: 12 },
];

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function formatFecha(fechaStr: string): string {
  const d = new Date(fechaStr + 'T00:00:00');
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
    const d = new Date(f.fecha + 'T00:00:00');
    return d >= hoy;
  });

  let proximoFeriado = 'No hay más feriados en 2026';
  let diasHastaProximo = 0;

  if (futuros.length > 0) {
    const prox = futuros[0];
    const proxDate = new Date(prox.fecha + 'T00:00:00');
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
    explicacion = `Mostrando ${totalTxt} feriado(s) de tipo "${tipoLabel(tipoFilter)}" en ${MESES[parseInt(mesFilter, 10)]}. En total, Argentina tiene ${FERIADOS_2026.length} feriados nacionales en 2026.`;
  } else if (mesFilter !== 'todos') {
    explicacion = `En ${MESES[parseInt(mesFilter, 10)]} 2026 hay ${totalTxt} feriado(s). Quedan ${feriadosRestantes} feriados en lo que resta del año.`;
  } else if (tipoFilter !== 'todos') {
    explicacion = `Hay ${totalTxt} feriado(s) de tipo "${tipoLabel(tipoFilter)}" en 2026. Quedan ${feriadosRestantes} feriados en lo que resta del año.`;
  } else {
    explicacion = `Argentina tiene ${FERIADOS_2026.length} feriados nacionales en 2026. Quedan ${feriadosRestantes} por disfrutar.`;
  }

  return {
    totalFeriados: filtrados.length,
    feriadosRestantes,
    proximoFeriado,
    diasHastaProximo,
    listaFeriados: lista || 'No hay feriados con ese filtro.',
    explicacion,
  };
}
