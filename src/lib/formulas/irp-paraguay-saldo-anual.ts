/**
 * IRP — saldo a pagar anual — PARAGUAY 2026.
 * Impuesto a la Renta Personal sobre servicios personales (Ley N° 6380/19, art. 70).
 *
 * El contribuyente solo está INCIDIDO si su ingreso BRUTO anual supera el umbral de
 * no incidencia (Gs. 80.000.000). Superado el umbral, el impuesto se calcula sobre la
 * RENTA NETA = ingreso bruto − gastos/inversiones deducibles − aporte IPS anual, con
 * la escala progresiva marginal:
 *
 *   hasta Gs.  50.000.000 ......... 8%
 *   de  50.000.001 a 150.000.000 .. 9%
 *   exceso de 150.000.000 ......... 10%
 *
 * Usa el helper oficial impuestoIRPAnual(rentaNeta, ingresoBruto) de la tabla maestra.
 *
 * ⚠️ Los gastos deducibles son los efectivamente documentados con comprobantes
 * legales (facturas a tu nombre): consumo familiar, salud, educación, inversiones, etc.
 * El monto deducible es un input — el contribuyente lo declara con respaldo documental.
 *
 * Fuente: DNIT — IRP, Ley 6380/19.
 */
import { PARAGUAY_2026, impuestoIRPAnual, fmtPYG } from '../data/paraguay-2026';

export interface IrpParaguaySaldoAnualInputs {
  ingresoAnual?: number | string;
  gastosDeducibles?: number | string;
  aporteIPSanual?: number | string;
}

export interface IrpParaguaySaldoAnualOutputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function irpParaguaySaldoAnual(i: IrpParaguaySaldoAnualInputs): IrpParaguaySaldoAnualOutputs {
  const ingresoAnual = Math.max(0, Number(i.ingresoAnual) || 0);
  const gastosDeducibles = Math.max(0, Number(i.gastosDeducibles) || 0);
  const aporteIPSanual = Math.max(0, Number(i.aporteIPSanual) || 0);

  if (ingresoAnual <= 0) throw new Error('Ingresá tu ingreso bruto anual por servicios personales (Gs.)');

  const umbral = PARAGUAY_2026.irp.noIncididoAnual; // 80.000.000
  const incidido = ingresoAnual > umbral;
  const rentaNeta = Math.max(0, ingresoAnual - gastosDeducibles - aporteIPSanual);
  const irpAnual = impuestoIRPAnual(rentaNeta, ingresoAnual);
  const tasaEfectiva = ingresoAnual > 0 ? (irpAnual / ingresoAnual) * 100 : 0;
  const cuotaMensualEstim = irpAnual / 12;

  const _insight = incidido
    ? {
        type: 'highlight' as const,
        icon: '🧾',
        text:
          `Tu ingreso bruto anual (**${fmtPYG(ingresoAnual)}**) supera el umbral de no incidencia (${fmtPYG(umbral)}). ` +
          `Restando deducibles (${fmtPYG(gastosDeducibles)}) y aporte IPS (${fmtPYG(aporteIPSanual)}), la renta neta es **${fmtPYG(rentaNeta)}**. ` +
          `El IRP del ejercicio es **${fmtPYG(irpAnual)}** (tasa efectiva **${tasaEfectiva.toFixed(2)}%**), unos **${fmtPYG(cuotaMensualEstim)}** por mes estimado.`,
      }
    : {
        type: 'highlight' as const,
        icon: '✅',
        text:
          `Tu ingreso bruto anual (**${fmtPYG(ingresoAnual)}**) NO supera el umbral de no incidencia (**${fmtPYG(umbral)}**): ` +
          `estás **exento del IRP** este ejercicio, no tenés saldo a pagar.`,
      };

  const _table = {
    title: 'IRP — saldo a pagar anual (servicios personales, Paraguay)',
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Ingreso bruto anual', fmtPYG(ingresoAnual)],
      ['(−) Gastos deducibles documentados', '− ' + fmtPYG(gastosDeducibles)],
      ['(−) Aporte IPS anual', '− ' + fmtPYG(aporteIPSanual)],
      ['Renta neta imponible', fmtPYG(rentaNeta)],
      ['IRP anual (escala 8/9/10%)', fmtPYG(irpAnual)],
      ['Tasa efectiva', `${tasaEfectiva.toFixed(2)}%`],
      ['Cuota mensual estimada', fmtPYG(cuotaMensualEstim)],
    ],
    note: `Solo se incide si el ingreso BRUTO anual supera Gs. 80.000.000. El impuesto se calcula sobre la renta NETA con escala progresiva (8% hasta 50M, 9% hasta 150M, 10% sobre el exceso). Los gastos deducibles requieren comprobantes legales a tu nombre. La cuota mensual es estimativa: la liquidación real del IRP es anual ante la DNIT.`,
  };

  return {
    incidido: incidido ? 'Sí (supera Gs. 80.000.000)' : 'No (exento)',
    rentaNeta: Math.round(rentaNeta),
    irpAnual: Math.round(irpAnual),
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    cuotaMensualEstim: Math.round(cuotaMensualEstim),
    resumen: incidido
      ? `Renta neta ${fmtPYG(rentaNeta)} → IRP ${fmtPYG(irpAnual)} (${tasaEfectiva.toFixed(2)}%)`
      : `Bruto ${fmtPYG(ingresoAnual)} ≤ ${fmtPYG(umbral)} → exento`,
    _insight,
    _table,
  };
}
