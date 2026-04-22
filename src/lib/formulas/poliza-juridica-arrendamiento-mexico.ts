/** Póliza jurídica arrendamiento México — costo anual y por mes */
export interface Inputs { rentaMensual: number; tipoPoliza: string; duracionMeses: number; }
export interface Outputs { costoPoliza: number; costoMensualProrrateado: number; equivalenteMesesRenta: number; costoTotalContrato: number; comparacionDepositoTradicional: number; }

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
  return {
    costoPoliza: Math.round(costoPoliza),
    costoMensualProrrateado: Math.round(costoMensualProrrateado),
    equivalenteMesesRenta: Number(equivalenteMesesRenta.toFixed(2)),
    costoTotalContrato: Math.round(costoTotalContrato),
    comparacionDepositoTradicional: Math.round(comparacionDepositoTradicional),
  };
}
