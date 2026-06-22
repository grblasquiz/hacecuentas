/**
 * Aguinaldo (SAC) Uruguay 2026 = 1/12 de las partidas salariales percibidas en el semestre.
 * Devuelve bruto y neto: el aguinaldo tributa aportes BPS (montepío + FONASA + FRL) e IRPF
 * igual que el salario. Tasas desde uruguay-2026.ts.
 *
 * Dos modos de carga:
 *  - 'mensual': sueldo nominal mensual × meses trabajados en el semestre.
 *  - 'semestre': total nominal percibido en el semestre (sumás vos las partidas).
 */
import {
  URUGUAY_2026,
  fmtUYU,
  aportesBpsPersonales,
  irpfMensual,
} from '../data/uruguay-2026.ts';

export interface Inputs {
  modo?: string;     // 'mensual' | 'semestre'
  monto: number;     // sueldo mensual (modo mensual) o total del semestre (modo semestre)
  meses?: number;    // meses trabajados en el semestre (modo mensual), 1..6
  conyuge?: string;  // 'si' | 'no'
  hijos?: string;    // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function aguinaldoUruguay(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  if (monto <= 0) throw new Error('Ingresá el monto del sueldo o el total del semestre');

  const modo = String(i.modo || 'mensual') === 'semestre' ? 'semestre' : 'mensual';
  const conConyuge = String(i.conyuge || 'no') === 'si';
  const conHijos = String(i.hijos || 'no') === 'si';
  const divisor = URUGUAY_2026.laboral.aguinaldoDivisor; // 12

  let totalSemestre: number;
  let mesesEf = 6;
  if (modo === 'semestre') {
    totalSemestre = monto;
  } else {
    mesesEf = Math.min(6, Math.max(0.0001, Number(i.meses) || 6));
    totalSemestre = monto * mesesEf;
  }

  const aguinaldoBruto = totalSemestre / divisor;

  // El aguinaldo tributa BPS e IRPF como una partida más. Para estimar el IRPF
  // usamos la tasa marginal del trabajador a nivel de su sueldo mensual de
  // referencia (mejor proxy disponible sin la liquidación completa del año).
  const sueldoRef = modo === 'mensual' ? monto : totalSemestre / 6;
  const apAguinaldo = aportesBpsPersonales(aguinaldoBruto, conConyuge, conHijos);

  // IRPF incremental del aguinaldo: diferencia entre el IRPF de (sueldo + aguinaldo)
  // y el del sueldo solo, ambos con sus aportes BPS como deducción.
  const apRef = aportesBpsPersonales(sueldoRef, conConyuge, conHijos);
  const apRefMasAg = aportesBpsPersonales(sueldoRef + aguinaldoBruto, conConyuge, conHijos);
  const irpfSolo = irpfMensual(sueldoRef, apRef.total);
  const irpfConAg = irpfMensual(sueldoRef + aguinaldoBruto, apRefMasAg.total);
  const irpfAguinaldo = Math.max(0, irpfConAg - irpfSolo);

  const aguinaldoNeto = aguinaldoBruto - apAguinaldo.total - irpfAguinaldo;

  const _insight = {
    title: 'Tu aguinaldo',
    text:
      `Tu aguinaldo bruto es **${fmtUYU(aguinaldoBruto)}** (1/12 de **${fmtUYU(totalSemestre)}** percibidos en el semestre). ` +
      `Tras descontar **${fmtUYU(apAguinaldo.total)}** de aportes BPS` +
      (irpfAguinaldo > 0 ? ` y **${fmtUYU(irpfAguinaldo)}** de IRPF` : '') +
      `, cobrás **${fmtUYU(aguinaldoNeto)}** en mano.`,
    tone: 'good',
    icon: '🎁',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Aguinaldo neto', value: Math.round(aguinaldoNeto) },
      { label: 'Aportes BPS', value: Math.round(apAguinaldo.total) },
      { label: 'IRPF', value: Math.round(irpfAguinaldo) },
    ].filter((s) => s.value > 0),
    prefix: '$U ',
    centerValue: fmtUYU(aguinaldoBruto),
    centerLabel: 'Aguinaldo bruto',
    ariaLabel: `Aguinaldo bruto ${fmtUYU(aguinaldoBruto)}, neto ${fmtUYU(aguinaldoNeto)}, aportes BPS ${fmtUYU(apAguinaldo.total)}, IRPF ${fmtUYU(irpfAguinaldo)}.`,
  };

  return {
    aguinaldoNeto: fmtUYU(aguinaldoNeto),
    aguinaldoBruto: fmtUYU(aguinaldoBruto),
    totalSemestre: fmtUYU(totalSemestre),
    aportesBps: fmtUYU(apAguinaldo.total),
    irpf: fmtUYU(irpfAguinaldo),
    detalle:
      `Aguinaldo bruto ${fmtUYU(aguinaldoBruto)} (= ${fmtUYU(totalSemestre)} ÷ 12) − BPS ${fmtUYU(apAguinaldo.total)}` +
      (irpfAguinaldo > 0 ? ` − IRPF ${fmtUYU(irpfAguinaldo)}` : '') +
      ` = neto ${fmtUYU(aguinaldoNeto)}.`,
    _insight,
    _chart,
  };
}
