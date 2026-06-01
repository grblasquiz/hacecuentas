/** Área, perímetro y sector de un círculo */
export interface Inputs { radio: number; angulo?: number; __lang?: string; }
export interface Outputs {
  area: number;
  perimetro: number;
  areaDelSector: number;
  longitudArco: number;
  detalle: string;
}

export function areaCirculoSector(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const r = Number(i.radio);
  const ang = Number(i.angulo) || 360;
  if (!r || r <= 0) throw new Error(__lang === 'en' ? 'Enter a valid radius' : 'Ingresá un radio válido');
  if (ang <= 0 || ang > 360) throw new Error(__lang === 'en' ? 'Angle must be between 0 and 360 degrees' : 'El ángulo debe estar entre 0 y 360 grados');

  const areaTotal = Math.PI * r * r;
  const perimetroTotal = 2 * Math.PI * r;
  const fraccion = ang / 360;
  const areaSector = areaTotal * fraccion;
  const arco = perimetroTotal * fraccion;

  const fmt = new Intl.NumberFormat(__lang === 'en' ? 'en-US' : 'es-AR', { maximumFractionDigits: 2 });

  return {
    area: Number(areaTotal.toFixed(4)),
    perimetro: Number(perimetroTotal.toFixed(4)),
    areaDelSector: Number(areaSector.toFixed(4)),
    longitudArco: Number(arco.toFixed(4)),
    detalle: __lang === 'en'
      ? `Radius = ${fmt.format(r)}. Total area = ${fmt.format(areaTotal)}. Perimeter = ${fmt.format(perimetroTotal)}. Sector of ${fmt.format(ang)}°: area = ${fmt.format(areaSector)}, arc = ${fmt.format(arco)}.`
      : `Radio = ${fmt.format(r)}. Área total = ${fmt.format(areaTotal)}. Perímetro = ${fmt.format(perimetroTotal)}. Sector de ${fmt.format(ang)}°: área = ${fmt.format(areaSector)}, arco = ${fmt.format(arco)}.`,
  };
}
