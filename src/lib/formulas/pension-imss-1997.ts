/**
 * Calculadora de pensión IMSS Ley 1997 (cuentas individuales)
 * Proyecta el saldo en AFORE al jubilar y estima pensión mensual.
 * Fórmula: saldoFinal = saldoAfore * (1+r)^años + aporteMensual * [((1+r)^años -1)/r] capitalizado mensual
 * Pensión mensual indicativa = saldoFinal * 0.004 (factor anualidad simplificada)
 */

export interface Inputs {
  saldoAfore: number;
  edadActual: number;
  edadJubilacion: number;
  semanasCotizadas?: number;
  aportacionVoluntariaMensual?: number;
  rendimientoAnual?: number;
}

export interface Outputs {
  pensionMensual: number;
  saldoAcumulado: number;
  pensionAnual: number;
  superaPMG: string;
  cumpleSemanas: boolean;
  mensaje: string;
}

const PMG_MENSUAL_2026 = 6500; // pensión mínima garantizada indicativa

export function pensionImss1997(i: Inputs): Outputs {
  const saldoAfore = Number(i.saldoAfore);
  const edadActual = Number(i.edadActual);
  const edadJubilacion = Number(i.edadJubilacion ?? 65);
  const semanas = Number(i.semanasCotizadas ?? 0);
  const aporteVol = Number(i.aportacionVoluntariaMensual ?? 0);
  const rendAnual = Number(i.rendimientoAnual ?? 4);

  if (!saldoAfore && saldoAfore !== 0) throw new Error('Ingresá el saldo actual en AFORE');
  if (saldoAfore < 0) throw new Error('El saldo AFORE no puede ser negativo');
  if (!edadActual || edadActual <= 0) throw new Error('Ingresá la edad actual');
  if (edadJubilacion <= edadActual) throw new Error('La edad de jubilación debe ser mayor a la edad actual');

  const anios = edadJubilacion - edadActual;
  const meses = anios * 12;
  const rMensual = rendAnual / 100 / 12;

  let saldoFinal: number;
  if (rMensual === 0) {
    saldoFinal = saldoAfore + aporteVol * meses;
  } else {
    const factor = Math.pow(1 + rMensual, meses);
    const capitalInicial = saldoAfore * factor;
    const aportes = aporteVol * ((factor - 1) / rMensual);
    saldoFinal = capitalInicial + aportes;
  }

  // Factor indicativo UMA: 0.004 (anualidad actuarial simplificada)
  const pensionMensual = saldoFinal * 0.004;
  const pensionAnual = pensionMensual * 12;
  const cumpleSemanas = semanas >= 1000; // Ley 97 reformada 2020: 750 escalando a 1000

  return {
    pensionMensual: Number(pensionMensual.toFixed(2)),
    saldoAcumulado: Number(saldoFinal.toFixed(2)),
    pensionAnual: Number(pensionAnual.toFixed(2)),
    superaPMG: pensionMensual >= PMG_MENSUAL_2026 ? 'Sí, supera la PMG' : 'No, aplicarías PMG',
    cumpleSemanas,
    mensaje: `Al jubilarte a los ${edadJubilacion} años acumulás ~$${Math.round(saldoFinal).toLocaleString('es-MX')} en AFORE. Pensión mensual estimada: $${Math.round(pensionMensual).toLocaleString('es-MX')}.${cumpleSemanas ? '' : ' Te faltan semanas cotizadas para pensión contributiva (mínimo 1000).'}`,
  };
}
