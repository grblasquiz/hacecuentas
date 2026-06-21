/**
 * Calculadora de IVA en Venezuela (16%) — sacar y agregar IVA.
 *
 * Dos modos:
 *   - "agregar": el monto ingresado es la base imponible (neto) y se le suma el IVA.
 *   - "desglosar": el monto ingresado es el total CON IVA y se separa la base y el IVA.
 *
 * Alícuotas (Ley del IVA): general 16%, reducida 8%, suntuaria 31% (16% + 15%).
 *
 * Datos: las alícuotas se leen de src/lib/data/venezuela-2026.ts
 *   (VENEZUELA_2026.iva / .ivaReducida / .ivaSuntuariaAdicional), NO se hardcodean.
 *   Fuente: SENIAT, Ley del IVA.
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  monto?: number;       // base (modo agregar) o total con IVA (modo desglosar)
  modo?: string;        // 'agregar' | 'desglosar'
  alicuota?: string;    // '16' | '8' | '31'
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtPct = (n: number): string =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(n) + ' %';

export function calculadoraIvaVenezuela16(i: Inputs): Outputs {
  const v = VENEZUELA_2026;
  const monto = Math.max(0, Number(i.monto) || 0);
  if (monto <= 0) throw new Error('Ingresá un monto en bolívares.');

  const modo = String(i.modo ?? 'agregar') === 'desglosar' ? 'desglosar' : 'agregar';

  // Resolver la alícuota seleccionada.
  const alicuotaSel = String(i.alicuota ?? '16');
  const tasaPorClave: Record<string, number> = {
    '16': v.iva,
    '8': v.ivaReducida,
    '31': v.iva + v.ivaSuntuariaAdicional, // 16% + 15% = 31%
  };
  const tasa = tasaPorClave[alicuotaSel] ?? v.iva;
  const tasaPct = Math.round(tasa * 100);

  let base: number;
  let iva: number;
  let total: number;

  if (modo === 'agregar') {
    base = monto;
    iva = base * tasa;
    total = base + iva;
  } else {
    total = monto;
    base = total / (1 + tasa);
    iva = total - base;
  }

  const etiquetaAlicuota =
    tasaPct === 16 ? 'general (16%)' : tasaPct === 8 ? 'reducida (8%)' : 'suntuaria (31%)';

  const narrativa =
    modo === 'agregar'
      ? `A una base de ${fmtVES(base)} se le suma ${fmtVES(iva)} de IVA ${etiquetaAlicuota}, ` +
        `dando un total de ${fmtVES(total)}.`
      : `De un total de ${fmtVES(total)} con IVA ${etiquetaAlicuota}, la base imponible es ${fmtVES(base)} ` +
        `y el IVA incluido es ${fmtVES(iva)}.`;

  return {
    total,
    base,
    iva,
    alicuotaAplicada: tasaPct,
    detalle: `Base ${fmtVES(base)} + IVA ${fmtPct(tasaPct)} ${fmtVES(iva)} = ${fmtVES(total)}`,
    _insight: {
      type: 'highlight',
      icon: '🧾',
      text: narrativa,
    },
    _table: {
      title: 'Desglose del IVA',
      headers: ['Concepto', 'Monto'],
      rows: [
        ['Base imponible (neto)', fmtVES(base)],
        [`IVA ${fmtPct(tasaPct)}`, fmtVES(iva)],
        ['Total con IVA', fmtVES(total)],
      ],
      note: 'Alícuotas vigentes en Venezuela (Ley del IVA, SENIAT): general 16%, reducida 8% (alimentos y servicios básicos), suntuaria 31% (16% + 15% de lujo).',
    },
  };
}
