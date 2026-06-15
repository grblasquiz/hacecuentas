/**
 * Licencia de maternidad — Ecuador 2026.
 * Calcula duración (días), fechas inicio/fin y el reparto del pago entre IESS (75%) y empleador (25%).
 *
 * Marco legal (texto vigente verificado contra el Código del Trabajo, art. 152):
 *  - Art. 152, párr. 1: "Toda mujer trabajadora tiene derecho a una licencia con remuneración de
 *    doce (12) semanas por el nacimiento de su hija o hijo; en caso de nacimientos múltiples el plazo
 *    se extiende por diez días adicionales." → 84 días (2 prenatales + 10 posnatales); múltiple = 94.
 *    fuente: Código del Trabajo del Ecuador, art. 152 — https://www.trabajo.gob.ec/
 *  - Art. 153 + reglamento IESS: durante la licencia la madre afiliada cobra el 100% de su
 *    remuneración: el IESS subsidia el 75% y el empleador paga el 25%.
 *    fuente: IESS — Subsidio de maternidad — https://www.iess.gob.ec/
 *
 * OJO (corregido en auditoría): las ampliaciones por CESÁREA (+5 días) y por nacimiento
 * PREMATURO / cuidado especial (+8 días) que introdujo la Ley Orgánica del Derecho al Cuidado
 * Humano (Reg. Oficial 309, 12-may-2023) aplican a la licencia de PATERNIDAD, no a la de
 * maternidad. El art. 152 es explícito: "se prolongará la licencia POR PATERNIDAD ... por ocho
 * días más". La licencia de maternidad solo se extiende por parto múltiple (+10 días). Ver
 * /ec/calculadora-licencia-paternidad-ecuador para las extensiones del padre.
 *
 * Ecuador está dolarizado → todos los montos en USD ("$"). Sin conversión de moneda.
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// --- Constantes del régimen (fuentes en el encabezado) ---
const SEMANAS_BASE = 12;            // Código del Trabajo art. 152
const DIAS_BASE = SEMANAS_BASE * 7; // 84 días corridos
const DIAS_PRENATAL = 14;           // 2 semanas antes de la fecha probable de parto
const DIAS_EXTRA_MULTIPLE = 10;     // parto múltiple, art. 152 (única ampliación de la MATERNIDAD)
const SUBSIDIO_IESS = 0.75;         // IESS subsidia el 75%
const PARTE_EMPLEADOR = 0.25;       // empleador paga el 25%
const APORTES_REQUERIDOS = 12;      // aportaciones mensuales consecutivas para acceder al subsidio (IESS)

export interface Inputs {
  remuneracion: number;            // remuneración mensual (USD) — base del subsidio
  tipoParto?: string;              // 'normal' | 'multiple'
  fechaProbableParto?: string;     // YYYY-MM-DD (opcional, para fechas inicio/fin)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function addDays(d: Date, days: number): Date {
  const r = new Date(d.getTime());
  r.setDate(r.getDate() + days);
  return r;
}
function fmtFecha(d: Date): string {
  return new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
}

export function compute(i: Inputs): Outputs {
  const remuneracion = Number(i.remuneracion) || 0;
  if (remuneracion <= 0) throw new Error('Ingresá tu remuneración mensual');

  const tipo = String(i.tipoParto || 'normal').toLowerCase();

  // Días adicionales según el tipo de parto.
  // La MATERNIDAD solo se amplía por parto múltiple (+10 días, art. 152). Cesárea y prematuro
  // amplían la PATERNIDAD, no la maternidad → no suman días a la licencia de la madre.
  let diasExtra = 0;
  let detalleTipo = 'Parto normal: 12 semanas (84 días).';
  if (tipo === 'multiple') {
    diasExtra = DIAS_EXTRA_MULTIPLE;
    detalleTipo = `Parto múltiple: 12 semanas + ${DIAS_EXTRA_MULTIPLE} días = 94 días (art. 152 Código del Trabajo).`;
  }

  const diasTotales = DIAS_BASE + diasExtra;
  const semanasTotales = Math.round((diasTotales / 7) * 10) / 10;

  // Pago: la madre recibe el 100% de su remuneración durante la licencia.
  // Por la duración total (≈ diasTotales corridos) el monto proporcional es:
  const meses = diasTotales / 30; // meses equivalentes (mes comercial de 30 días)
  const pagoTotal = remuneracion * meses;
  const pagoIESS = pagoTotal * SUBSIDIO_IESS;        // 75%
  const pagoEmpleador = pagoTotal * PARTE_EMPLEADOR; // 25%

  // Por mes de licencia (referencia mensual del reparto)
  const iessMensual = remuneracion * SUBSIDIO_IESS;
  const empleadorMensual = remuneracion * PARTE_EMPLEADOR;

  // Fechas (opcional): inicio = 14 días antes de la FPP; fin = inicio + diasTotales.
  let fechaInicio = '';
  let fechaFin = '';
  let detalleFechas = 'Ingresá la fecha probable de parto para ver las fechas de inicio y fin.';
  const fpp = i.fechaProbableParto ? new Date(i.fechaProbableParto + 'T00:00:00') : null;
  if (fpp && !isNaN(fpp.getTime())) {
    const inicio = addDays(fpp, -DIAS_PRENATAL);
    const fin = addDays(inicio, diasTotales - 1); // ambos extremos inclusive
    fechaInicio = fmtFecha(inicio);
    fechaFin = fmtFecha(fin);
    detalleFechas = `Inicio (2 semanas antes del parto): ${fechaInicio} · Fin: ${fechaFin} · Reincorporación: ${fmtFecha(addDays(fin, 1))}.`;
  }

  const _insight = {
    title: 'Tu licencia de maternidad',
    text: `Te corresponden **${diasTotales} días** (${semanasTotales} semanas) de licencia. Durante ese período cobrás el **100% de tu sueldo**: el IESS te subsidia **${fmtUSDec(pagoIESS)}** (75%) y tu empleador completa **${fmtUSDec(pagoEmpleador)}** (25%), un total de **${fmtUSDec(pagoTotal)}**. Para cobrar el subsidio del IESS necesitás al menos **${APORTES_REQUERIDOS} aportaciones** previas.`,
    tone: 'good',
    icon: '🤰',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Subsidio IESS (75%)', value: Math.round(pagoIESS * 100) / 100 },
      { label: 'Pago empleador (25%)', value: Math.round(pagoEmpleador * 100) / 100 },
    ],
    prefix: '$ ',
    ariaLabel: `Reparto del pago de la licencia: IESS ${fmtUSDec(pagoIESS)} (75%) y empleador ${fmtUSDec(pagoEmpleador)} (25%).`,
  };

  return {
    diasTotales: `${diasTotales} días`,
    semanasTotales: `${semanasTotales} semanas`,
    pagoIESS: fmtUSDec(pagoIESS),
    pagoEmpleador: fmtUSDec(pagoEmpleador),
    pagoTotal: fmtUSDec(pagoTotal),
    iessMensual: fmtUSDec(iessMensual),
    empleadorMensual: fmtUSDec(empleadorMensual),
    fechaInicio: fechaInicio || '—',
    fechaFin: fechaFin || '—',
    detalle: `${detalleTipo} ${detalleFechas} Reparto del pago: IESS 75% (${fmtUSDec(pagoIESS)}) + empleador 25% (${fmtUSDec(pagoEmpleador)}) = ${fmtUSDec(pagoTotal)} por toda la licencia.`,
    _insight,
    _chart,
  };
}
