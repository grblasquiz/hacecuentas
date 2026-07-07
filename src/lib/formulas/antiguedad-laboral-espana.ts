/** Antigüedad laboral (España) 2026 — años, meses y días de servicio + derechos que desbloquea.
 *  Fuente: Estatuto de los Trabajadores (ET), arts. 53 y 56; Real Decreto-ley 3/2012.
 *  Escalas: indemnización despido improcedente 33 días/año, tope 24 mensualidades (art. 56 ET);
 *  despido objetivo/procedente 20 días/año, tope 12 mensualidades (art. 53 ET);
 *  complemento de antigüedad (trienios) según convenio colectivo. */

// España: sin data file, helper de moneda inline (spec §5).
const fmtEur = (n: number) => Math.round(n).toLocaleString('es-ES') + ' €';

const DIAS_IMPROCEDENTE = 33;   // días de salario por año (art. 56 ET, contratos posteriores a 12/02/2012)
const TOPE_IMPROCEDENTE = 24;   // tope 24 mensualidades
const DIAS_OBJETIVO = 20;       // días de salario por año (art. 53 ET)
const TOPE_OBJETIVO = 12;       // tope 12 mensualidades

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
  if (partsIng.length !== 3 || partsIng.some(isNaN)) throw new Error('Introduce una fecha de alta válida (AAAA-MM-DD)');
  const [yI, mI, dI] = partsIng;
  const fechaIngreso = new Date(yI, mI - 1, dI);

  let fechaHasta: Date;
  if (i.fechaHasta) {
    const p = String(i.fechaHasta).split('-').map(Number);
    if (p.length !== 3 || p.some(isNaN)) throw new Error('Introduce una fecha de cálculo válida (AAAA-MM-DD)');
    fechaHasta = new Date(p[0], p[1] - 1, p[2]);
  } else {
    fechaHasta = new Date(2026, 6, 6); // hoy: 2026-07-06
  }
  if (isNaN(fechaIngreso.getTime())) throw new Error('Introduce una fecha de alta válida');
  if (fechaIngreso > fechaHasta) throw new Error('La fecha de alta no puede ser posterior a la fecha de cálculo');

  const totalDias = Math.round((fechaHasta.getTime() - fechaIngreso.getTime()) / 86400000);
  const { anios, meses, dias } = diffFechas(fechaIngreso, fechaHasta);
  const totalMeses = anios * 12 + meses;

  const partes: string[] = [];
  if (anios > 0) partes.push(`${anios} año${anios !== 1 ? 's' : ''}`);
  if (meses > 0) partes.push(`${meses} mes${meses !== 1 ? 'es' : ''}`);
  if (dias > 0) partes.push(`${dias} día${dias !== 1 ? 's' : ''}`);
  const antiguedad = partes.length ? partes.join(', ') : '0 días';

  // Antigüedad en años decimal (para prorratear la indemnización, que se paga por días).
  const aniosDecimal = totalDias / 365.25;

  // Indemnización improcedente: 33 días/año, tope 24 mensualidades.
  let mensualidadesImproc = (DIAS_IMPROCEDENTE * aniosDecimal) / 30;
  if (mensualidadesImproc > TOPE_IMPROCEDENTE) mensualidadesImproc = TOPE_IMPROCEDENTE;
  mensualidadesImproc = Math.round(mensualidadesImproc * 100) / 100;

  // Indemnización objetiva/procedente: 20 días/año, tope 12 mensualidades.
  let mensualidadesObj = (DIAS_OBJETIVO * aniosDecimal) / 30;
  if (mensualidadesObj > TOPE_OBJETIVO) mensualidadesObj = TOPE_OBJETIVO;
  mensualidadesObj = Math.round(mensualidadesObj * 100) / 100;

  // Trienios: número de tramos completos de 3 años (complemento de antigüedad por convenio).
  const trienios = Math.floor(anios / 3);

  const salario = Number(i.salarioMensual) || 0;
  let improcMonto = '';
  let objMonto = '';
  if (salario > 0) {
    improcMonto = fmtEur(salario * mensualidadesImproc);
    objMonto = fmtEur(salario * mensualidadesObj);
  }

  const beneficios =
    `Con **${antiguedad}** en España te corresponde, ante un despido: ` +
    `si es **improcedente**, **33 días de salario por año** (tope 24 mensualidades) = **${mensualidadesImproc.toLocaleString('es-ES')} mensualidades**` +
    (salario > 0 ? ` ≈ **${improcMonto}**` : '') + `; ` +
    `si es **objetivo/procedente**, **20 días por año** (tope 12) = **${mensualidadesObj.toLocaleString('es-ES')} mensualidades**` +
    (salario > 0 ? ` ≈ **${objMonto}**` : '') + `. ` +
    `Además, ya tienes **${trienios} trienio${trienios !== 1 ? 's' : ''}** de antigüedad completados (complemento según convenio).`;

  const _insight = {
    title: 'Tu antigüedad y tu indemnización',
    text: `Llevas **${antiguedad}** (${totalDias.toLocaleString('es-ES')} días). Un despido improcedente serían **${mensualidadesImproc.toLocaleString('es-ES')} mensualidades** (33 días/año, tope 24)${salario > 0 ? ` ≈ **${improcMonto}**` : ''}; uno objetivo, **${mensualidadesObj.toLocaleString('es-ES')} mensualidades** (20 días/año).`,
    tone: 'neutral',
    icon: '📅',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Improcedente (mens.)', value: mensualidadesImproc },
      { label: 'Objetivo (mens.)', value: mensualidadesObj },
    ],
    ariaLabel: `Despido improcedente ${mensualidadesImproc} mensualidades, objetivo ${mensualidadesObj} mensualidades.`,
  };

  return {
    antiguedad,
    totalMeses,
    totalDias,
    beneficios,
    detalle: `Del ${dI}/${mI}/${yI} al ${fechaHasta.getDate()}/${fechaHasta.getMonth() + 1}/${fechaHasta.getFullYear()}: ${antiguedad} = ${totalMeses.toLocaleString('es-ES')} meses = ${totalDias.toLocaleString('es-ES')} días. Improcedente: 33 × ${aniosDecimal.toLocaleString('es-ES', { maximumFractionDigits: 2 })} años ÷ 30 = ${mensualidadesImproc.toLocaleString('es-ES')} mensualidades${salario > 0 ? ` ≈ ${improcMonto}` : ''}. Trienios: ${trienios}.`,
    _insight,
    _chart,
  };
}
