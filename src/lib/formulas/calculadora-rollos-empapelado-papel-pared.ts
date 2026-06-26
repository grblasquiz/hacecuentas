/** Rollos de empapelado (papel pintado) necesarios para una habitación.
 *  areaTotal     = perimetro × altoPared × (1 - descuentoAberturasPct/100)
 *  areaPorRollo  = anchoRollo × largoRollo
 *  rollos        = ceil(areaTotal / areaPorRollo)
 *  tirasPorRollo = floor(largoRollo / altoPared)   (cuántas tiras a lo alto salen de un rollo)
 * Medidas default = rollo europeo estándar de papel pintado: 0,53 m de ancho × 10 m de largo.
 * El descuento por aberturas default 10% compensa puertas y ventanas.
 * Para papeles CON patrón hay que sumar ~5-10% extra por la repetición (se aclara en la doc).
 */
export interface Inputs {
  perimetro: number;
  altoPared?: number;
  anchoRollo?: number;
  largoRollo?: number;
  descuentoAberturasPct?: number;
  __lang?: string;
}
export interface Outputs {
  rollos: number;
  areaTotal: number;
  tirasPorRollo: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function rollosEmpapelado(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorPerim: 'Ingresá el perímetro de las paredes a empapelar (mayor a cero)',
      errorAlto: 'El alto de la pared debe ser mayor a cero',
      errorRollo: 'Las medidas del rollo deben ser mayores a cero',
      insightTitle: 'Cuántos rollos comprar',
      chartAria: 'Área a empapelar comparada con el área que cubre cada rollo.',
      areaPared: 'Área a empapelar',
      cubierto: 'Cubierto por los rollos',
      rollos: 'rollos',
    },
    en: {
      errorPerim: 'Enter the perimeter of the walls to paper (greater than zero)',
      errorAlto: 'Wall height must be greater than zero',
      errorRollo: 'Roll dimensions must be greater than zero',
      insightTitle: 'How many rolls to buy',
      chartAria: 'Area to paper compared with the area each roll covers.',
      areaPared: 'Area to paper',
      cubierto: 'Covered by the rolls',
      rollos: 'rolls',
    },
  } as const)[__lang];

  const perimetro = Number(i.perimetro);
  const altoPared = i.altoPared == null ? 2.6 : Number(i.altoPared);
  const anchoRollo = i.anchoRollo == null ? 0.53 : Number(i.anchoRollo);
  const largoRollo = i.largoRollo == null ? 10 : Number(i.largoRollo);
  const descuento = i.descuentoAberturasPct == null ? 10 : Number(i.descuentoAberturasPct);

  if (!perimetro || perimetro <= 0) throw new Error(T.errorPerim);
  if (!altoPared || altoPared <= 0) throw new Error(T.errorAlto);
  if (!anchoRollo || !largoRollo || anchoRollo <= 0 || largoRollo <= 0) throw new Error(T.errorRollo);

  const areaTotal = perimetro * altoPared * (1 - descuento / 100);
  const areaPorRollo = anchoRollo * largoRollo;
  const rollos = Math.ceil(areaTotal / areaPorRollo);
  const tirasPorRollo = Math.floor(largoRollo / altoPared);

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.areaPared, value: Math.round(areaTotal * 10) / 10 },
      { label: T.cubierto, value: Math.round((rollos * areaPorRollo - areaTotal) * 10) / 10 },
    ],
    suffix: ' m²',
    centerValue: rollos + ' ' + T.rollos,
    centerLabel: T.insightTitle,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `You need to paper about **${areaTotal.toFixed(1)} m²** and each roll covers **${areaPorRollo.toFixed(1)} m²**, so buy **${rollos} ${T.rollos}**. Each roll yields **${tirasPorRollo}** full-height strips. If the paper has a pattern, add 5-10% extra for matching.`
      : `Tenés que empapelar unos **${areaTotal.toFixed(1)} m²** y cada rollo cubre **${areaPorRollo.toFixed(1)} m²**, así que comprá **${rollos} ${T.rollos}**. De cada rollo salen **${tirasPorRollo}** tiras enteras a lo alto. Si el papel tiene patrón, sumá 5-10% extra por la repetición.`,
    tone: 'neutral' as const,
    icon: '🧱',
  };

  return {
    rollos,
    areaTotal: Math.round(areaTotal * 100) / 100,
    tirasPorRollo,
    formula: `ceil((${perimetro} m × ${altoPared} m × ${(1 - descuento / 100).toFixed(2)}) / (${anchoRollo} × ${largoRollo})) = ceil(${areaTotal.toFixed(2)} / ${areaPorRollo.toFixed(2)}) = ${rollos}`,
    _chart: chart,
    _insight: insight,
  };
}
