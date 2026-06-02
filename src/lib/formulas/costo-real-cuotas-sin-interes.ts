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
  _insight?: any;
  _chart?: any;
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

  const cuotasGanan = ahorroReal > 0;
  const _insight = {
    title: cuotasGanan ? 'Pagá en cuotas' : 'Conviene el contado',
    text: cuotasGanan
      ? `Aunque las cuotas tienen un recargo nominal de **$${Math.round(costoFinanciero).toLocaleString('es-AR')}** (${cftPorcentaje.toFixed(1)}%), con una inflación de **${inflaMensual}% mensual** el valor real de pagar en ${cuotas} cuotas es **$${Math.round(valorPresenteCuotas).toLocaleString('es-AR')}** — menos que los $${contado.toLocaleString('es-AR')} de contado. Financiarte te ahorra **$${Math.round(ahorroReal).toLocaleString('es-AR')}** en plata de hoy.`
      : `Pagar en ${cuotas} cuotas suma **$${cuotasTotal.toLocaleString('es-AR')}** (recargo de $${Math.round(costoFinanciero).toLocaleString('es-AR')}, CFT ${cftPorcentaje.toFixed(1)}%). ${inflaMensual > 0 ? `Ni con la inflación de ${inflaMensual}% mensual` : 'Sin inflación que licúe la deuda,'} las cuotas compensan: pagando de contado ahorrás **$${Math.round(Math.abs(ahorroReal)).toLocaleString('es-AR')}** en valor real.`,
    tone: cuotasGanan ? 'good' : 'warn',
    icon: '💳',
  };

  let _chart: any = undefined;
  if (costoFinanciero > 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Precio de contado', value: Math.round(contado) },
        { label: 'Recargo financiero', value: Math.round(costoFinanciero) },
      ],
      prefix: '$',
      centerValue: `$${cuotasTotal.toLocaleString('es-AR')}`,
      centerLabel: 'Total en cuotas',
      ariaLabel: `El total en cuotas de $${cuotasTotal.toLocaleString('es-AR')} se compone del precio de contado más un recargo financiero de $${Math.round(costoFinanciero).toLocaleString('es-AR')} (${cftPorcentaje.toFixed(1)}%)`,
    };
  }

  return {
    costoFinanciero: Math.round(costoFinanciero),
    cftPorcentaje: Number(cftPorcentaje.toFixed(2)),
    tnaEquivalente: Number(tnaEquivalente.toFixed(2)),
    valorPresenteCuotas: Math.round(valorPresenteCuotas),
    ahorroReal: Math.round(ahorroReal),
    convieneCuotas,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
