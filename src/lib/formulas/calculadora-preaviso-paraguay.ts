/**
 * Preaviso Paraguay 2026 — Código del Trabajo (Ley 213/93, art. 87).
 *
 * El preaviso es la comunicación anticipada de la terminación del contrato. Si la
 * parte que rescinde no lo otorga, debe pagar una INDEMNIZACIÓN SUSTITUTIVA del
 * preaviso equivalente a los salarios de los días que correspondían según la
 * antigüedad del trabajador:
 *
 *   días de preaviso = 30 (≤1 año) / 45 (1–5) / 60 (5–10) / 90 (>10 años)
 *   jornal diario    = salarioMensual / 30
 *   indemnización    = jornal × días de preaviso
 *
 * Durante el preaviso trabajado el empleado conserva derecho a 2 días pagos por
 * semana (12 h) para buscar trabajo (art. 88) — se informa, no se monetiza acá.
 *
 * Fuente: MTESS — Código del Trabajo, art. 87.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface Inputs {
  aniosAntiguedad: number;  // años de antigüedad cumplidos
  salarioMensual: number;   // salario mensual (Gs.)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

/** Días de preaviso según la escala del art. 87 (por antigüedad cumplida). */
function diasPreaviso(anios: number): number {
  for (const t of PARAGUAY_2026.laboral.preaviso) {
    if (anios <= t.hastaAnios) return t.dias;
  }
  return PARAGUAY_2026.laboral.preaviso[PARAGUAY_2026.laboral.preaviso.length - 1].dias;
}

export function calculadoraPreavisoParaguay(i: Inputs): Outputs {
  const salarioMensual = Number(i.salarioMensual) || 0;
  const anios = Math.max(0, Number(i.aniosAntiguedad) || 0);

  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual en guaraníes');

  const jornal = salarioMensual / PARAGUAY_2026.diasMes; // jornal diario = sueldo / 30
  const dias = diasPreaviso(anios);
  const indemnizacion = jornal * dias;

  // Tramo legal aplicable (para el texto explicativo).
  const tramo =
    anios <= 1 ? 'hasta 1 año' :
    anios <= 5 ? 'de 1 a 5 años' :
    anios <= 10 ? 'de 5 a 10 años' :
    'más de 10 años';

  const _insight = {
    type: 'highlight',
    icon: '📄',
    text: `Con **${anios} año(s)** de antigüedad (${tramo}) te corresponden **${dias} días de preaviso**. ` +
      `Si el empleador no lo otorga, debe pagarte una indemnización sustitutiva de **${fmtPYG(indemnizacion)}** ` +
      `(${dias} días × ${fmtPYG(jornal)} de jornal diario).`,
  };

  const _table = {
    title: 'Días de preaviso según antigüedad (art. 87, Código del Trabajo)',
    headers: ['Antigüedad', 'Días de preaviso', 'Indemnización sustitutiva'],
    rows: [
      ['Hasta 1 año', '30 días', fmtPYG(jornal * 30)],
      ['De 1 a 5 años', '45 días', fmtPYG(jornal * 45)],
      ['De 5 a 10 años', '60 días', fmtPYG(jornal * 60)],
      ['Más de 10 años', '90 días', fmtPYG(jornal * 90)],
    ],
    note: `Calculado con tu jornal diario de ${fmtPYG(jornal)} (salario ${fmtPYG(salarioMensual)} ÷ 30). El tramo que te corresponde aparece resaltado en el resultado.`,
  };

  return {
    indemnizacionSustitutiva: `${dias} días · ${fmtPYG(indemnizacion)}`,
    indemnizacionMonto: Math.round(indemnizacion),
    diasPreaviso: dias,
    jornalDiario: Math.round(jornal),
    detalle: `${dias} días de preaviso × ${fmtPYG(jornal)} = ${fmtPYG(indemnizacion)}`,
    _insight,
    _table,
  };
}
