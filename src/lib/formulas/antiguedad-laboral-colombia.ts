/** Antigüedad laboral (Colombia) 2026 — años, meses y días de servicio + derechos que desbloquea.
 *  Fuente: Código Sustantivo del Trabajo (CST) arts. 64, 186, 249, 306. Ministerio del Trabajo.
 *  Escalas: vacaciones 15 días hábiles/año (art. 186); cesantías 1 mes/año (art. 249);
 *  prima de servicios 1 mes/año (art. 306); indemnización despido sin justa causa (art. 64). */
import { fmtCOP } from '../data/colombia-2026.ts';

// Indemnización despido sin justa causa, contrato a término indefinido (art. 64 CST).
// Trabajadores con salario < 10 SMMLV: 30 días por el primer año + 20 días por cada año adicional.
const DIAS_BASE_INDEM = 30;       // días de salario por el primer año (< 10 SMMLV)
const DIAS_ADICIONAL_INDEM = 20;  // días de salario por cada año subsiguiente (< 10 SMMLV)
const VACACIONES_DIAS_HABILES = 15; // días hábiles de vacaciones por año (art. 186 CST)

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

  // Indemnización art. 64 (< 10 SMMLV): 30 días + 20 días por cada año subsiguiente al primero,
  // más proporcional por fracción. Días totales de salario a indemnizar.
  const aniosCompletos = anios;
  const fraccionAnio = (meses * 30 + dias) / 360; // fracción del año en curso
  let diasIndem: number;
  if (aniosCompletos + fraccionAnio <= 1) {
    diasIndem = DIAS_BASE_INDEM; // hasta 1 año: 30 días
  } else {
    const aniosDespuesPrimero = (aniosCompletos - 1) + fraccionAnio;
    diasIndem = DIAS_BASE_INDEM + DIAS_ADICIONAL_INDEM * aniosDespuesPrimero;
  }
  diasIndem = Math.round(diasIndem * 100) / 100;

  const salario = Number(i.salarioMensual) || 0;
  let indemMonto = '';
  let cesantiasMonto = '';
  let primaMonto = '';
  if (salario > 0) {
    const valorDia = salario / 30;
    indemMonto = fmtCOP(valorDia * diasIndem);
    // Cesantías acumuladas ≈ 1 mes de salario por año trabajado (proporcional).
    const aniosDecimal = totalDias / 360;
    cesantiasMonto = fmtCOP(salario * aniosDecimal);
    // Prima de servicios anual = 1 mes de salario/año (proporcional al periodo).
    primaMonto = fmtCOP(salario * aniosDecimal);
  }

  const beneficios =
    `Con **${antiguedad}** de antigüedad en Colombia te corresponde: ` +
    `**${VACACIONES_DIAS_HABILES} días hábiles de vacaciones** por año (art. 186 CST); ` +
    `**cesantías** equivalentes a 1 mes de salario por año + 12% de intereses (art. 249); ` +
    `**prima de servicios** de 1 mes de salario por año (art. 306); y, ante un despido sin justa causa, ` +
    `una **indemnización de ${diasIndem.toLocaleString('es-CO')} días de salario** (art. 64: 30 días el primer año + 20 por año siguiente)` +
    (salario > 0 ? ` ≈ **${indemMonto}**.` : ' (ingresá tu salario para ver el monto).');

  const _insight = {
    title: 'Tu antigüedad y tus derechos',
    text: `Llevás **${antiguedad}** (${totalDias.toLocaleString('es-CO')} días corridos). Eso te da **${VACACIONES_DIAS_HABILES} días hábiles de vacaciones/año** y, si te despiden sin justa causa, una indemnización de **${diasIndem.toLocaleString('es-CO')} días de salario** (art. 64 CST)${salario > 0 ? ` ≈ **${indemMonto}**` : ''}.`,
    tone: 'neutral',
    icon: '📅',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Vacaciones (días háb.)', value: VACACIONES_DIAS_HABILES },
      { label: 'Indemnización (días sal.)', value: Math.round(diasIndem) },
    ],
    ariaLabel: `Vacaciones ${VACACIONES_DIAS_HABILES} días hábiles, indemnización ${Math.round(diasIndem)} días de salario.`,
  };

  return {
    antiguedad,
    totalMeses,
    totalDias,
    beneficios,
    detalle: `Del ${dI}/${mI}/${yI} al ${fechaHasta.getDate()}/${fechaHasta.getMonth() + 1}/${fechaHasta.getFullYear()}: ${antiguedad} = ${totalMeses.toLocaleString('es-CO')} meses = ${totalDias.toLocaleString('es-CO')} días. Indemnización art. 64: ${diasIndem.toLocaleString('es-CO')} días de salario${salario > 0 ? ` ≈ ${indemMonto}; cesantías ≈ ${cesantiasMonto}; prima ≈ ${primaMonto}` : ''}.`,
    _insight,
    _chart,
  };
}
