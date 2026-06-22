/**
 * Salario líquido Uruguay 2026 — del nominal al líquido (en mano).
 * Líquido = nominal − aportes BPS (montepío 15% + FONASA 3–8% + FRL 0,1%) − IRPF.
 * No hardcodea tasas: todo sale de uruguay-2026.ts.
 */
import {
  URUGUAY_2026,
  fmtUYU,
  salarioLiquido,
  aportesBpsPersonales,
  irpfMensual,
} from '../data/uruguay-2026.ts';

export interface Inputs {
  nominal: number;
  conyuge?: string; // 'si' | 'no'
  hijos?: string;   // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function salarioLiquidoUruguay(i: Inputs): Outputs {
  const nominal = Number(i.nominal) || 0;
  if (nominal <= 0) throw new Error('Ingresá tu sueldo nominal mensual');

  const conConyuge = String(i.conyuge || 'no') === 'si';
  const conHijos = String(i.hijos || 'no') === 'si';

  const ap = aportesBpsPersonales(nominal, conConyuge, conHijos);
  const irpf = irpfMensual(nominal, ap.total);
  const r = salarioLiquido(nominal, conConyuge, conHijos);
  const liquido = r.liquido;

  const tasaFonasaPct = (ap.tasaFonasa * 100).toLocaleString('es-UY', { maximumFractionDigits: 1 });
  const efectivoPct = ((nominal - liquido) / nominal) * 100;
  const efectivoStr = efectivoPct.toLocaleString('es-UY', { maximumFractionDigits: 1 });

  const _insight = {
    title: 'Tu sueldo en mano',
    text:
      `De un sueldo nominal de **${fmtUYU(nominal)}** te quedan **${fmtUYU(liquido)}** líquidos: ` +
      `se descuentan **${fmtUYU(ap.total)}** de aportes BPS (montepío 15% + FONASA ${tasaFonasaPct}% + FRL 0,1%)` +
      (irpf > 0 ? ` y **${fmtUYU(irpf)}** de IRPF` : ' (no pagás IRPF, estás por debajo del mínimo no imponible de 7 BPC)') +
      `. El descuento total es del **${efectivoStr}%**.`,
    tone: 'good',
    icon: '💵',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Líquido', value: Math.round(liquido) },
      { label: 'Aportes BPS', value: Math.round(ap.total) },
      { label: 'IRPF', value: Math.round(irpf) },
    ].filter((s) => s.value > 0),
    prefix: '$U ',
    centerValue: fmtUYU(nominal),
    centerLabel: 'Sueldo nominal',
    ariaLabel: `Nominal ${fmtUYU(nominal)}: líquido ${fmtUYU(liquido)}, aportes BPS ${fmtUYU(ap.total)}, IRPF ${fmtUYU(irpf)}.`,
  };

  return {
    liquido: fmtUYU(liquido),
    nominal: fmtUYU(nominal),
    aportesBps: fmtUYU(ap.total),
    montepio: fmtUYU(ap.montepio),
    fonasa: `${fmtUYU(ap.fonasa)} (${tasaFonasaPct}%)`,
    frl: fmtUYU(ap.frl),
    irpf: fmtUYU(irpf),
    descuentoTotal: `${fmtUYU(nominal - liquido)} (${efectivoStr}%)`,
    detalle:
      `Nominal ${fmtUYU(nominal)} − BPS ${fmtUYU(ap.total)}` +
      (irpf > 0 ? ` − IRPF ${fmtUYU(irpf)}` : '') +
      ` = líquido ${fmtUYU(liquido)}.`,
    _insight,
    _chart,
  };
}
