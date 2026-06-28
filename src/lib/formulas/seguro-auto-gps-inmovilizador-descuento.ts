/** Descuento prima seguro auto por GPS/inmovilizador en Argentina */
export interface Inputs { primaMensualSinDescuento: number; tieneGps: boolean; tieneInmovilizador: boolean; companiaDescuentoPct: number; costoInstalacionEquipo: number; }
export interface Outputs { descuentoPct: number; ahorroMensual: number; primaConDescuento: number; ahorroAnual: number; mesesRetornoEquipo: number; explicacion: string; _insight?: any; _chart?: any; }
export function seguroAutoGpsInmovilizadorDescuento(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).tieneGps = (i as any).tieneGps === true || (i as any).tieneGps === 'true';
  (i as any).tieneInmovilizador = (i as any).tieneInmovilizador === true || (i as any).tieneInmovilizador === 'true';
  const prima = Number(i.primaMensualSinDescuento);
  const gps = Boolean(i.tieneGps);
  const inmo = Boolean(i.tieneInmovilizador);
  const compDesc = Number(i.companiaDescuentoPct) || 0;
  const costoEquipo = Number(i.costoInstalacionEquipo) || 0;
  if (!prima || prima <= 0) throw new Error('Ingresá la prima mensual');
  let descuento = 0;
  if (gps) descuento += compDesc > 0 ? compDesc * 0.6 : 15;
  if (inmo) descuento += compDesc > 0 ? compDesc * 0.4 : 8;
  if (compDesc > 0 && (gps || inmo)) descuento = Math.min(descuento, compDesc);
  descuento = Math.min(descuento, 30);
  const ahorroMes = prima * (descuento / 100);
  const primaFinal = prima - ahorroMes;
  const ahorroAnio = ahorroMes * 12;
  const meses = ahorroMes > 0 ? costoEquipo / ahorroMes : 0;

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  let _insight: any;
  if (descuento <= 0) {
    _insight = {
      title: 'Sin descuento aplicable',
      text: `No marcaste GPS ni inmovilizador, así que no hay descuento sobre la prima de **$${fmt(prima)}/mes**. Activar uno de estos dispositivos suele recortar la prima entre un **8% y un 15%**.`,
      tone: 'warn',
      icon: '📡',
    };
  } else if (costoEquipo > 0 && meses > 24) {
    _insight = {
      title: 'Repago lento del equipo',
      text: `El descuento del **${descuento.toFixed(0)}%** te ahorra **$${fmt(ahorroMes)}/mes**, pero el equipo de $${fmt(costoEquipo)} recién se paga solo en **${meses.toFixed(1)} meses** (más de 2 años). Conviene si pensás conservar el auto y la póliza ese tiempo.`,
      tone: 'warn',
      icon: '⏳',
    };
  } else {
    _insight = {
      title: 'Descuento que conviene',
      text: `El **${descuento.toFixed(0)}%** de descuento baja tu prima a **$${fmt(primaFinal)}/mes** y te ahorra **$${fmt(ahorroAnio)}/año**.${costoEquipo > 0 ? ` El equipo se amortiza en solo **${meses.toFixed(1)} meses**.` : ' Sin costo de equipo declarado, el ahorro es neto desde el primer mes.'}`,
      tone: 'good',
      icon: '🛡️',
    };
  }

  const _chart = descuento > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Prima que seguís pagando', value: Math.round(primaFinal) },
      { label: 'Ahorro por dispositivo', value: Math.round(ahorroMes) },
    ],
    prefix: '$',
    centerValue: '$' + fmt(prima),
    centerLabel: 'Prima sin descuento',
    ariaLabel: `De una prima de $${fmt(prima)} mensuales, el descuento del ${descuento.toFixed(0)}% representa $${fmt(ahorroMes)} de ahorro y quedás pagando $${fmt(primaFinal)}.`,
  } : undefined;

  return {
    descuentoPct: Number(descuento.toFixed(2)),
    ahorroMensual: Number(ahorroMes.toFixed(2)),
    primaConDescuento: Number(primaFinal.toFixed(2)),
    ahorroAnual: Number(ahorroAnio.toFixed(2)),
    mesesRetornoEquipo: Number(meses.toFixed(1)),
    explicacion: `Con GPS/inmovilizador obtenés ${descuento.toFixed(0)}% de descuento. Ahorrás ${ahorroMes.toFixed(2)}/mes (${ahorroAnio.toFixed(2)}/año). El equipo se paga solo en ${meses.toFixed(1)} meses.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
