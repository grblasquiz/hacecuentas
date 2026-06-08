/** Sueldo bruto ↔ neto (Ecuador) — descuento del aporte personal IESS (9,45%).
 *  Neto = bruto × (1 − 0,0945). Bruto = neto ÷ (1 − 0,0945). No incluye retención de IR. */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  monto: number;
  direccion?: string; // 'bruto_a_neto' (default) | 'neto_a_bruto'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const direccion = String(i.direccion || 'bruto_a_neto');
  if (monto <= 0) throw new Error('Ingresá el monto del sueldo');

  const factor = 1 - ECUADOR_2026.iessPersonal; // 0,9055
  const esBrutoANeto = direccion !== 'neto_a_bruto';

  let bruto: number;
  let neto: number;
  if (esBrutoANeto) {
    bruto = monto;
    neto = monto * factor;
  } else {
    neto = monto;
    bruto = monto / factor;
  }
  const aporteIess = bruto * ECUADOR_2026.iessPersonal;

  const _insight = {
    title: esBrutoANeto ? 'Tu sueldo neto' : 'Tu sueldo bruto necesario',
    text: esBrutoANeto
      ? `Con un sueldo bruto de **${fmtUSDec(bruto)}**, después del aporte personal al IESS (9,45% = ${fmtUSDec(aporteIess)}) recibís **${fmtUSDec(neto)}** en mano. (No incluye retención de impuesto a la renta).`
      : `Para recibir **${fmtUSDec(neto)}** netos en mano necesitás un sueldo bruto de **${fmtUSDec(bruto)}**; el aporte personal al IESS (9,45%) es de ${fmtUSDec(aporteIess)}. (No incluye retención de impuesto a la renta).`,
    tone: 'neutral',
    icon: '💵',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Neto en mano', value: Math.round(neto * 100) / 100 },
      { label: 'Aporte IESS (9,45%)', value: Math.round(aporteIess * 100) / 100 },
    ],
    ariaLabel: `Neto ${fmtUSDec(neto)} y aporte IESS ${fmtUSDec(aporteIess)}.`,
  };

  return {
    resultado: esBrutoANeto ? fmtUSDec(neto) : fmtUSDec(bruto),
    bruto: fmtUSDec(bruto),
    neto: fmtUSDec(neto),
    aporteIess: fmtUSDec(aporteIess),
    detalle: `Bruto ${fmtUSDec(bruto)} − IESS 9,45% (${fmtUSDec(aporteIess)}) = neto ${fmtUSDec(neto)}.`,
    _insight,
    _chart,
  };
}
