/** Calcula la autonomía en km con un tanque lleno de combustible */
export interface Inputs {
  capacidadTanque: number;
  consumoL100km: number;
  precioLitro?: number;
}
export interface Outputs {
  autonomiaKm: number;
  costoLlenarTanque: number;
  costoPorKm: number;
  detalle: string;
  _insight?: any;
}

export function autonomiaTanqueCombustible(i: Inputs): Outputs {
  const tanque = Number(i.capacidadTanque);
  const consumo = Number(i.consumoL100km);
  const precio = Number(i.precioLitro) || 0;

  if (!tanque || tanque < 10 || tanque > 200) throw new Error('La capacidad del tanque debe estar entre 10 y 200 litros');
  if (!consumo || consumo < 2 || consumo > 30) throw new Error('El consumo debe estar entre 2 y 30 L/100km');

  const autonomiaKm = (tanque / consumo) * 100;
  const costoLlenarTanque = precio > 0 ? tanque * precio : 0;
  const costoPorKm = costoLlenarTanque > 0 ? costoLlenarTanque / autonomiaKm : 0;

  let detalleStr = `Con un tanque de ${tanque}L y consumo de ${consumo} L/100km, tu autonomía es de ${Math.round(autonomiaKm)} km.`;
  if (costoLlenarTanque > 0) {
    detalleStr += ` Llenar el tanque cuesta $${Math.round(costoLlenarTanque).toLocaleString('es-AR')}. Costo por km: $${Math.round(costoPorKm)}.`;
  }

  let insightText = `Con el tanque lleno (**${tanque} L**) y un consumo de **${consumo} L/100km** recorrés unos **${Math.round(autonomiaKm).toLocaleString('es-AR')} km** antes de volver a cargar.`;
  if (costoLlenarTanque > 0) {
    insightText += ` Cada llenado cuesta **$${Math.round(costoLlenarTanque).toLocaleString('es-AR')}** y te sale **$${Math.round(costoPorKm).toLocaleString('es-AR')} por km**.`;
  }
  const _insight = {
    title: 'Tu autonomía por tanque',
    text: insightText,
    tone: 'neutral',
    icon: '⛽',
  };

  return {
    autonomiaKm: Math.round(autonomiaKm),
    costoLlenarTanque: Math.round(costoLlenarTanque),
    costoPorKm: Math.round(costoPorKm),
    detalle: detalleStr,
    _insight,
  };
}
