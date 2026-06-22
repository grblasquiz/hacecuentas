/**
 * Conversor nominal ↔ líquido Uruguay 2026 (bidireccional).
 * Directo (nominal→líquido): usa salarioLiquido().
 * Inverso (líquido→nominal): búsqueda binaria sobre el nominal, porque el IRPF
 * progresivo + las franjas FONASA hacen no lineal la relación líquido/nominal.
 */
import {
  URUGUAY_2026,
  fmtUYU,
  salarioLiquido,
} from '../data/uruguay-2026.ts';

export interface Inputs {
  monto: number;
  direccion?: string; // 'nominal_a_liquido' | 'liquido_a_nominal'
  conyuge?: string;   // 'si' | 'no'
  hijos?: string;     // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function sueldoNominalALiquidoUruguay(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  if (monto <= 0) throw new Error('Ingresá el monto del sueldo');

  const direccion = String(i.direccion || 'nominal_a_liquido') === 'liquido_a_nominal'
    ? 'liquido_a_nominal'
    : 'nominal_a_liquido';
  const conConyuge = String(i.conyuge || 'no') === 'si';
  const conHijos = String(i.hijos || 'no') === 'si';

  let nominal: number;
  if (direccion === 'nominal_a_liquido') {
    nominal = monto;
  } else {
    // líquido objetivo → nominal: el nominal siempre es mayor que el líquido.
    const objetivo = monto;
    let lo = objetivo, hi = objetivo * 2.2;
    // Garantizar que el extremo superior produzca un líquido ≥ objetivo.
    while (salarioLiquido(hi, conConyuge, conHijos).liquido < objetivo && hi < objetivo * 10) hi *= 1.5;
    for (let k = 0; k < 80; k++) {
      const mid = (lo + hi) / 2;
      if (salarioLiquido(mid, conConyuge, conHijos).liquido < objetivo) lo = mid; else hi = mid;
    }
    nominal = (lo + hi) / 2;
  }

  const r = salarioLiquido(nominal, conConyuge, conHijos);
  const liquido = r.liquido;
  const aportes = r.aportesBps;
  const irpf = r.irpf;

  const _insight = {
    title: direccion === 'nominal_a_liquido' ? 'De nominal a líquido' : 'De líquido a nominal',
    text:
      direccion === 'nominal_a_liquido'
        ? `Un sueldo nominal de **${fmtUYU(nominal)}** equivale a **${fmtUYU(liquido)}** líquidos en mano, tras descontar **${fmtUYU(aportes)}** de aportes BPS${irpf > 0 ? ` y **${fmtUYU(irpf)}** de IRPF` : ''}.`
        : `Para llevarte **${fmtUYU(liquido)}** líquidos en mano necesitás un sueldo nominal de **${fmtUYU(nominal)}**: ahí se descuentan **${fmtUYU(aportes)}** de aportes BPS${irpf > 0 ? ` y **${fmtUYU(irpf)}** de IRPF` : ''}.`,
    tone: 'good',
    icon: '🔁',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Líquido', value: Math.round(liquido) },
      { label: 'Aportes BPS', value: Math.round(aportes) },
      { label: 'IRPF', value: Math.round(irpf) },
    ].filter((s) => s.value > 0),
    prefix: '$U ',
    centerValue: fmtUYU(nominal),
    centerLabel: 'Sueldo nominal',
    ariaLabel: `Nominal ${fmtUYU(nominal)}, líquido ${fmtUYU(liquido)}, aportes BPS ${fmtUYU(aportes)}, IRPF ${fmtUYU(irpf)}.`,
  };

  return {
    nominal: fmtUYU(nominal),
    liquido: fmtUYU(liquido),
    aportesBps: fmtUYU(aportes),
    irpf: fmtUYU(irpf),
    detalle:
      `Nominal ${fmtUYU(nominal)} − BPS ${fmtUYU(aportes)}` +
      (irpf > 0 ? ` − IRPF ${fmtUYU(irpf)}` : '') +
      ` = líquido ${fmtUYU(liquido)}.`,
    _insight,
    _chart,
  };
}
