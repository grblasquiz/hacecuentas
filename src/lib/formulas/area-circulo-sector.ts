/** Área, perímetro y sector de un círculo */
export interface Inputs { radio: number; angulo?: number; __lang?: string; }
export interface Outputs {
  area: number;
  perimetro: number;
  areaDelSector: number;
  longitudArco: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
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

  const esSectorParcial = ang < 360;
  const resto = areaTotal - areaSector;
  const _insight = {
    title: __lang==='en' ? 'Circle and sector' : 'Círculo y sector',
    text: esSectorParcial
      ? (__lang==='en'
        ? `A circle of radius **${fmt.format(r)}** has area **${fmt.format(areaTotal)}**. The **${fmt.format(ang)}°** sector covers **${fmt.format(areaSector)}** — that is **${fmt.format(fraccion*100)}%** of the disc, with a **${fmt.format(arco)}** arc.`
        : `Un círculo de radio **${fmt.format(r)}** tiene área **${fmt.format(areaTotal)}**. El sector de **${fmt.format(ang)}°** abarca **${fmt.format(areaSector)}**, o sea el **${fmt.format(fraccion*100)}%** del disco, con un arco de **${fmt.format(arco)}**.`)
      : (__lang==='en'
        ? `Full circle of radius **${fmt.format(r)}**: area **${fmt.format(areaTotal)}** and perimeter **${fmt.format(perimetroTotal)}**.`
        : `Círculo completo de radio **${fmt.format(r)}**: área **${fmt.format(areaTotal)}** y perímetro **${fmt.format(perimetroTotal)}**.`),
    tone: 'neutral',
    icon: '⭕',
  };
  const _chart = esSectorParcial ? {
    type: 'doughnut',
    slices: [
      { label: __lang==='en' ? `Sector (${fmt.format(ang)}°)` : `Sector (${fmt.format(ang)}°)`, value: Number(areaSector.toFixed(2)) },
      { label: __lang==='en' ? 'Rest of circle' : 'Resto del círculo', value: Number(resto.toFixed(2)) },
    ],
    centerValue: fmt.format(areaTotal),
    centerLabel: __lang==='en' ? 'Total area' : 'Área total',
    ariaLabel: __lang==='en'
      ? `Total area ${fmt.format(areaTotal)} split into the ${fmt.format(ang)}° sector ${fmt.format(areaSector)} and the rest ${fmt.format(resto)}.`
      : `Área total ${fmt.format(areaTotal)} dividida en el sector de ${fmt.format(ang)}° con ${fmt.format(areaSector)} y el resto con ${fmt.format(resto)}.`,
  } : undefined;
  return {
    area: Number(areaTotal.toFixed(4)),
    perimetro: Number(perimetroTotal.toFixed(4)),
    areaDelSector: Number(areaSector.toFixed(4)),
    longitudArco: Number(arco.toFixed(4)),
    detalle: __lang === 'en'
      ? `Radius = ${fmt.format(r)}. Total area = ${fmt.format(areaTotal)}. Perimeter = ${fmt.format(perimetroTotal)}. Sector of ${fmt.format(ang)}°: area = ${fmt.format(areaSector)}, arc = ${fmt.format(arco)}.`
      : `Radio = ${fmt.format(r)}. Área total = ${fmt.format(areaTotal)}. Perímetro = ${fmt.format(perimetroTotal)}. Sector de ${fmt.format(ang)}°: área = ${fmt.format(areaSector)}, arco = ${fmt.format(arco)}.`,
    _insight,
    ...(_chart?{_chart}:{}),
  };
}
