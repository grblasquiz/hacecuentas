/** Precio contado vs cuotas "sin interés" con inflación */

export interface Inputs {
  precioContado: number;
  precioCuotas: number;
  cantidadCuotas: number;
  inflacionMensual: number;
}

export interface Outputs {
  costoFinanciero: number;
  cftPorcentaje: number;
  tnaEquivalente: number;
  valorPresenteCuotas: number;
  ahorroReal: number;
  convieneCuotas: string;
  formula: string;
  explicacion: string;
}

export function costoRealCuotasSinInteres(i: Inputs): Outputs {
  const contado = Number(i.precioContado);
  const cuotasTotal = Number(i.precioCuotas);
  const cuotas = Number(i.cantidadCuotas);
  const inflaMensual = Number(i.inflacionMensual) || 0;

  if (!contado || contado <= 0) throw new Error('Ingresá el precio de contado');
  if (!cuotasTotal || cuotasTotal <= 0) throw new Error('Ingresá el precio total en cuotas');
  if (!cuotas || cuotas <= 0) throw new Error('Ingresá la cantidad de cuotas');

  const valorCuota = cuotasTotal / cuotas;
  const costoFinanciero = cuotasTotal - contado;
  const cftPorcentaje = (costoFinanciero / contado) * 100;
  const tnaEquivalente = (cftPorcentaje / cuotas) * 12;

  // Valor presente de las cuotas con inflación
  let valorPresenteCuotas = 0;
  for (let m = 1; m <= cuotas; m++) {
    const factorInflacion = Math.pow(1 + inflaMensual / 100, m);
    valorPresenteCuotas += valorCuota / factorInflacion;
  }

  // Ahorro real: si las cuotas valen menos en términos reales
  const ahorroReal = contado - valorPresenteCuotas;
  const convieneCuotas = ahorroReal > 0
    ? `Cuotas — ahorrás $${Math.round(ahorroReal).toLocaleString()} en valor real`
    : ahorroReal < 0
      ? `Contado — ahorrás $${Math.round(Math.abs(ahorroReal)).toLocaleString()}`
      : 'Indiferente';

  const formula = `CFT = ($${cuotasTotal.toLocaleString()} - $${contado.toLocaleString()}) / $${contado.toLocaleString()} = ${cftPorcentaje.toFixed(2)}%`;
  const explicacion = `Contado: $${contado.toLocaleString()}. Cuotas: ${cuotas} × $${Math.round(valorCuota).toLocaleString()} = $${cuotasTotal.toLocaleString()}. Costo financiero: $${Math.round(costoFinanciero).toLocaleString()} (${cftPorcentaje.toFixed(2)}%, TNA equiv. ${tnaEquivalente.toFixed(1)}%).${inflaMensual > 0 ? ` Con inflación de ${inflaMensual}% mensual, el valor real de las cuotas es $${Math.round(valorPresenteCuotas).toLocaleString()}.` : ''} ${convieneCuotas}.`;

  return {
    costoFinanciero: Math.round(costoFinanciero),
    cftPorcentaje: Number(cftPorcentaje.toFixed(2)),
    tnaEquivalente: Number(tnaEquivalente.toFixed(2)),
    valorPresenteCuotas: Math.round(valorPresenteCuotas),
    ahorroReal: Math.round(ahorroReal),
    convieneCuotas,
    formula,
    explicacion,
  };
}
