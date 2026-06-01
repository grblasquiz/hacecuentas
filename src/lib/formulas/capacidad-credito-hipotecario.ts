/** Capacidad de crédito hipotecario */
export interface Inputs {
  ingresoNeto: number;
  tasaAnual: number;
  plazoAnios: number;
  porcentajeIngreso?: number;
}
export interface Outputs {
  montoMaximo: number;
  cuotaMaxima: number;
  valorPropiedadEstimado: number;
  _insight?: any;
  _chart?: any;
}

export function capacidadCreditoHipotecario(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoNeto);
  const tasaAnual = Number(i.tasaAnual);
  const plazo = Number(i.plazoAnios);
  const pctIngreso = Number(i.porcentajeIngreso) || 25;

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso neto mensual');
  if (tasaAnual < 0) throw new Error('La tasa no puede ser negativa');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo en años');

  const cuotaMaxima = ingreso * (pctIngreso / 100);
  const tasaMensual = tasaAnual / 100 / 12;
  const meses = plazo * 12;

  let montoMaximo: number;
  if (tasaMensual > 0) {
    montoMaximo = cuotaMaxima * (1 - Math.pow(1 + tasaMensual, -meses)) / tasaMensual;
  } else {
    montoMaximo = cuotaMaxima * meses;
  }

  // Propiedad estimada: crédito cubre el 75% (25% pie)
  const valorPropiedadEstimado = montoMaximo / 0.75;

  const montoR = Math.round(montoMaximo);
  const cuotaR = Math.round(cuotaMaxima);
  const valorR = Math.round(valorPropiedadEstimado);
  const pieR = valorR - montoR;
  const fmt = (n: number) => '$' + new Intl.NumberFormat('es-AR').format(n);

  const _insight = {
    title: 'Cuánto podés pedir',
    text: `Comprometiendo el **${pctIngreso}%** de tu ingreso (**${fmt(cuotaR)}**/mes de cuota), el banco te presta hasta **${fmt(montoR)}** a ${plazo} años. Con un pie del 25% (**${fmt(pieR)}**) llegás a una propiedad de **${fmt(valorR)}**.`,
    tone: 'neutral',
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Crédito hipotecario', value: montoR },
      { label: 'Pie / anticipo (25%)', value: pieR },
    ],
    prefix: '$',
    centerValue: fmt(valorR),
    centerLabel: 'Propiedad',
    ariaLabel: `Propiedad de ${fmt(valorR)}: crédito de ${fmt(montoR)} más pie de ${fmt(pieR)}.`,
  };

  return {
    montoMaximo: montoR,
    cuotaMaxima: cuotaR,
    valorPropiedadEstimado: valorR,
    _insight,
    _chart,
  };
}
