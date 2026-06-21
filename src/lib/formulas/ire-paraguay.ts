/**
 * IRE Paraguay 2026 — Impuesto a la Renta Empresarial (Ley 6380/19).
 * Tasa única del 10% sobre la renta neta, tanto en el Régimen General como en
 * el Régimen SIMPLE. La tasa NO se hardcodea: viene de PARAGUAY_2026.ire.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026.ts';

export interface Inputs {
  modo?: string;          // 'renta-neta' (paso la renta neta directa) | 'ingresos-egresos' (la calculo)
  rentaNeta?: number;     // renta neta anual (Gs.) — usado cuando modo='renta-neta'
  ingresos?: number;      // ingresos gravados anuales (Gs.) — usado cuando modo='ingresos-egresos'
  egresos?: number;       // egresos/costos deducibles anuales (Gs.) — usado cuando modo='ingresos-egresos'
  regimen?: string;       // 'general' | 'simple'
}

export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function ireParaguay(i: Inputs): Outputs {
  const modo = String(i.modo || 'renta-neta') === 'ingresos-egresos' ? 'ingresos-egresos' : 'renta-neta';
  const regimen = String(i.regimen || 'general') === 'simple' ? 'simple' : 'general';

  // Renta neta gravada
  let rentaNeta: number;
  let ingresos = 0;
  let egresos = 0;
  if (modo === 'ingresos-egresos') {
    ingresos = Number(i.ingresos) || 0;
    egresos = Number(i.egresos) || 0;
    if (ingresos <= 0) throw new Error('Ingresá los ingresos gravados del ejercicio');
    rentaNeta = ingresos - egresos;
  } else {
    rentaNeta = Number(i.rentaNeta) || 0;
    if (rentaNeta <= 0 && (Number(i.rentaNeta) || 0) <= 0) {
      throw new Error('Ingresá la renta neta anual');
    }
  }

  const tasa = regimen === 'simple' ? PARAGUAY_2026.ire.simple : PARAGUAY_2026.ire.general; // 0.10
  const base = Math.max(0, rentaNeta);
  const ire = base * tasa;
  const utilidadDespues = base - ire;
  const tasaPct = Math.round(tasa * 100);
  const topeSimple = PARAGUAY_2026.ire.simpleTopeIngresosAnual;

  const _table = {
    title: 'Cálculo del IRE',
    headers: ['Concepto', 'Monto (Gs.)'],
    rows: [
      ...(modo === 'ingresos-egresos'
        ? [
            ['Ingresos gravados', fmtPYG(ingresos)],
            ['(−) Egresos deducibles', fmtPYG(egresos)],
          ]
        : []),
      ['Renta neta imponible', fmtPYG(base)],
      [`IRE ${tasaPct}% (${regimen === 'simple' ? 'SIMPLE' : 'General'})`, fmtPYG(ire)],
      ['Utilidad después del IRE', fmtPYG(utilidadDespues)],
    ],
    note: 'Los dividendos que luego se distribuyan tributan además el IDU (8% residente / 15% exterior).',
  };

  const _insight = {
    type: 'highlight',
    icon: '🏢',
    text:
      base <= 0
        ? 'Con renta neta cero o negativa no se genera IRE (sin perjuicio del anticipo y del IRE mínimo que pueda corresponder).'
        : `Sobre una renta neta de **${fmtPYG(base)}**, el IRE ${regimen === 'simple' ? 'SIMPLE' : 'General'} al ${tasaPct}% es de **${fmtPYG(ire)}**, y te quedan **${fmtPYG(utilidadDespues)}** de utilidad antes de distribuir dividendos.`,
  };

  return {
    ire: ire,
    rentaNeta: base,
    utilidadDespues: utilidadDespues,
    tasa: `${tasaPct}%`,
    detalle: `Renta neta ${fmtPYG(base)} × ${tasaPct}% = IRE ${fmtPYG(ire)} (${regimen === 'simple' ? 'SIMPLE' : 'General'}).`,
    avisoRegimen:
      regimen === 'simple'
        ? `El Régimen SIMPLE aplica a contribuyentes con facturación anual de hasta ${fmtPYG(topeSimple)}. La tasa es la misma (${tasaPct}%) pero con base presunta/simplificada.`
        : `Régimen General: la tasa es ${tasaPct}% sobre la renta neta determinada con balance fiscal.`,
    _table,
    _insight,
  };
}
