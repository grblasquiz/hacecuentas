/**
 * Calculadora de liquidación final (egreso) — Uruguay 2026.
 *
 * Suma lo que el empleador debe pagar al terminar la relación laboral:
 *  - Aguinaldo (SAC) proporcional = jornales/sueldo del semestre en curso ÷ 12.
 *  - Licencia no gozada (días pendientes) = jornal de licencia (nominal/30) × días.
 *  - Salario vacacional proporcional sobre la licencia generada y no gozada.
 *  - Indemnización por despido (IPD) — solo si el motivo es despido.
 *
 * Renuncia: se pagan rubros proporcionales (aguinaldo, licencia, vacacional)
 * pero NO indemnización por despido.
 *
 * Data: src/lib/data/uruguay-2026.ts.
 */
import { URUGUAY_2026, fmtUYU, salarioLiquido } from '../data/uruguay-2026';

export interface LiquidacionInputs {
  /** Sueldo mensual nominal, en pesos. */
  sueldo?: number | string;
  /** Antigüedad en años (decimales admitidos). */
  aniosAntiguedad?: number | string;
  /** Días de licencia generada y no gozada. */
  diasLicenciaNoGozada?: number | string;
  /** Meses trabajados en el semestre del aguinaldo en curso (0–6). */
  mesesSemestre?: number | string;
  /** "despido" | "renuncia". */
  motivo?: string;
}

export interface LiquidacionOutputs {
  total: string;
  totalMonto: number;
  aguinaldo: string;
  licenciaNoGozada: string;
  salarioVacacional: string;
  indemnizacion: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function liquidacionFinalUruguay(i: LiquidacionInputs): LiquidacionOutputs {
  const sueldo = Math.max(0, Number(i.sueldo) || 0);
  const aniosRaw = Math.max(0, Number(i.aniosAntiguedad) || 0);
  const diasNoGozada = Math.max(0, Number(i.diasLicenciaNoGozada) || 0);
  const motivo = i.motivo === 'renuncia' ? 'renuncia' : 'despido';

  // Meses del semestre del aguinaldo en curso (0–6). Default 6 (semestre completo).
  let mesesSemestre = i.mesesSemestre === undefined || i.mesesSemestre === ''
    ? 6
    : Math.max(0, Number(i.mesesSemestre) || 0);
  mesesSemestre = Math.min(6, mesesSemestre);

  // ── Aguinaldo proporcional = (sueldo × meses del semestre) ÷ 12 ──
  const aguinaldo = (sueldo * mesesSemestre) / URUGUAY_2026.laboral.aguinaldoDivisor;

  // ── Licencia no gozada: jornal de licencia (nominal/30) × días pendientes ──
  const jornalLicencia = sueldo / 30;
  const licenciaNoGozada = jornalLicencia * diasNoGozada;

  // ── Salario vacacional proporcional sobre la licencia no gozada ──
  // = jornal LÍQUIDO × días no gozados (suma para mejor goce de esa licencia).
  const liq = salarioLiquido(sueldo);
  const jornalLiquido = sueldo > 0 ? (liq.liquido / sueldo) * (sueldo / 30) : 0; // nominal/30 ajustado a líquido
  const salarioVacacional = jornalLiquido * diasNoGozada;

  // ── Indemnización por despido (solo despido) ──
  const d = URUGUAY_2026.laboral.despido.mensual;
  const aniosComputados = Math.max(1, Math.ceil(aniosRaw));
  const mesesIndem = Math.min(aniosComputados * d.mesesPorAnio, d.topeMeses);
  const indemnizacion = motivo === 'despido' ? mesesIndem * sueldo : 0;

  const total = aguinaldo + licenciaNoGozada + salarioVacacional + indemnizacion;

  const detalle =
    `Aguinaldo proporcional ${fmtUYU(aguinaldo)} + ` +
    `licencia no gozada ${fmtUYU(licenciaNoGozada)} + ` +
    `salario vacacional ${fmtUYU(salarioVacacional)}` +
    (motivo === 'despido' ? ` + indemnización ${fmtUYU(indemnizacion)}` : '') +
    ` = ${fmtUYU(total)}.`;

  return {
    total: fmtUYU(total),
    totalMonto: Math.round(total),
    aguinaldo: fmtUYU(aguinaldo),
    licenciaNoGozada: fmtUYU(licenciaNoGozada),
    salarioVacacional: fmtUYU(salarioVacacional),
    indemnizacion: motivo === 'despido' ? fmtUYU(indemnizacion) : 'No corresponde (renuncia)',
    detalle,
    _insight: {
      title: motivo === 'despido' ? 'Tu liquidación final por despido' : 'Tu liquidación final por renuncia',
      text:
        `Al egresar por **${motivo}** te corresponde un total de **${fmtUYU(total)}**. ` +
        (motivo === 'despido'
          ? `La **indemnización por despido** (${fmtUYU(indemnizacion)}, ${mesesIndem} mes/es) es el rubro más pesado; sumás además aguinaldo y licencia proporcionales.`
          : `Al renunciar **no cobrás indemnización por despido**: la liquidación son los rubros proporcionales (aguinaldo, licencia no gozada y salario vacacional).`),
      tone: motivo === 'despido' ? 'info' as const : 'warn' as const,
      icon: motivo === 'despido' ? '💼' : '✋',
    },
    _table: {
      title: 'Desglose de la liquidación final',
      headers: ['Rubro', 'Monto'],
      rows: [
        ['Aguinaldo proporcional (SAC)', fmtUYU(aguinaldo)],
        ['Licencia no gozada', fmtUYU(licenciaNoGozada)],
        ['Salario vacacional', fmtUYU(salarioVacacional)],
        ['Indemnización por despido', motivo === 'despido' ? fmtUYU(indemnizacion) : '—'],
        ['Total a cobrar', fmtUYU(total)],
      ],
      note: 'La indemnización por despido solo se paga cuando el cese es por despido sin notoria mala conducta. En la renuncia se pagan únicamente los rubros proporcionales.',
    },
  };
}
