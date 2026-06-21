/**
 * Calculadora de Retención de ISLR en Venezuela 2026 (sueldos).
 *
 * Estima la retención mensual de ISLR sobre el sueldo de un trabajador bajo
 * relación de dependencia: proyecta el salario mensual a un enriquecimiento
 * anual (× 12), aplica el desgravamen único (774 U.T.), calcula el ISLR anual
 * con la Tarifa N° 1 (helper islrAnualVes) y lo divide entre 12 para obtener la
 * retención mensual y el porcentaje de retención.
 *
 * Datos: U.T., tramos y rebajas se leen de src/lib/data/venezuela-2026.ts
 *   (VENEZUELA_2026.islr / .unidadTributaria, helper islrAnualVes), NO se hardcodean.
 *   Fuente: SENIAT, Ley de ISLR (Art. 50, Tarifa N° 1), Reglamento de Retenciones
 *   (Decreto 1.808).
 */
import { VENEZUELA_2026, islrAnualVes, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual?: number; // sueldo mensual en Bs.
  cargas?: number;         // nº de cargas familiares (rebaja 10 U.T. c/u)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtPct = (n: number): string =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(n) + ' %';

export function calculadoraRetencionIslrVenezuela(i: Inputs): Outputs {
  const ut = VENEZUELA_2026.unidadTributaria;
  const islr = VENEZUELA_2026.islr;

  const salarioMensual = Math.max(0, Number(i.salarioMensual) || 0);
  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual en bolívares.');

  const cargas = Math.max(0, Math.floor(Number(i.cargas) || 0));

  // Proyección anual del salario.
  const enriquecimientoAnual = salarioMensual * 12;

  // Desgravamen único de 774 U.T. (los trabajadores bajo dependencia suelen tomarlo).
  const desgravamenBs = islr.desgravamenUnicoUt * ut;
  const netoGravable = Math.max(0, enriquecimientoAnual - desgravamenBs);

  // ISLR anual estimado (ya descuenta rebaja personal 10 U.T. + cargas).
  const islrAnual = islrAnualVes(netoGravable, cargas);

  // Retención mensual = ISLR anual / 12.
  const retencionMensual = islrAnual / 12;
  const porcentajeRetencion = salarioMensual > 0 ? (retencionMensual / salarioMensual) * 100 : 0;
  const netoMensual = Math.max(0, salarioMensual - retencionMensual);

  const baseUt = netoGravable / ut;

  let narrativa: string;
  if (retencionMensual <= 0) {
    narrativa = `Con un sueldo de ${fmtVES(salarioMensual)}/mes (${fmtVES(enriquecimientoAnual)} al año), tras el ` +
      `desgravamen único y la rebaja personal no te corresponde retención de ISLR: tu salario queda íntegro.`;
  } else {
    narrativa = `Con un sueldo de ${fmtVES(salarioMensual)}/mes, el ISLR anual estimado es ${fmtVES(islrAnual)}, ` +
      `lo que da una retención mensual de ${fmtVES(retencionMensual)} (${fmtPct(porcentajeRetencion)} de tu sueldo). ` +
      `Te quedan ${fmtVES(netoMensual)} en mano.`;
  }

  return {
    retencionMensual,
    salarioMensual,
    porcentajeRetencion,
    netoMensual,
    islrAnualEstimado: islrAnual,
    enriquecimientoAnual,
    detalle: `Retención ${fmtVES(retencionMensual)}/mes (${fmtPct(porcentajeRetencion)}) · neto ${fmtVES(netoMensual)}`,
    _insight: {
      type: 'highlight',
      icon: '🇻🇪',
      text: narrativa,
    },
    _table: {
      title: 'Cálculo de la retención mensual de ISLR',
      headers: ['Concepto', 'Monto'],
      rows: [
        ['Salario mensual', fmtVES(salarioMensual)],
        ['Enriquecimiento anual proyectado (× 12)', fmtVES(enriquecimientoAnual)],
        ['(−) Desgravamen único (774 U.T.)', fmtVES(desgravamenBs)],
        ['Neto gravable anual', `${fmtVES(netoGravable)} (${baseUt.toFixed(0)} U.T.)`],
        ['ISLR anual estimado', fmtVES(islrAnual)],
        ['Retención mensual (÷ 12)', fmtVES(retencionMensual)],
        ['% de retención', fmtPct(porcentajeRetencion)],
      ],
      note: `U.T. = ${fmtVES(ut)}. Estimación bajo el método de proyección anual del Reglamento de Retenciones (Decreto 1.808). ` +
        `El porcentaje real (ARC/AR-I) lo ajusta el agente de retención según variaciones del sueldo durante el año.`,
    },
  };
}
