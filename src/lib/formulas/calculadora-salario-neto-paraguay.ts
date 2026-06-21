/**
 * Salario neto — PARAGUAY.
 * Del salario bruto se descuenta el aporte obrero al IPS (9%) y se suma la
 * bonificación familiar (5% del salario mínimo por hijo, sólo si gana ≤ 2 SMVM).
 *
 * neto = bruto − aporteIPS(9%) + bonifFamiliar − otrosDescuentos
 *
 * Datos desde src/lib/data/paraguay-2026.ts (IPS obrero, bonificación familiar,
 * salario mínimo — NO se hardcodea ninguno).
 */
import { PARAGUAY_2026, bonificacionFamiliar, fmtPYG } from '../data/paraguay-2026';

export interface SalarioNetoParaguayInputs {
  salarioBruto: number | string;
  hijos?: number | string;
  otrosDescuentos?: number | string;
}

export interface SalarioNetoParaguayOutputs {
  neto: number;
  aporteIPS: number;
  bonifFamiliar: number;
  otrosDescuentos: number;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraSalarioNetoParaguay(i: SalarioNetoParaguayInputs): SalarioNetoParaguayOutputs {
  const bruto = Math.max(0, Number(i.salarioBruto) || 0);
  if (bruto <= 0) throw new Error('Ingresá tu salario bruto');
  const hijos = Math.max(0, Math.floor(Number(i.hijos) || 0));
  const otros = Math.max(0, Number(i.otrosDescuentos) || 0);

  const tasaObrero = PARAGUAY_2026.ips.obrero; // 0.09
  const aporteIPS = bruto * tasaObrero;
  const bonifFamiliar = bonificacionFamiliar(hijos, bruto);

  const neto = bruto - aporteIPS + bonifFamiliar - otros;

  const sm = PARAGUAY_2026.salarioMinimo;
  const tope = sm * PARAGUAY_2026.laboral.bonificacionFamiliarTopeSalarios;

  const resumen = `${fmtPYG(bruto)} − ${fmtPYG(aporteIPS)} IPS${bonifFamiliar > 0 ? ` + ${fmtPYG(bonifFamiliar)} bonif.` : ''}${otros > 0 ? ` − ${fmtPYG(otros)} otros` : ''} = ${fmtPYG(neto)}`;

  const formula = `Neto = Bruto − IPS 9% ${bonifFamiliar > 0 ? '+ bonif. familiar ' : ''}− otros descuentos = ${fmtPYG(neto)}`;

  const pctDescuento = bruto > 0 ? (aporteIPS / bruto) * 100 : 0;

  const _insight = {
    type: 'highlight' as const,
    icon: '🇵🇾',
    text:
      hijos > 0 && bonifFamiliar === 0
        ? `De tu bruto de **${fmtPYG(bruto)}** te descuentan **${fmtPYG(aporteIPS)}** de IPS (9%) y te queda un neto de **${fmtPYG(neto)}**. La bonificación familiar no aplica porque tu salario supera 2 salarios mínimos (${fmtPYG(tope)}).`
        : bonifFamiliar > 0
          ? `De tu bruto de **${fmtPYG(bruto)}** te descuentan **${fmtPYG(aporteIPS)}** de IPS y te suman **${fmtPYG(bonifFamiliar)}** de bonificación familiar por ${hijos} ${hijos === 1 ? 'hijo' : 'hijos'}: neto **${fmtPYG(neto)}**.`
          : `De tu bruto de **${fmtPYG(bruto)}** el IPS obrero se lleva **${fmtPYG(aporteIPS)}** (9%) y te queda un neto de **${fmtPYG(neto)}**. El aporte te da cobertura de salud y jubilación.`,
  };

  const _table = {
    title: 'Desglose del salario neto (Paraguay)',
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Salario bruto', fmtPYG(bruto)],
      [`Aporte IPS obrero (${(tasaObrero * 100).toFixed(0)}%)`, '− ' + fmtPYG(aporteIPS)],
      ['Bonificación familiar', (bonifFamiliar > 0 ? '+ ' : '') + fmtPYG(bonifFamiliar)],
      ['Otros descuentos', (otros > 0 ? '− ' : '') + fmtPYG(otros)],
      ['Salario neto a cobrar', fmtPYG(neto)],
    ],
    note: `El aporte obrero del 9% va al IPS (jubilación + salud). El empleador aporta otro 16,5% por separado (no sale de tu bolsillo). La bonificación familiar (${fmtPYG(sm * PARAGUAY_2026.laboral.bonificacionFamiliarPct)} por hijo) sólo se cobra si el salario no supera ${fmtPYG(tope)}.`,
  };

  return {
    neto: Math.round(neto),
    aporteIPS: Math.round(aporteIPS),
    bonifFamiliar: Math.round(bonifFamiliar),
    otrosDescuentos: Math.round(otros),
    resumen,
    formula,
    _insight,
    _table,
  };
}
