/** Cuánto ahorrar por mes para llegar a una meta en X meses */

export interface Inputs {
  metaTotal: number;
  mesesPlazo: number;
  tasaMensual: number;
}

export interface Outputs {
  ahorroMensual: number;
  totalAportado: number;
  interesesGanados: number;
  detalle: string;
}

export function metaAhorroMensual(i: Inputs): Outputs {
  const meta = Number(i.metaTotal);
  const meses = Number(i.mesesPlazo);
  const tasaMensual = Number(i.tasaMensual);

  if (isNaN(meta) || meta <= 0) throw new Error('Ingresá la meta de ahorro');
  if (isNaN(meses) || meses < 1) throw new Error('El plazo debe ser al menos 1 mes');
  if (isNaN(tasaMensual) || tasaMensual < 0) throw new Error('La tasa mensual no puede ser negativa');

  const r = tasaMensual / 100;
  let ahorroMensual: number;

  if (r === 0) {
    ahorroMensual = meta / meses;
  } else {
    // A = VF × r / [(1+r)^n − 1]
    const factor = (Math.pow(1 + r, meses) - 1) / r;
    ahorroMensual = meta / factor;
  }

  const totalAportado = ahorroMensual * meses;
  const interesesGanados = meta - totalAportado;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Ahorrando $${fmt.format(ahorroMensual)}/mes durante ${meses} meses` +
    (r > 0 ? ` con rendimiento del ${tasaMensual}% mensual` : ' sin invertir') +
    `, llegás a $${fmt.format(meta)}. ` +
    `De tu bolsillo ponés $${fmt.format(totalAportado)}` +
    (interesesGanados > 0 ? ` y los intereses aportan $${fmt.format(interesesGanados)}.` : '.');

  return {
    ahorroMensual: Math.round(ahorroMensual),
    totalAportado: Math.round(totalAportado),
    interesesGanados: Math.round(Math.max(0, interesesGanados)),
    detalle,
  };
}
