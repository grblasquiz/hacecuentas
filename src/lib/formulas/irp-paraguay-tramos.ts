/**
 * IRP Paraguay 2026 — Impuesto a la Renta Personal, servicios personales.
 * Ley N° 6380/19 de Modernización Tributaria (art. 70).
 *
 * El contribuyente solo está INCIDIDO si su ingreso BRUTO anual por servicios
 * personales supera Gs. 80.000.000 (umbral de no incidencia). Por debajo de ese
 * umbral el impuesto es 0, aunque la renta neta sea positiva.
 *
 * Superado el umbral, el impuesto se calcula sobre la RENTA NETA (ingresos brutos −
 * gastos e inversiones deducibles) con la escala progresiva:
 *
 *   hasta Gs.  50.000.000 ................. 8%
 *   de  50.000.001 a 150.000.000 ......... 9%
 *   exceso de 150.000.000 ................ 10%
 *
 * Usa el helper oficial impuestoIRPAnual(rentaNeta, ingresoBruto) de la tabla
 * maestra, que aplica el umbral de no incidencia y la escala marginal.
 *
 * Fuente: DNIT — IRP, Ley 6380/19.
 */
import { PARAGUAY_2026, impuestoIRPAnual, fmtPYG } from '../data/paraguay-2026';

export interface Inputs {
  ingresoBrutoAnual: number;  // ingreso bruto anual por servicios personales (Gs.)
  deducibles: number;         // gastos e inversiones deducibles del año (Gs.)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function irpParaguayTramos(i: Inputs): Outputs {
  const ingresoBruto = Number(i.ingresoBrutoAnual) || 0;
  const deducibles = Math.max(0, Number(i.deducibles) || 0);

  if (ingresoBruto <= 0) throw new Error('Ingresá tu ingreso bruto anual en guaraníes');

  const umbral = PARAGUAY_2026.irp.noIncididoAnual; // 80.000.000
  const incidido = ingresoBruto > umbral;
  const rentaNeta = Math.max(0, ingresoBruto - deducibles);

  // Helper oficial: 0 si el bruto no supera el umbral; si no, escala 8/9/10% sobre la neta.
  const irpAnual = impuestoIRPAnual(rentaNeta, ingresoBruto);
  const irpMensual = irpAnual / 12;
  const tasaEfectiva = ingresoBruto > 0 ? (irpAnual / ingresoBruto) * 100 : 0;
  const netoDespuesIrp = ingresoBruto - irpAnual;

  // Desglose del impuesto por tramo (sobre la renta neta).
  const tramos = [
    { etiqueta: 'Hasta Gs. 50.000.000', tope: 50000000, tasa: 0.08 },
    { etiqueta: 'Gs. 50.000.001 – 150.000.000', tope: 150000000, tasa: 0.09 },
    { etiqueta: 'Exceso de Gs. 150.000.000', tope: Infinity, tasa: 0.10 },
  ];
  let base = incidido ? rentaNeta : 0;
  let anterior = 0;
  const filasTramos: Array<[string, string, string, string]> = [];
  for (const t of tramos) {
    const ancho = t.tope - anterior;
    const enTramo = Math.max(0, Math.min(base, ancho));
    const imp = enTramo * t.tasa;
    filasTramos.push([
      t.etiqueta,
      `${(t.tasa * 100).toFixed(0)}%`,
      fmtPYG(enTramo),
      fmtPYG(imp),
    ]);
    base -= enTramo;
    anterior = t.tope === Infinity ? anterior : t.tope;
  }

  const _insight = incidido
    ? {
        type: 'highlight',
        icon: '🧾',
        text: `Tu ingreso bruto anual (**${fmtPYG(ingresoBruto)}**) supera el mínimo no incidido de ${fmtPYG(umbral)}. ` +
          `Sobre una renta neta de **${fmtPYG(rentaNeta)}** pagás **${fmtPYG(irpAnual)}** de IRP al año ` +
          `(${fmtPYG(irpMensual)} por mes), una tasa efectiva del **${tasaEfectiva.toFixed(2)}%**.`,
      }
    : {
        type: 'highlight',
        icon: '✅',
        text: `Tu ingreso bruto anual (**${fmtPYG(ingresoBruto)}**) NO supera el mínimo no incidido de **${fmtPYG(umbral)}**, ` +
          `así que estás **exento del IRP**: no pagás impuesto sobre servicios personales este ejercicio.`,
      };

  const _table = {
    title: 'Cálculo del IRP por tramo (sobre la renta neta)',
    headers: ['Tramo de renta neta', 'Tasa', 'Base en el tramo', 'Impuesto'],
    rows: incidido
      ? [...filasTramos, ['Total IRP anual', '—', fmtPYG(rentaNeta), fmtPYG(irpAnual)]]
      : [['Exento (ingreso bruto ≤ Gs. 80.000.000)', '0%', fmtPYG(0), fmtPYG(0)]],
    note: incidido
      ? 'El impuesto es progresivo: cada tramo grava solo la porción de renta neta que cae dentro de él. Conservá comprobantes de los gastos deducibles.'
      : 'Aunque tengas renta neta positiva, mientras el ingreso bruto anual no supere Gs. 80.000.000 el IRP es cero.',
  };

  return {
    irpAnual: incidido ? `${fmtPYG(irpAnual)} (${tasaEfectiva.toFixed(2)}%)` : 'Exento (Gs. 0)',
    irpAnualMonto: Math.round(irpAnual),
    irpMensual: Math.round(irpMensual),
    rentaNeta: Math.round(rentaNeta),
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    netoDespuesImpuesto: Math.round(netoDespuesIrp),
    detalle: incidido
      ? `Renta neta ${fmtPYG(rentaNeta)} → IRP ${fmtPYG(irpAnual)} (${tasaEfectiva.toFixed(2)}%)`
      : `Bruto ${fmtPYG(ingresoBruto)} ≤ ${fmtPYG(umbral)} → exento`,
    _insight,
    _table,
  };
}
