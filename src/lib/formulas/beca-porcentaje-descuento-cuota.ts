/** Calculadora de ahorro por beca universitaria */

export interface Inputs {
  cuotaSinBeca: number;
  porcentajeBeca: number;
  mesesBeca: number;
}

export interface Outputs {
  ahorroTotal: number;
  cuotaConBeca: number;
  ahorroMensual: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function becaPorcentajeDescuentoCuota(i: Inputs): Outputs {
  const cuota = Number(i.cuotaSinBeca);
  const porcentaje = Number(i.porcentajeBeca);
  const meses = Number(i.mesesBeca);

  if (isNaN(cuota) || cuota <= 0) {
    throw new Error('Ingresá la cuota mensual sin beca');
  }
  if (isNaN(porcentaje) || porcentaje < 1 || porcentaje > 100) {
    throw new Error('El porcentaje de beca debe estar entre 1% y 100%');
  }
  if (isNaN(meses) || meses < 1) {
    throw new Error('La duración de la beca debe ser al menos 1 mes');
  }

  const descuento = cuota * (porcentaje / 100);
  const cuotaConBeca = cuota - descuento;
  const ahorroTotal = descuento * meses;

  const cuotaConBecaR = Math.round(cuotaConBeca);
  const ahorroMensualR = Math.round(descuento);
  const ahorroTotalR = Math.round(ahorroTotal);

  return {
    ahorroTotal: ahorroTotalR,
    cuotaConBeca: cuotaConBecaR,
    ahorroMensual: ahorroMensualR,
    detalle: `Beca del ${porcentaje}%: pagás $${cuotaConBeca.toLocaleString('es-AR')}/mes en vez de $${cuota.toLocaleString('es-AR')}. Ahorro total en ${meses} meses: $${ahorroTotal.toLocaleString('es-AR')}`,
    _insight: {
      title: 'Lo que te ahorra la beca',
      text: `Con la beca del **${porcentaje}%** pagás **$${cuotaConBecaR.toLocaleString('es-AR')}/mes** en lugar de $${Math.round(cuota).toLocaleString('es-AR')}, y al cabo de **${meses} ${meses === 1 ? 'mes' : 'meses'}** te ahorrás **$${ahorroTotalR.toLocaleString('es-AR')}** en total.`,
      tone: 'good',
      icon: '🎓',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Lo que pagás', value: cuotaConBecaR },
        { label: 'Cubre la beca', value: ahorroMensualR },
      ],
      prefix: '$',
      centerValue: '$' + Math.round(cuota).toLocaleString('es-AR'),
      centerLabel: 'Cuota mensual',
      ariaLabel: `De la cuota mensual de $${Math.round(cuota).toLocaleString('es-AR')}, pagás $${cuotaConBecaR.toLocaleString('es-AR')} y la beca cubre $${ahorroMensualR.toLocaleString('es-AR')}`,
    },
  };
}
