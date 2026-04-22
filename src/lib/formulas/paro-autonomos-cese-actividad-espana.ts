/**
 * Calculadora de Prestación por Cese de Actividad (RETA) — Autónomos España
 *
 * Regulación: Ley 32/2010 + RDL 28/2018 + LGSS Arts. 327-346.
 *
 * Requisitos:
 *   - Cotización mínima de 12 meses continuados por cese de actividad.
 *   - Situación legal de cese (pérdidas > 10%, ejecuciones judiciales, fuerza mayor,
 *     divorcio en autónomos colaboradores, violencia de género).
 *   - Estar al corriente en pago de cuotas RETA.
 *
 * Duración (meses cotizados → meses de prestación):
 *   12-17   → 4 meses
 *   18-23   → 6 meses
 *   24-29   → 8 meses
 *   30-35   → 10 meses
 *   36-42   → 12 meses
 *   43-47   → 16 meses
 *   ≥ 48    → 24 meses (tope)
 *
 * Cuantía: 70% del promedio de la base de cotización de los últimos 12 meses.
 * Topes mensuales: iguales al paro SEPE (según IPREM y hijos a cargo).
 */

export interface ParoAutonomosInputs {
  mesesCotizados: number; // meses cotizados por cese de actividad (RETA)
  baseMediaCotizacion: number; // promedio mensual de base de cotización últimos 12 meses
  hijosACargo: 0 | 1 | 2;
  iprem: number; // IPREM mensual 2026
}

export interface ParoAutonomosOutputs {
  mesesProvision: string;
  importeMensualBruto: string;
  importeTotalBruto: string;
  topeAplicado: string;
  topesInfo: string;
}

const fmtEUR = (n: number) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function mesesProvisionAutonomo(mesesCot: number): number {
  if (mesesCot < 12) return 0;
  if (mesesCot < 18) return 4;
  if (mesesCot < 24) return 6;
  if (mesesCot < 30) return 8;
  if (mesesCot < 36) return 10;
  if (mesesCot < 43) return 12;
  if (mesesCot < 48) return 16;
  return 24;
}

export function paroAutonomosCeseActividadEspana(
  i: ParoAutonomosInputs
): ParoAutonomosOutputs {
  const mesesCot = Math.max(0, Number(i.mesesCotizados) || 0);
  const baseCot = Number(i.baseMediaCotizacion);
  const hijos = Math.min(2, Math.max(0, Number(i.hijosACargo) || 0)) as 0 | 1 | 2;
  const iprem = Number(i.iprem) || 600;

  if (!baseCot || baseCot <= 0) {
    throw new Error('Ingresá tu base media de cotización mensual en RETA');
  }
  if (mesesCot < 12) {
    throw new Error(
      'Necesitás al menos 12 meses continuados cotizados por cese de actividad para tener derecho a la prestación.'
    );
  }

  const meses = mesesProvisionAutonomo(mesesCot);

  // Cuantía: 70% de la base media
  let importeMensual = baseCot * 0.7;

  // Topes IPREM según hijos (idéntico al SEPE)
  let minimo: number, maximo: number;
  if (hijos === 0) {
    minimo = iprem * 0.8;
    maximo = iprem * 1.75;
  } else if (hijos === 1) {
    minimo = iprem * 1.07;
    maximo = iprem * 2.0;
  } else {
    minimo = iprem * 1.07;
    maximo = iprem * 2.25;
  }

  const topeAplicadoBool = importeMensual > maximo || importeMensual < minimo;
  importeMensual = Math.min(maximo, Math.max(minimo, importeMensual));

  const total = importeMensual * meses;

  return {
    mesesProvision: `${meses} meses`,
    importeMensualBruto: fmtEUR(importeMensual) + '/mes',
    importeTotalBruto: fmtEUR(total),
    topeAplicado: topeAplicadoBool
      ? `Sí — importe ajustado a los topes IPREM (hijos: ${hijos})`
      : 'No — importe dentro de los topes',
    topesInfo: `Mínimo ${fmtEUR(minimo)}/mes — Máximo ${fmtEUR(maximo)}/mes (IPREM 2026: ${fmtEUR(iprem)}/mes)`,
  };
}
