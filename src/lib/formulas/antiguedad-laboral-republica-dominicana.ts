/** Antigüedad laboral (República Dominicana) 2026 — años, meses y días + derechos que desbloquea.
 *  Fuente: Código de Trabajo (Ley 16-92), arts. 76 (preaviso), 80 (auxilio de cesantía),
 *  177 (vacaciones). Ministerio de Trabajo.
 *  Escalas por antigüedad — Cesantía (art. 80): 3 a <6 meses = 6 días; 6 meses a <1 año = 13 días;
 *  1 a 5 años = 21 días/año; más de 5 años = 23 días/año. Vacaciones (art. 177): 14 días (1-5 años),
 *  18 días (≥5 años). Salario diario = salario mensual ÷ 23,83. */
import { fmtDOP } from '../data/republica-dominicana-2026.ts';

const DIVISOR_SALARIO_DIARIO = 23.83; // promedio de días laborables/mes (art. 80)

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

/** Días de auxilio de cesantía según la escala del art. 80. */
function diasCesantia(anios: number, meses: number): { dias: number; detalle: string } {
  const totalMesesFrac = anios * 12 + meses;
  if (totalMesesFrac < 3) return { dias: 0, detalle: 'menos de 3 meses: sin cesantía' };
  if (totalMesesFrac < 6) return { dias: 6, detalle: '3 a 6 meses: 6 días' };
  if (totalMesesFrac < 12) return { dias: 13, detalle: '6 meses a 1 año: 13 días' };
  if (anios <= 5) {
    // 1 a 5 años: 21 días por año de servicio (se cuenta cada año completo).
    return { dias: 21 * anios, detalle: `${anios} año(s) × 21 días (tramo 1-5 años)` };
  }
  // Más de 5 años: 23 días por año de servicio.
  return { dias: 23 * anios, detalle: `${anios} años × 23 días (tramo >5 años)` };
}

/** Días de preaviso (art. 76), escala fija según antigüedad. */
function diasPreaviso(anios: number, meses: number): number {
  const totalMesesFrac = anios * 12 + meses;
  if (totalMesesFrac < 3) return 0;
  if (totalMesesFrac < 6) return 7;
  if (totalMesesFrac < 12) return 14;
  return 28;
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

  const ces = diasCesantia(anios, meses);
  const preaviso = diasPreaviso(anios, meses);
  // Vacaciones (art. 177): 14 días laborables (1 a <5 años), 18 días (5 años o más).
  const diasVacaciones = anios >= 5 ? 18 : 14;

  const salario = Number(i.salarioMensual) || 0;
  let cesantiaMonto = '';
  let preavisoMonto = '';
  if (salario > 0) {
    const salarioDiario = salario / DIVISOR_SALARIO_DIARIO;
    cesantiaMonto = fmtDOP(salarioDiario * ces.dias);
    preavisoMonto = fmtDOP(salarioDiario * preaviso);
  }

  const beneficios =
    `Con **${antiguedad}** en República Dominicana te corresponde: **${diasVacaciones} días de vacaciones** ` +
    `(art. 177: 14 días de 1 a 5 años, 18 días desde los 5); y, ante un **desahucio** del empleador, un ` +
    `**auxilio de cesantía de ${ces.dias.toLocaleString('es-DO')} días** de salario (art. 80) más **${preaviso} días de preaviso** (art. 76)` +
    (salario > 0 ? ` ≈ **${cesantiaMonto}** de cesantía + **${preavisoMonto}** de preaviso.` : ' (ingresá tu salario para ver el monto).');

  const _insight = {
    title: 'Tu antigüedad y tus prestaciones',
    text: `Llevás **${antiguedad}** (${totalDias.toLocaleString('es-DO')} días corridos). Ante un desahucio te toca un auxilio de cesantía de **${ces.dias.toLocaleString('es-DO')} días** (art. 80) y **${preaviso} días de preaviso** (art. 76)${salario > 0 ? ` ≈ **${cesantiaMonto}** + **${preavisoMonto}**` : ''}.`,
    tone: 'neutral',
    icon: '📅',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Cesantía (días sal.)', value: ces.dias },
      { label: 'Preaviso (días)', value: preaviso },
      { label: 'Vacaciones (días)', value: diasVacaciones },
    ],
    ariaLabel: `Cesantía ${ces.dias} días de salario, preaviso ${preaviso} días, vacaciones ${diasVacaciones} días.`,
  };

  return {
    antiguedad,
    totalMeses,
    totalDias,
    beneficios,
    detalle: `Del ${dI}/${mI}/${yI} al ${fechaHasta.getDate()}/${fechaHasta.getMonth() + 1}/${fechaHasta.getFullYear()}: ${antiguedad} = ${totalMeses.toLocaleString('es-DO')} meses = ${totalDias.toLocaleString('es-DO')} días. Cesantía (art. 80): ${ces.detalle} = ${ces.dias.toLocaleString('es-DO')} días. Preaviso: ${preaviso} días. Salario diario = salario ÷ 23,83${salario > 0 ? ` → cesantía ≈ ${cesantiaMonto}` : ''}.`,
    _insight,
    _chart,
  };
}
