/** Antigüedad laboral (Uruguay) 2026 — años, meses y días de servicio + derechos que desbloquea.
 *  Fuente: Ley 12.590 (licencia anual); régimen común de despido (MTSS/BPS).
 *  Escalas: licencia base 20 días + 1 día por cada 4 años desde el 5º año (sin tope legal);
 *  indemnización por despido común (IPD) = 1 mes de sueldo por año, con tope de 6 mensualidades. */
import { fmtUYU } from '../data/uruguay-2026.ts';

const LICENCIA_BASE = 20;          // 20 días de licencia/año (Ley 12.590)
const IPD_TOPE_MESES = 6;          // tope 6 mensualidades (despido común)

export interface Inputs {
  fechaIngreso: string;
  fechaHasta?: string;
  sueldoMensual?: number;
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

  // Licencia: 20 días base + 1 día por cada 4 años cumplidos a partir del 5º año.
  // A los 5 años: +1; a los 9: +2; a los 13: +3; etc.  → floor((anios - 1) / 4) desde el 5º año.
  const diasExtraLicencia = anios >= 5 ? Math.floor((anios - 1) / 4) : 0;
  const diasLicencia = LICENCIA_BASE + diasExtraLicencia;

  // Indemnización por despido común (IPD): 1 mes de sueldo por año trabajado (o fracción con
  // más de 100 jornales genera derecho), con tope de 6 mensualidades.
  const aniosParaIpd = anios + (meses >= 1 || dias > 0 ? Math.min(1, (meses * 30 + dias) / 360) : 0);
  let mesesIpd = Math.min(Math.ceil(aniosParaIpd), IPD_TOPE_MESES);
  // Con menos de 1 año pero con antigüedad mínima suele corresponder al menos 1 mensualidad.
  if (mesesIpd < 1 && totalDias >= 100) mesesIpd = 1;

  const sueldo = Number(i.sueldoMensual) || 0;
  let ipdMonto = '';
  if (sueldo > 0) ipdMonto = fmtUYU(sueldo * mesesIpd);

  const beneficios =
    `Con **${antiguedad}** en Uruguay te corresponde: **${diasLicencia} días de licencia** anual ` +
    `(20 base${diasExtraLicencia > 0 ? ` + ${diasExtraLicencia} día${diasExtraLicencia !== 1 ? 's' : ''} de antigüedad, 1 cada 4 años desde el 5º` : '; los días extra empiezan a los 5 años'}, Ley 12.590); ` +
    `y, ante un **despido común**, una indemnización (IPD) de **${mesesIpd} mensualidad${mesesIpd !== 1 ? 'es' : ''}** ` +
    `(1 sueldo por año, tope 6)` +
    (sueldo > 0 ? ` ≈ **${ipdMonto}**.` : ' (ingresá tu sueldo para ver el monto).');

  const _insight = {
    title: 'Tu antigüedad y tus derechos',
    text: `Llevás **${antiguedad}** (${totalDias.toLocaleString('es-UY')} días corridos). Te dan **${diasLicencia} días de licencia** anual y, ante un despido común, **${mesesIpd} mensualidad${mesesIpd !== 1 ? 'es' : ''}** de indemnización (tope 6)${sueldo > 0 ? ` ≈ **${ipdMonto}**` : ''}.`,
    tone: 'neutral',
    icon: '📅',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Licencia (días)', value: diasLicencia },
      { label: 'Despido (mensualidades)', value: mesesIpd },
    ],
    ariaLabel: `Licencia ${diasLicencia} días, despido común ${mesesIpd} mensualidades.`,
  };

  return {
    antiguedad,
    totalMeses,
    totalDias,
    beneficios,
    detalle: `Del ${dI}/${mI}/${yI} al ${fechaHasta.getDate()}/${fechaHasta.getMonth() + 1}/${fechaHasta.getFullYear()}: ${antiguedad} = ${totalMeses.toLocaleString('es-UY')} meses = ${totalDias.toLocaleString('es-UY')} días. Licencia = 20${diasExtraLicencia > 0 ? ` + ${diasExtraLicencia}` : ''} = ${diasLicencia} días. IPD = ${mesesIpd} mensualidad${mesesIpd !== 1 ? 'es' : ''} (tope 6)${sueldo > 0 ? ` ≈ ${ipdMonto}` : ''}.`,
    _insight,
    _chart,
  };
}
