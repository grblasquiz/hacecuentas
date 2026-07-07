/** Antigüedad laboral (Perú) 2026 — años, meses y días de servicio + derechos que desbloquea.
 *  Fuente: D.S. 003-97-TR (LPCL) art. 38; D.S. 001-97-TR (CTS); D.Leg. 713 (vacaciones 30 días).
 *  Escalas: vacaciones 30 días/año; CTS ≈ 1 remuneración/año; indemnización despido
 *  arbitrario = 1,5 remuneraciones por año, tope 12 remuneraciones (art. 38 LPCL). */
import { fmtPEN } from '../data/peru-2026.ts';

const VACACIONES_DIAS = 30;            // 30 días calendario/año (D.Leg. 713)
const INDEM_REMUN_POR_ANIO = 1.5;      // 1,5 remuneraciones por año (art. 38 LPCL)
const INDEM_TOPE_REMUN = 12;           // tope 12 remuneraciones

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

  // Indemnización por despido arbitrario (art. 38 LPCL): 1,5 remuneraciones por año completo
  // + 1/12 por mes y 1/360 por día (dozavos y treintavos), con tope de 12 remuneraciones.
  const aniosDecimal = anios + meses / 12 + dias / 360;
  let remunIndem = INDEM_REMUN_POR_ANIO * aniosDecimal;
  if (remunIndem > INDEM_TOPE_REMUN) remunIndem = INDEM_TOPE_REMUN;
  remunIndem = Math.round(remunIndem * 100) / 100;

  // CTS acumulada ≈ 1 remuneración por año (aprox., depósito semestral).
  const ctsRemun = Math.round(aniosDecimal * 100) / 100;

  const remun = Number(i.remuneracionMensual) || 0;
  let indemMonto = '';
  let ctsMonto = '';
  if (remun > 0) {
    indemMonto = fmtPEN(remun * remunIndem);
    ctsMonto = fmtPEN(remun * ctsRemun);
  }

  const beneficios =
    `Con **${antiguedad}** en Perú (régimen laboral privado) te corresponde: ` +
    `**30 días de vacaciones** por año (D.Leg. 713); una **CTS** que crece con el tiempo (≈ 1 remuneración por año, depositada cada mayo y noviembre) ≈ **${remunIndem === 0 ? '' : ''}${remun > 0 ? ctsMonto : `${ctsRemun.toLocaleString('es-PE')} remuneraciones`}**; y, ante un **despido arbitrario**, una indemnización de **${remunIndem.toLocaleString('es-PE')} remuneraciones** (1,5 por año, tope 12) ` +
    (remun > 0 ? `≈ **${indemMonto}**.` : '(ingresá tu remuneración para ver el monto).');

  const _insight = {
    title: 'Tu antigüedad y tus derechos',
    text: `Llevás **${antiguedad}** (${totalDias.toLocaleString('es-PE')} días corridos). Eso te da **30 días de vacaciones/año** y, ante un despido arbitrario, una indemnización de **${remunIndem.toLocaleString('es-PE')} remuneraciones** (art. 38 LPCL)${remun > 0 ? ` ≈ **${indemMonto}**` : ''}.`,
    tone: 'neutral',
    icon: '📅',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Vacaciones (días)', value: VACACIONES_DIAS },
      { label: 'Indemnización (×remun.)', value: remunIndem },
    ],
    ariaLabel: `Vacaciones ${VACACIONES_DIAS} días, indemnización ${remunIndem} remuneraciones.`,
  };

  return {
    antiguedad,
    totalMeses,
    totalDias,
    beneficios,
    detalle: `Del ${dI}/${mI}/${yI} al ${fechaHasta.getDate()}/${fechaHasta.getMonth() + 1}/${fechaHasta.getFullYear()}: ${antiguedad} = ${totalMeses.toLocaleString('es-PE')} meses = ${totalDias.toLocaleString('es-PE')} días. Indemnización art. 38: 1,5 × ${aniosDecimal.toLocaleString('es-PE', { maximumFractionDigits: 2 })} años = ${remunIndem.toLocaleString('es-PE')} remuneraciones${remun > 0 ? ` ≈ ${indemMonto}; CTS ≈ ${ctsMonto}` : ''}.`,
    _insight,
    _chart,
  };
}
