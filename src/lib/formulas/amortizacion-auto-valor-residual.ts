/** Calcula la depreciación y valor residual de un vehículo (modelo exponencial) */
export interface Inputs {
  precioCompra: number;
  anosProyeccion: number;
  tasaDepreciacion: number;
}
export interface Outputs {
  valorResidual: number;
  perdidaTotal: number;
  porcentajeRetenido: number;
  depreciacionAnualProm: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function amortizacionAutoValorResidual(i: Inputs): Outputs {
  const precio = Number(i.precioCompra);
  const anos = Number(i.anosProyeccion);
  const tasa = Number(i.tasaDepreciacion);

  if (!precio || precio <= 0) throw new Error('Ingresá el precio de compra del vehículo');
  if (!anos || anos < 1 || anos > 20) throw new Error('Los años a proyectar deben estar entre 1 y 20');
  if (!tasa || tasa < 5 || tasa > 40) throw new Error('La tasa de depreciación debe estar entre 5% y 40%');

  const factor = 1 - tasa / 100;
  const valorResidual = precio * Math.pow(factor, anos);
  const perdidaTotal = precio - valorResidual;
  const porcentajeRetenido = (valorResidual / precio) * 100;
  const depreciacionAnualProm = perdidaTotal / anos;

  const ret = Number(porcentajeRetenido.toFixed(1));
  const tone = ret >= 60 ? 'good' : ret < 40 ? 'warn' : 'neutral';
  return {
    valorResidual: Math.round(valorResidual),
    perdidaTotal: Math.round(perdidaTotal),
    porcentajeRetenido: ret,
    depreciacionAnualProm: Math.round(depreciacionAnualProm),
    detalle: `Después de ${anos} año(s), el auto valdría ~$${Math.round(valorResidual).toLocaleString('es-AR')} (retiene ${porcentajeRetenido.toFixed(1)}% del valor). Pérdida total: $${Math.round(perdidaTotal).toLocaleString('es-AR')}. Depreciación promedio: $${Math.round(depreciacionAnualProm).toLocaleString('es-AR')}/año.`,
    _insight: {
      title: ret < 40 ? 'Depreciación fuerte' : ret >= 60 ? 'Buena retención de valor' : 'Cuánto valor pierde tu auto',
      text: `En ${anos} año(s) el auto conserva el **${ret.toFixed(1)}%** de su precio (~$${Math.round(valorResidual).toLocaleString('es-AR')}) y pierde **$${Math.round(perdidaTotal).toLocaleString('es-AR')}**, unos $${Math.round(depreciacionAnualProm).toLocaleString('es-AR')} por año.${ret < 40 ? ' Más de la mitad del valor se evapora: vender antes o elegir modelos que deprecian menos hace una gran diferencia.' : ret >= 60 ? ' Retiene buena parte de su valor, señal de un modelo con reventa sólida.' : ''}`,
      tone,
      icon: '🚗',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Valor residual', value: Math.round(valorResidual) },
        { label: 'Pérdida por depreciación', value: Math.round(perdidaTotal) },
      ],
      prefix: '$',
      centerValue: '$' + Math.round(precio).toLocaleString('es-AR'),
      centerLabel: 'Precio de compra',
      ariaLabel: `De $${Math.round(precio).toLocaleString('es-AR')} de compra, quedan $${Math.round(valorResidual).toLocaleString('es-AR')} de valor residual y se pierden $${Math.round(perdidaTotal).toLocaleString('es-AR')} por depreciación.`,
    },
  };
}
