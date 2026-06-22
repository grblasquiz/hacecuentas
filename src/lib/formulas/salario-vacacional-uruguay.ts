/**
 * Salario vacacional Uruguay 2026 (Ley 16.101).
 * = jornal LÍQUIDO × días de licencia.
 *
 * El jornal líquido legal = (nominal − aportes BPS: montepío + FONASA + FRL) ÷ 30.
 * El salario vacacional NO paga aportes BPS, pero SÍ tributa IRPF a la tasa marginal
 * del trabajador (Ley 19.321). Por eso el "en mano" descuenta sólo ese IRPF.
 *
 * No usa un factor fijo (~0,81): el jornal líquido se deriva de aportesBpsPersonales.
 * Tasas desde uruguay-2026.ts.
 */
import {
  URUGUAY_2026,
  fmtUYU,
  aportesBpsPersonales,
  salarioLiquido,
  irpfMensual,
} from '../data/uruguay-2026.ts';

export interface Inputs {
  nominal: number;
  dias?: number;     // días de licencia a abonar
  conyuge?: string;  // 'si' | 'no'
  hijos?: string;    // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function salarioVacacionalUruguay(i: Inputs): Outputs {
  const nominal = Number(i.nominal) || 0;
  if (nominal <= 0) throw new Error('Ingresá tu sueldo nominal mensual');
  const dias = Math.max(1, Number(i.dias) || URUGUAY_2026.laboral.licenciaDiasBase);

  const conConyuge = String(i.conyuge || 'no') === 'si';
  const conHijos = String(i.hijos || 'no') === 'si';

  // Jornal líquido legal = (nominal − aportes BPS) / 30. (NO descuenta IRPF de la base.)
  const ap = aportesBpsPersonales(nominal, conConyuge, conHijos);
  const liquidoBps = nominal - ap.total;
  const jornalLiquido = liquidoBps / 30;

  const salarioVacacionalBruto = jornalLiquido * dias;

  // El salario vacacional tributa IRPF a la tasa marginal. Estimamos el IRPF
  // incremental: IRPF(nominal + prorrateo mensual de la prima) − IRPF(nominal).
  // Como aproximación práctica del marginal, prorrateamos la prima en el mes.
  const apMasPrima = aportesBpsPersonales(nominal + salarioVacacionalBruto, conConyuge, conHijos);
  const irpfBase = irpfMensual(nominal, ap.total);
  const irpfConPrima = irpfMensual(nominal + salarioVacacionalBruto, apMasPrima.total);
  const irpfPrima = Math.max(0, irpfConPrima - irpfBase);

  const salarioVacacionalNeto = salarioVacacionalBruto - irpfPrima;

  const jornalNominal = nominal / 30;

  const _insight = {
    title: 'Tu salario vacacional',
    text:
      `Por **${dias} días** de licencia cobrás un salario vacacional de **${fmtUYU(salarioVacacionalBruto)}** ` +
      `(jornal líquido **${fmtUYU(jornalLiquido)}** × ${dias} días). ` +
      `Se calcula sobre el jornal **líquido** (no el nominal), por eso es menor a ${fmtUYU(jornalNominal)} × ${dias}. ` +
      (irpfPrima > 0
        ? `Tras el IRPF (**${fmtUYU(irpfPrima)}**), te quedan **${fmtUYU(salarioVacacionalNeto)}** en mano.`
        : `No paga aportes BPS ni IRPF en tu caso, así que cobrás los **${fmtUYU(salarioVacacionalBruto)}** completos.`),
    tone: 'good',
    icon: '🏖️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'En mano', value: Math.round(salarioVacacionalNeto) },
      { label: 'IRPF', value: Math.round(irpfPrima) },
    ].filter((s) => s.value > 0),
    prefix: '$U ',
    centerValue: fmtUYU(salarioVacacionalBruto),
    centerLabel: 'Salario vacacional',
    ariaLabel: `Salario vacacional ${fmtUYU(salarioVacacionalBruto)}, en mano ${fmtUYU(salarioVacacionalNeto)}, IRPF ${fmtUYU(irpfPrima)}.`,
  };

  return {
    salarioVacacional: fmtUYU(salarioVacacionalBruto),
    enMano: fmtUYU(salarioVacacionalNeto),
    jornalLiquido: fmtUYU(jornalLiquido),
    dias: String(dias),
    irpf: fmtUYU(irpfPrima),
    detalle:
      `Jornal líquido ${fmtUYU(jornalLiquido)} (= (${fmtUYU(nominal)} − BPS ${fmtUYU(ap.total)}) ÷ 30) × ${dias} días = ${fmtUYU(salarioVacacionalBruto)}` +
      (irpfPrima > 0 ? `; en mano tras IRPF: ${fmtUYU(salarioVacacionalNeto)}.` : '.'),
    _insight,
    _chart,
  };
}
