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

  return {
    ahorroTotal: Math.round(ahorroTotal),
    cuotaConBeca: Math.round(cuotaConBeca),
    ahorroMensual: Math.round(descuento),
    detalle: `Beca del ${porcentaje}%: pagás $${cuotaConBeca.toLocaleString('es-AR')}/mes en vez de $${cuota.toLocaleString('es-AR')}. Ahorro total en ${meses} meses: $${ahorroTotal.toLocaleString('es-AR')}`,
  };
}
