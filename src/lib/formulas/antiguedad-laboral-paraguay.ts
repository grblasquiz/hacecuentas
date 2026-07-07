/** Antigüedad laboral (Paraguay) 2026 — años, meses y días de servicio + derechos que desbloquea.
 *  Fuente: Código del Trabajo (Ley 213/93), arts. 218 (vacaciones) y 91 (indemnización).
 *  Escalas: vacaciones escalonadas por antigüedad (hasta 5 años = 12 días hábiles; >5 a 10 = 18;
 *  >10 = 30). Indemnización por despido injustificado = 15 salarios diarios por año de servicio
 *  o fracción superior a 6 meses. */
import { fmtPYG } from '../data/paraguay-2026.ts';

const INDEM_SALARIOS_DIARIOS_POR_ANIO = 15; // 15 salarios diarios por año (art. 91)
const DIAS_MES_SALARIO = 30;                 // divisor para pasar de salario mensual a diario

export interface Inputs {
  fechaIngreso: string;
  fechaHasta?: string;
  salarioMensual?: number;
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

  // Vacaciones escalonadas (art. 218): hasta 5 años = 12; más de 5 hasta 10 = 18; más de 10 = 30.
  let diasVacaciones: number;
  let tramoVac: string;
  if (anios <= 5) { diasVacaciones = 12; tramoVac = 'hasta 5 años'; }
  else if (anios <= 10) { diasVacaciones = 18; tramoVac = 'más de 5 y hasta 10 años'; }
  else { diasVacaciones = 30; tramoVac = 'más de 10 años'; }

  // Indemnización despido injustificado (art. 91): 15 salarios diarios por año de servicio o
  // fracción superior a 6 meses. La fracción > 6 meses cuenta como año completo.
  const aniosParaIndem = (meses > 6 || (meses === 6 && dias > 0)) ? anios + 1 : anios;
  const salariosDiariosIndem = INDEM_SALARIOS_DIARIOS_POR_ANIO * aniosParaIndem;

  const salario = Number(i.salarioMensual) || 0;
  let indemMonto = '';
  if (salario > 0) {
    const salarioDiario = salario / DIAS_MES_SALARIO;
    indemMonto = fmtPYG(salarioDiario * salariosDiariosIndem);
  }

  const beneficios =
    `Con **${antiguedad}** en Paraguay te corresponde: **${diasVacaciones} días hábiles de vacaciones** ` +
    `(tramo ${tramoVac}, art. 218); el **aguinaldo** proporcional; y, ante un **despido injustificado**, ` +
    `una indemnización de **${salariosDiariosIndem.toLocaleString('es-PY')} salarios diarios** ` +
    `(15 por año o fracción mayor a 6 meses, art. 91)` +
    (salario > 0 ? ` ≈ **${indemMonto}**.` : ' (ingresá tu salario para ver el monto).');

  const _insight = {
    title: 'Tu antigüedad y tus derechos',
    text: `Llevás **${antiguedad}** (${totalDias.toLocaleString('es-PY')} días corridos). Te dan **${diasVacaciones} días hábiles de vacaciones** y, ante un despido injustificado, **${salariosDiariosIndem.toLocaleString('es-PY')} salarios diarios** de indemnización (art. 91)${salario > 0 ? ` ≈ **${indemMonto}**` : ''}.`,
    tone: 'neutral',
    icon: '📅',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Vacaciones (días háb.)', value: diasVacaciones },
      { label: 'Indemnización (salarios diarios)', value: salariosDiariosIndem },
    ],
    ariaLabel: `Vacaciones ${diasVacaciones} días hábiles, indemnización ${salariosDiariosIndem} salarios diarios.`,
  };

  return {
    antiguedad,
    totalMeses,
    totalDias,
    beneficios,
    detalle: `Del ${dI}/${mI}/${yI} al ${fechaHasta.getDate()}/${fechaHasta.getMonth() + 1}/${fechaHasta.getFullYear()}: ${antiguedad} = ${totalMeses.toLocaleString('es-PY')} meses = ${totalDias.toLocaleString('es-PY')} días. Vacaciones = ${diasVacaciones} días (tramo ${tramoVac}). Indemnización art. 91 = 15 × ${aniosParaIndem} = ${salariosDiariosIndem.toLocaleString('es-PY')} salarios diarios${salario > 0 ? ` ≈ ${indemMonto}` : ''}.`,
    _insight,
    _chart,
  };
}
