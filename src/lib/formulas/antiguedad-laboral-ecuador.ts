/** Antigüedad laboral (Ecuador) 2026 — años, meses y días de servicio + derechos que desbloquea.
 *  Fuente: Código del Trabajo del Ecuador, arts. 69 (vacaciones) y 188 (despido intempestivo).
 *  Escalas: vacaciones 15 días/año + 1 día adicional por cada año desde el 6º (tope 30);
 *  indemnización por despido intempestivo: hasta 3 años = 3 remuneraciones; más de 3 años =
 *  1 remuneración por año de servicio, con un máximo de 25 remuneraciones (fracción = año). */
import { fmtUSDec } from '../data/ecuador-2026.ts';

const VACACIONES_BASE = 15;        // 15 días/año (art. 69)
const VACACIONES_TOPE = 30;        // tope de días de vacaciones
const INDEM_MINIMA_REMUN = 3;      // hasta 3 años: 3 remuneraciones
const INDEM_TOPE_REMUN = 25;       // máximo 25 remuneraciones

export interface Inputs {
  fechaIngreso: string;
  fechaHasta?: string;
  remuneracionMensual?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function diffFechas(ingreso: Date, hasta: Date) {
  let anios = hasta.getFullYear() - ingreso.getFullYear();
  let meses = hasta.getMonth() - ingreso.getMonth();
  let dias = hasta.getDate() - ingreso.getDate();
  if (dias < 0) {
    meses--;
    const mesAnterior = new Date(hasta.getFullYear(), hasta.getMonth(), 0);
    dias += mesAnterior.getDate();
  }
  if (meses < 0) { anios--; meses += 12; }
  return { anios, meses, dias };
}

export function compute(i: Inputs): Outputs {
  const partsIng = String(i.fechaIngreso || '').split('-').map(Number);
  if (partsIng.length !== 3 || partsIng.some(isNaN)) throw new Error('Ingresá una fecha de ingreso válida (AAAA-MM-DD)');
  const [yI, mI, dI] = partsIng;
  const fechaIngreso = new Date(yI, mI - 1, dI);

  let fechaHasta: Date;
  if (i.fechaHasta) {
    const p = String(i.fechaHasta).split('-').map(Number);
    if (p.length !== 3 || p.some(isNaN)) throw new Error('Ingresá una fecha de cálculo válida (AAAA-MM-DD)');
    fechaHasta = new Date(p[0], p[1] - 1, p[2]);
  } else {
    fechaHasta = new Date(2026, 6, 6); // hoy: 2026-07-06
  }
  if (isNaN(fechaIngreso.getTime())) throw new Error('Ingresá una fecha de ingreso válida');
  if (fechaIngreso > fechaHasta) throw new Error('La fecha de ingreso no puede ser posterior a la fecha de cálculo');

  const totalDias = Math.round((fechaHasta.getTime() - fechaIngreso.getTime()) / 86400000);
  const { anios, meses, dias } = diffFechas(fechaIngreso, fechaHasta);
  const totalMeses = anios * 12 + meses;

  const partes: string[] = [];
  if (anios > 0) partes.push(`${anios} año${anios !== 1 ? 's' : ''}`);
  if (meses > 0) partes.push(`${meses} mes${meses !== 1 ? 'es' : ''}`);
  if (dias > 0) partes.push(`${dias} día${dias !== 1 ? 's' : ''}`);
  const antiguedad = partes.length ? partes.join(', ') : '0 días';

  // Vacaciones: 15 días + 1 día por cada año a partir del sexto (desde el 6º año de servicio),
  // hasta un máximo de 30 días.
  const diasExtra = anios >= 6 ? Math.min(anios - 5, VACACIONES_TOPE - VACACIONES_BASE) : 0;
  const diasVacaciones = VACACIONES_BASE + diasExtra;

  // Indemnización por despido intempestivo (art. 188): hasta 3 años = 3 remuneraciones;
  // más de 3 años = 1 remuneración por año (fracción de año cuenta como año completo), máx. 25.
  const aniosParaIndem = (meses > 0 || dias > 0) ? anios + 1 : anios; // fracción = año completo
  let remunIndem: number;
  if (aniosParaIndem <= 3) {
    remunIndem = INDEM_MINIMA_REMUN;
  } else {
    remunIndem = Math.min(aniosParaIndem, INDEM_TOPE_REMUN);
  }

  const remun = Number(i.remuneracionMensual) || 0;
  let indemMonto = '';
  if (remun > 0) indemMonto = fmtUSDec(remun * remunIndem);

  const beneficios =
    `Con **${antiguedad}** en Ecuador te corresponde: **${diasVacaciones} días de vacaciones** ` +
    `(15 base${diasExtra > 0 ? ` + ${diasExtra} día${diasExtra !== 1 ? 's' : ''} de antigüedad desde el 6º año` : '; los días extra empiezan a partir del 6º año'}, art. 69); ` +
    `los **décimo tercero y décimo cuarto** sueldos; y, ante un **despido intempestivo**, una indemnización de ` +
    `**${remunIndem} remuneraciones** (art. 188: 3 sueldos hasta 3 años, luego 1 sueldo por año, tope 25)` +
    (remun > 0 ? ` ≈ **${indemMonto}**.` : ' (ingresá tu remuneración para ver el monto).');

  const _insight = {
    title: 'Tu antigüedad y tus derechos',
    text: `Llevás **${antiguedad}** (${totalDias.toLocaleString('es-EC')} días corridos). Te dan **${diasVacaciones} días de vacaciones** este tramo y, ante un despido intempestivo, **${remunIndem} remuneraciones** de indemnización (art. 188)${remun > 0 ? ` ≈ **${indemMonto}**` : ''}.`,
    tone: 'neutral',
    icon: '📅',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Vacaciones (días)', value: diasVacaciones },
      { label: 'Indemnización (×remun.)', value: remunIndem },
    ],
    ariaLabel: `Vacaciones ${diasVacaciones} días, indemnización ${remunIndem} remuneraciones.`,
  };

  return {
    antiguedad,
    totalMeses,
    totalDias,
    beneficios,
    detalle: `Del ${dI}/${mI}/${yI} al ${fechaHasta.getDate()}/${fechaHasta.getMonth() + 1}/${fechaHasta.getFullYear()}: ${antiguedad} = ${totalMeses.toLocaleString('es-EC')} meses = ${totalDias.toLocaleString('es-EC')} días. Vacaciones = 15${diasExtra > 0 ? ` + ${diasExtra}` : ''} = ${diasVacaciones} días. Indemnización art. 188: ${remunIndem} remuneraciones${remun > 0 ? ` ≈ ${indemMonto}` : ''}.`,
    _insight,
    _chart,
  };
}
