/**
 * ¿Cuánto tarda Hacienda en devolver la Renta 2025 (campaña 2026)?
 * Estimación según la fecha de presentación + límite legal (31-12-2026, 6 meses
 * desde el fin de campaña) + intereses de demora del 4,0625% anual (PGE 2026)
 * si Hacienda paga después del 31 de diciembre.
 */
import { fmtEUR } from '../data/espana-2026.ts';

export interface Inputs {
  fechaPresentacion: string; // ISO 'YYYY-MM-DD'
  importe: number;           // resultado a devolver (€)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const INTERES_DEMORA_2026 = 0.040625; // 4,0625% anual (Ley PGE)
const FIN_CAMPANA = new Date(2026, 5, 30);   // 30-06-2026
const LIMITE_SIN_INTERESES = new Date(2026, 11, 31); // 31-12-2026

function parseFecha(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
  if (!m) return null;
  const f = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(f.getTime()) ? null : f;
}

function fmtFecha(d: Date): string {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

export function compute(i: Inputs): Outputs {
  const fecha = parseFecha(i.fechaPresentacion);
  const importe = Math.max(0, Number(i.importe) || 0);
  if (!fecha) throw new Error('Introduce la fecha en que presentaste la declaración');
  if (importe <= 0) throw new Error('Introduce el importe a devolver');

  // Estimación estadística según el momento de presentación (patrón histórico AEAT:
  // ~70% de las devoluciones se pagan en el primer mes de campaña si se presenta pronto).
  const mes = fecha.getMonth(); // 0-based
  let estimacion: string;
  let rangoDias: [number, number];
  if (fecha <= new Date(2026, 3, 30)) {
    estimacion = 'entre 2 días y 2 semanas';
    rangoDias = [2, 14];
  } else if (mes === 4) {
    estimacion = 'entre 1 y 4 semanas';
    rangoDias = [7, 30];
  } else if (fecha <= FIN_CAMPANA) {
    estimacion = 'entre 3 semanas y 3 meses';
    rangoDias = [21, 90];
  } else {
    estimacion = 'entre 1 y 6 meses (presentación fuera de plazo: pasa a revisión y pierde prioridad)';
    rangoDias = [30, 180];
  }

  const desde = new Date(fecha); desde.setDate(desde.getDate() + rangoDias[0]);
  const hasta = new Date(fecha); hasta.setDate(hasta.getDate() + rangoDias[1]);
  const ventana = `entre el ${fmtFecha(desde)} y el ${fmtFecha(hasta)} (orientativo)`;

  // Intereses de demora si Hacienda paga después del 31-12-2026
  const interesDiario = (importe * INTERES_DEMORA_2026) / 365;
  const interesMes = interesDiario * 30;

  const _insight = {
    title: '¿Cuándo cobrarás la devolución?',
    text: `Presentaste el **${fmtFecha(fecha)}** con **${fmtEUR(importe)}** a devolver. Estadísticamente, Hacienda suele pagar en ese caso **${estimacion}**. El límite legal sin coste para Hacienda es el **31 de diciembre de 2026**: a partir de ahí te debe **intereses de demora del 4,0625% anual** (unos ${fmtEUR(interesMes)} por cada mes de retraso sobre tu importe), que se abonan automáticamente junto con la devolución.`,
    tone: fecha > FIN_CAMPANA ? 'warning' : 'good',
    icon: '💶',
  };
  const _chart = {
    type: 'gauge',
    value: rangoDias[1],
    min: 0,
    max: 180,
    label: `hasta ~${rangoDias[1]} días`,
    ariaLabel: `Plazo estimado máximo de la devolución: ${rangoDias[1]} días desde la presentación.`,
  };

  return {
    estimacion: `Suele pagarse ${estimacion}`,
    ventana,
    limiteLegal: `31 de diciembre de 2026 (6 meses desde el fin de campaña)`,
    interesesSiDemora: `${fmtEUR(interesDiario)} por día · ${fmtEUR(interesMes)} por mes (4,0625% anual) a partir del 1-1-2027`,
    detalle: `Importe a devolver: ${fmtEUR(importe)} · presentada el ${fmtFecha(fecha)}${fecha > FIN_CAMPANA ? ' (fuera de plazo)' : ''}.`,
    _insight,
    _chart,
  };
}
