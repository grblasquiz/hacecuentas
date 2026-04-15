/** Área, perímetro y sector de un círculo */
export interface Inputs { radio: number; angulo?: number; }
export interface Outputs {
  area: number;
  perimetro: number;
  areaDelSector: number;
  longitudArco: number;
  detalle: string;
}

export function areaCirculoSector(i: Inputs): Outputs {
  const r = Number(i.radio);
  const ang = Number(i.angulo) || 360;
  if (!r || r <= 0) throw new Error('Ingresá un radio válido');
  if (ang <= 0 || ang > 360) throw new Error('El ángulo debe estar entre 0 y 360 grados');

  const areaTotal = Math.PI * r * r;
  const perimetroTotal = 2 * Math.PI * r;
  const fraccion = ang / 360;
  const areaSector = areaTotal * fraccion;
  const arco = perimetroTotal * fraccion;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    area: Number(areaTotal.toFixed(4)),
    perimetro: Number(perimetroTotal.toFixed(4)),
    areaDelSector: Number(areaSector.toFixed(4)),
    longitudArco: Number(arco.toFixed(4)),
    detalle: `Radio = ${fmt.format(r)}. Área total = ${fmt.format(areaTotal)}. Perímetro = ${fmt.format(perimetroTotal)}. Sector de ${fmt.format(ang)}°: área = ${fmt.format(areaSector)}, arco = ${fmt.format(arco)}.`,
  };
}
