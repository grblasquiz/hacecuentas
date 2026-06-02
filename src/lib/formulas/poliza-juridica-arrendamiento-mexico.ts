/** Póliza jurídica arrendamiento México — costo anual y por mes */
export interface Inputs { rentaMensual: number; tipoPoliza: string; duracionMeses: number; }
export interface Outputs { costoPoliza: number; costoMensualProrrateado: number; equivalenteMesesRenta: number; costoTotalContrato: number; comparacionDepositoTradicional: number; _insight?: any; }

export function polizaJuridicaArrendamientoMexico(i: Inputs): Outputs {
  const renta = Number(i.rentaMensual);
  const tipo = String(i.tipoPoliza || 'basica');
  const dur = Number(i.duracionMeses) || 12;
  if (!renta || renta <= 0) throw new Error('Ingresá renta mensual válida');
  // Póliza jurídica MX: típicamente una mensualidad por año de contrato
  // Variantes: básica (1 renta), plus (1.3), premium (1.6)
  const factor = tipo === 'premium' ? 1.6 : tipo === 'plus' ? 1.3 : 1.0;
  const costoPoliza = renta * factor;
  const costoMensualProrrateado = costoPoliza / 12;
  const equivalenteMesesRenta = factor;
  const costoTotalContrato = costoPoliza * (dur / 12);
  // Comparación: depósito tradicional suele ser 1-2 meses de renta inmovilizados (sin costo directo pero con costo de oportunidad ~8% anual MX)
  const costoOportunidadDeposito = renta * 1 * 0.08 * (dur / 12);
  const comparacionDepositoTradicional = costoTotalContrato - costoOportunidadDeposito;
  const nombreTipo = tipo === 'premium' ? 'premium' : tipo === 'plus' ? 'plus' : 'básica';
  const _insight = {
    title: 'Cuánto te cuesta la póliza',
    text: `La póliza jurídica **${nombreTipo}** equivale a **${equivalenteMesesRenta.toFixed(2)} mes${equivalenteMesesRenta === 1 ? '' : 'es'} de renta**: **$${Math.round(costoPoliza).toLocaleString('es-MX')} MXN** por año (**$${Math.round(costoMensualProrrateado).toLocaleString('es-MX')}/mes** prorrateado), o **$${Math.round(costoTotalContrato).toLocaleString('es-MX')}** por los ${dur} meses de contrato. Frente a inmovilizar un depósito tradicional (costo de oportunidad ~8% anual), la póliza sale **$${Math.round(comparacionDepositoTradicional).toLocaleString('es-MX')} más cara**, pero no te congela el capital.`,
    tone: 'neutral',
    icon: '🏠',
  };
  return {
    costoPoliza: Math.round(costoPoliza),
    costoMensualProrrateado: Math.round(costoMensualProrrateado),
    equivalenteMesesRenta: Number(equivalenteMesesRenta.toFixed(2)),
    costoTotalContrato: Math.round(costoTotalContrato),
    comparacionDepositoTradicional: Math.round(comparacionDepositoTradicional),
    _insight,
  };
}
