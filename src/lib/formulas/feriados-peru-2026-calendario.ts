/**
 * Feriados Perú 2026 — calendario, próximo feriado y cuántos faltan.
 * Datos: FERIADOS_PE_2026 (fuente única src/lib/data/feriados-latam-2026.ts).
 * El módulo latam no exporta helpers de fecha, así que se definen acá.
 */
import { FERIADOS_PE_2026 } from '../data/feriados-latam-2026.ts';

export interface Inputs {
  mes?: string;            // 'todos' | '1'..'12'
  fechaConsulta?: string;  // 'YYYY-MM-DD' (default: hoy) para el próximo feriado
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const MESES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Parse 'YYYY-MM-DD' como fecha LOCAL (medianoche) para que el conteo de días no dependa del huso. */
function parseLocal(s: string): Date {
  const p = String(s || '').split('-').map(Number);
  return (p.length === 3 && !p.some(isNaN)) ? new Date(p[0], p[1] - 1, p[2]) : new Date(NaN);
}
function formatFecha(fecha: string, dia: string): string {
  const d = parseLocal(fecha);
  return `${dia} ${d.getDate()} de ${MESES[d.getMonth() + 1]}`;
}

export function compute(i: Inputs): Outputs {
  const mesFilter = String(i.mes || 'todos');
  let hoy = parseLocal(i.fechaConsulta || '');
  if (isNaN(hoy.getTime())) { hoy = new Date(); hoy.setHours(0, 0, 0, 0); }

  const total = FERIADOS_PE_2026.length;

  // Filtro por mes.
  let filtrados = [...FERIADOS_PE_2026];
  if (mesFilter !== 'todos') {
    const mesNum = parseInt(mesFilter, 10);
    filtrados = filtrados.filter((f) => parseLocal(f.fecha).getMonth() + 1 === mesNum);
  }

  // Próximo feriado y restantes desde la fecha de consulta.
  const futuros = FERIADOS_PE_2026.filter((f) => parseLocal(f.fecha) >= hoy);
  const feriadosRestantes = futuros.length;

  let proximoFeriado = 'No quedan feriados en 2026';
  let diasHastaProximo = 0;
  if (futuros.length > 0) {
    const prox = futuros[0];
    const proxDate = parseLocal(prox.fecha);
    diasHastaProximo = Math.max(0, Math.ceil((proxDate.getTime() - hoy.getTime()) / 86400000));
    const cola = diasHastaProximo === 0 ? '(¡es hoy!)' : diasHastaProximo === 1 ? '(mañana)' : `(en ${diasHastaProximo} días)`;
    proximoFeriado = `${prox.nombre} — ${formatFecha(prox.fecha, prox.dia)} ${cola}`;
  }

  const listaFeriados = filtrados.length
    ? filtrados.map((f) => `• ${formatFecha(f.fecha, f.dia)} — ${f.nombre}`).join('\n')
    : 'No hay feriados en el mes elegido.';

  // Fines de semana largos: feriado en lunes o viernes (o martes/jueves = posible puente).
  const largos = futuros.filter((f) => {
    const d = parseLocal(f.fecha).getDay();
    return d === 1 || d === 5; // lunes o viernes
  }).map((f) => f.nombre);

  const _insight = feriadosRestantes > 0
    ? {
        title: diasHastaProximo <= 14 ? '¡Feriado a la vuelta!' : 'Próximo feriado',
        text: diasHastaProximo === 0
          ? `Hoy es feriado. Todavía quedan **${feriadosRestantes - 1}** feriados más en lo que resta de 2026.`
          : `Faltan **${diasHastaProximo} días** para el próximo feriado (**${futuros[0].nombre}**, ${formatFecha(futuros[0].fecha, futuros[0].dia)}). En total quedan **${feriadosRestantes}** de los ${total} feriados nacionales de 2026.`,
        tone: diasHastaProximo <= 14 ? 'good' : 'neutral',
        icon: '🇵🇪',
      }
    : {
        title: 'No quedan feriados',
        text: `Ya pasaron los **${total}** feriados nacionales de 2026. El próximo descanso llega con el calendario del año siguiente.`,
        tone: 'neutral',
        icon: '📅',
      };

  return {
    totalFeriados: `${total} feriados nacionales`,
    feriadosRestantes: `${feriadosRestantes} feriados`,
    proximoFeriado,
    diasHastaProximo: `${diasHastaProximo} días`,
    listaFeriados,
    detalle: `Perú tiene ${total} feriados nacionales en 2026. ${mesFilter !== 'todos' ? `En ${MESES[parseInt(mesFilter, 10)]}: ${filtrados.length}. ` : ''}Quedan ${feriadosRestantes} por disfrutar${largos.length ? `. Fines de semana largos posibles: ${largos.join(', ')}.` : '.'}`,
    _insight,
  };
}
