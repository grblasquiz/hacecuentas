/** Precio contado vs cuotas "sin interés" con inflación */

export interface Inputs {
  precioContado: number;
  precioCuotas: number;
  cantidadCuotas: number;
  inflacionMensual: number;
  rendimientoAlternativoMensual?: number;
}

export interface Outputs {
  costoFinanciero: number;
  cftPorcentaje: number;
  tnaEquivalente: number;
  teaImplicita: number;
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
  const rendimientoAlternativo = Number(i.rendimientoAlternativoMensual) || 0;

  if (!contado || contado <= 0) throw new Error('Ingresá el precio de contado');
  if (!cuotasTotal || cuotasTotal <= 0) throw new Error('Ingresá el precio total en cuotas');
  if (!cuotas || cuotas <= 0) throw new Error('Ingresá la cantidad de cuotas');

  const valorCuota = cuotasTotal / cuotas;
  const costoFinanciero = cuotasTotal - contado;
  const cftPorcentaje = (costoFinanciero / contado) * 100;
  // Tasa implícita: resuelve contado = suma(cuota / (1+r)^m) por búsqueda binaria.
  let low = 0;
  let high = 10;
  for (let k = 0; k < 100; k++) {
    const mid = (low + high) / 2;
    let vp = 0;
    for (let m = 1; m <= cuotas; m++) vp += valorCuota / Math.pow(1 + mid, m);
    if (vp > contado) low = mid;
    else high = mid;
  }
  const tasaImplicitaMensual = costoFinanciero > 0 ? (low + high) / 2 : 0;
  const tnaEquivalente = tasaImplicitaMensual * 12 * 100;
  const teaImplicita = (Math.pow(1 + tasaImplicitaMensual, 12) - 1) * 100;

  // Valor presente de las cuotas con inflación
  let valorPresenteCuotas = 0;
  const tasaDescuento = rendimientoAlternativo > 0 ? rendimientoAlternativo : inflaMensual;
  for (let m = 1; m <= cuotas; m++) {
    const factorInflacion = Math.pow(1 + tasaDescuento / 100, m);
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
  const explicacion = `Contado: $${contado.toLocaleString()}. Cuotas: ${cuotas} × $${Math.round(valorCuota).toLocaleString()} = $${cuotasTotal.toLocaleString()}. Costo financiero: $${Math.round(costoFinanciero).toLocaleString()} (${cftPorcentaje.toFixed(2)}%, TNA implícita ${tnaEquivalente.toFixed(1)}%, TEA ${teaImplicita.toFixed(1)}%).${tasaDescuento > 0 ? ` Con una tasa de descuento de ${tasaDescuento}% mensual, el valor presente de las cuotas es $${Math.round(valorPresenteCuotas).toLocaleString()}.` : ''} ${convieneCuotas}.`;

  const cuotasGanan = ahorroReal > 0;
  const _insight = {
    title: cuotasGanan ? 'Pagá en cuotas' : 'Conviene el contado',
    text: cuotasGanan
      ? `Aunque las cuotas tienen un recargo nominal de **$${Math.round(costoFinanciero).toLocaleString('es-AR')}** (${cftPorcentaje.toFixed(1)}%), con una tasa de descuento de **${tasaDescuento}% mensual** su valor presente es **$${Math.round(valorPresenteCuotas).toLocaleString('es-AR')}**. Financiarte conserva **$${Math.round(ahorroReal).toLocaleString('es-AR')}** de valor hoy.`
      : `Pagar en ${cuotas} cuotas suma **$${cuotasTotal.toLocaleString('es-AR')}** y equivale a una **TEA implícita de ${teaImplicita.toFixed(1)}%**. Con la tasa de descuento cargada no compensa: el contado ahorra **$${Math.round(Math.abs(ahorroReal)).toLocaleString('es-AR')}** en valor presente.`,
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
    teaImplicita: Number(teaImplicita.toFixed(2)),
    valorPresenteCuotas: Math.round(valorPresenteCuotas),
    ahorroReal: Math.round(ahorroReal),
    convieneCuotas,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
