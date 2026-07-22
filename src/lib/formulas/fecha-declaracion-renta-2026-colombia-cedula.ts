/** Fecha de vencimiento de la declaración de renta 2026 (año gravable 2025, Colombia)
 *  según los DOS ÚLTIMOS dígitos del NIT/cédula (sin dígito de verificación).
 *  Calendario tributario DIAN 2026: vencimientos del 12-ago-2026 al 26-oct-2026,
 *  50 fechas (2 terminaciones por día hábil). Fuente: DIAN — Calendario Tributario 2026. */

export interface Inputs {
  digitos: number; // dos últimos dígitos de la cédula/NIT (0-99; "00" = 0)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → NaN para poder validar (Number('') === 0 pisaría el caso "00"). */
const num = (v: unknown): number =>
  v === '' || v === null || v === undefined ? NaN : Number(v);

// Vencimientos DIAN 2026 en orden: índice 0 = terminaciones 01-02, índice 49 = 99-00.
// Todas caen en día hábil (se saltean fines de semana y festivos: 17-ago, 12-oct, etc.).
const VENCIMIENTOS_2026: string[] = [
  '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-18', '2026-08-19',
  '2026-08-20', '2026-08-21', '2026-08-24', '2026-08-25', '2026-08-26',
  '2026-08-27', '2026-08-28', '2026-08-31', '2026-09-01', '2026-09-02',
  '2026-09-03', '2026-09-04', '2026-09-07', '2026-09-08', '2026-09-09',
  '2026-09-10', '2026-09-11', '2026-09-14', '2026-09-15', '2026-09-16',
  '2026-09-17', '2026-09-18', '2026-09-21', '2026-09-22', '2026-09-23',
  '2026-09-24', '2026-09-25', '2026-09-28', '2026-10-01', '2026-10-02',
  '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09',
  '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-19',
  '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-26',
];

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtFechaLarga(d: Date): string {
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function compute(i: Inputs): Outputs {
  const d = num(i.digitos);
  if (Number.isNaN(d) || !Number.isInteger(d) || d < 0 || d > 99) {
    throw new Error('Ingresá los DOS últimos dígitos de tu cédula (de 00 a 99), sin el dígito de verificación');
  }

  // Terminación "00" (d = 0) va al final del calendario junto con la 99.
  const idx = d === 0 ? 49 : Math.ceil(d / 2) - 1;
  const vencimiento = parseLocal(VENCIMIENTOS_2026[idx]);
  const fechaLarga = fmtFechaLarga(vencimiento);
  const terminacion = String(d).padStart(2, '0');
  const par = idx === 49 ? '99 y 00' : `${String(2 * idx + 1).padStart(2, '0')} y ${String(2 * idx + 2).padStart(2, '0')}`;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diffDias = Math.round((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const vencida = diffDias < 0;
  const esHoy = diffDias === 0;

  const diasTexto = vencida
    ? `Venció hace ${Math.abs(diffDias)} día${Math.abs(diffDias) === 1 ? '' : 's'}`
    : esHoy
      ? '¡Vence HOY!'
      : `Faltan ${diffDias} día${diffDias === 1 ? '' : 's'}`;

  const _insight = vencida
    ? {
        title: 'Tu plazo ya venció',
        text: `Con cédula terminada en **${terminacion}**, tu declaración de renta (año gravable 2025) venció el **${fechaLarga}**. Presentala cuanto antes: la sanción por extemporaneidad corre a **5% del impuesto por cada mes o fracción** (mínimo **$523.740** = 10 UVT 2026) y sube a 10%/mes si la DIAN te emplaza.`,
        tone: 'bad',
        icon: '🚨',
      }
    : {
        title: 'Tu fecha límite para declarar renta',
        text: esHoy
          ? `Con cédula terminada en **${terminacion}**, tu declaración de renta (año gravable 2025) vence **HOY, ${fechaLarga}**. Presentala antes de que termine el día para evitar la sanción mínima de $523.740.`
          : `Con cédula terminada en **${terminacion}**, tenés tiempo hasta el **${fechaLarga}** para presentar tu declaración de renta del año gravable 2025 (**faltan ${diffDias} días**). No lo dejés para el final: el sistema de la DIAN se congestiona en las fechas pico.`,
        tone: diffDias <= 7 && !esHoy ? 'warning' : esHoy ? 'warning' : 'good',
        icon: diffDias <= 7 ? '⏰' : '📅',
      };

  // Gauge: días transcurridos de la ventana total de plazos (12-ago → 26-oct).
  const inicio = parseLocal(VENCIMIENTOS_2026[0]);
  const fin = parseLocal(VENCIMIENTOS_2026[49]);
  const ventanaTotal = Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  const posicion = Math.min(ventanaTotal, Math.max(0, Math.round((vencimiento.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))));
  const _chart = {
    type: 'gauge',
    value: posicion,
    min: 0,
    max: ventanaTotal,
    label: fechaLarga,
    ariaLabel: `Vencimiento el ${fechaLarga}, dentro de la ventana del 12 de agosto al 26 de octubre de 2026.`,
  };

  return {
    fechaVencimiento: fechaLarga,
    diasRestantes: diasTexto,
    detalle: `Terminaciones ${par} · calendario DIAN 2026 · año gravable 2025 · el plazo general va del 12-ago al 26-oct-2026.`,
    _insight,
    _chart,
  };
}
