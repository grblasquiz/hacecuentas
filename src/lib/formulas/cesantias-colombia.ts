/**
 * Calculadora de Cesantias Colombia 2026
 * Formula: Cesantias = (salario + aux transporte) x dias trabajados / 360
 * Intereses sobre cesantias = Cesantias x dias trabajados x 12% / 360
 * Fuente: Codigo Sustantivo del Trabajo, Ley 50 de 1990
 */

export interface CesantiasColombiaInputs {
  salarioMensual: number;
  diasTrabajados: number;
  incluyeAuxTransporte: boolean;
  auxTransporte: number;
}

export interface CesantiasColombiaOutputs {
  cesantias: number;
  interesesCesantias: number;
  total: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function cesantiasColombia(inputs: CesantiasColombiaInputs): CesantiasColombiaOutputs {
  const salario = Number(inputs.salarioMensual);
  const diasTrabajados = Math.min(360, Math.max(1, Number(inputs.diasTrabajados) || 360));
  const incluyeAux = inputs.incluyeAuxTransporte === true || inputs.incluyeAuxTransporte === 'true' as any;
  const auxTransporte = incluyeAux ? (Number(inputs.auxTransporte) || 200_000) : 0;

  if (!salario || salario <= 0) {
    throw new Error('Ingresa tu salario mensual');
  }

  // Base de liquidacion = salario + auxilio de transporte
  const baseLiquidacion = salario + auxTransporte;

  // Cesantias = base x dias trabajados / 360
  const cesantias = (baseLiquidacion * diasTrabajados) / 360;

  // Intereses sobre cesantias = cesantias x dias trabajados x 12% / 360
  const interesesCesantias = (cesantias * diasTrabajados * 0.12) / 360;

  const total = cesantias + interesesCesantias;

  const proporcional = diasTrabajados < 360 ? ` (proporcional ${diasTrabajados}/360 días)` : '';

  const formula = `Cesantías = ($${salario.toLocaleString('es-CO')}${auxTransporte > 0 ? ` + $${auxTransporte.toLocaleString('es-CO')}` : ''}) × ${diasTrabajados} / 360 = $${Math.round(cesantias).toLocaleString('es-CO')} | Intereses = $${Math.round(cesantias).toLocaleString('es-CO')} × ${diasTrabajados} × 12% / 360 = $${Math.round(interesesCesantias).toLocaleString('es-CO')}`;

  const explicacion = `Con un salario de $${salario.toLocaleString('es-CO')} COP${auxTransporte > 0 ? ` y auxilio de transporte de $${auxTransporte.toLocaleString('es-CO')}` : ''}${proporcional}, tus cesantías son $${Math.round(cesantias).toLocaleString('es-CO')}. Los intereses sobre cesantías (12% anual proporcional) son $${Math.round(interesesCesantias).toLocaleString('es-CO')}. El total a recibir es $${Math.round(total).toLocaleString('es-CO')} COP. El empleador debe consignar las cesantías al fondo antes del 14 de febrero y pagar los intereses directamente al trabajador antes del 31 de enero.`;

  const interesPct = total > 0 ? (interesesCesantias / total) * 100 : 0;
  const insight = {
    title: 'Composición de tu liquidación',
    text: `De los **$${Math.round(total).toLocaleString('es-CO')} COP** totales, **$${Math.round(cesantias).toLocaleString('es-CO')}** son cesantías (van al fondo antes del 14 de febrero) y **$${Math.round(interesesCesantias).toLocaleString('es-CO')}** son los intereses del 12% (el **${interesPct.toFixed(1)}%** del total), que el empleador te paga directo antes del 31 de enero. Si no te consignan a tiempo, el empleador debe **un día de salario por cada día de mora**.`,
    tone: 'neutral' as const,
    icon: '💰',
  };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cesantías', value: Math.round(cesantias) },
      { label: 'Intereses (12%)', value: Math.round(interesesCesantias) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-CO'),
    centerLabel: 'Total',
    ariaLabel: 'Composición: cesantías más intereses sobre cesantías',
  };

  return {
    cesantias: Math.round(cesantias),
    interesesCesantias: Math.round(interesesCesantias),
    total: Math.round(total),
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
