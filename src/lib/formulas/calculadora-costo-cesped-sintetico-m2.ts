/** Costo de instalar césped sintético por m².
 * Geometría + precios que ingresa el usuario (no hay datos de mercado hardcodeados).
 *  superficie        = largo × ancho
 *  m2ConDesperdicio  = superficie × (1 + desperdicioPct/100)   (cortes y recortes)
 *  costoMaterial     = m2ConDesperdicio × precioM2
 *  costoManoObra     = superficie × manoObraM2                  (sobre superficie real)
 *  costoTotal        = costoMaterial + costoManoObra
 * El desperdicio default 10% es un valor de referencia habitual en instalación de
 * césped sintético (los rollos vienen en anchos fijos y siempre sobra al cortar).
 */
export interface Inputs {
  largo: number;
  ancho: number;
  precioM2: number;
  desperdicioPct?: number;
  manoObraM2?: number;
  __lang?: string;
}
export interface Outputs {
  costoTotal: number;
  m2ConDesperdicio: number;
  costoMaterial: number;
  costoManoObra: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function costoCespedSintetico(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorDims: 'Ingresá largo y ancho mayores a cero',
      errorPrecio: 'Ingresá el precio por m² del césped',
      insightTitle: 'Desglose del costo',
      material: 'Material',
      manoObra: 'Mano de obra',
      total: 'Total',
      chartAria: 'Composición del costo total entre material y mano de obra.',
    },
    en: {
      errorDims: 'Enter length and width greater than zero',
      errorPrecio: 'Enter the price per m² of the turf',
      insightTitle: 'Cost breakdown',
      material: 'Material',
      manoObra: 'Labour',
      total: 'Total',
      chartAria: 'Total cost breakdown between material and labour.',
    },
  } as const)[__lang];

  const largo = Number(i.largo);
  const ancho = Number(i.ancho);
  const precioM2 = Number(i.precioM2);
  const desperdicioPct = i.desperdicioPct == null ? 10 : Number(i.desperdicioPct);
  const manoObraM2 = i.manoObraM2 == null ? 0 : Number(i.manoObraM2);

  if (!largo || !ancho || largo <= 0 || ancho <= 0) throw new Error(T.errorDims);
  if (!precioM2 || precioM2 <= 0) throw new Error(T.errorPrecio);

  const superficie = largo * ancho;
  const m2ConDesperdicio = superficie * (1 + desperdicioPct / 100);
  const costoMaterial = m2ConDesperdicio * precioM2;
  const costoManoObra = superficie * manoObraM2;
  const costoTotal = costoMaterial + costoManoObra;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const slices = [{ label: T.material, value: Math.round(costoMaterial) }];
  if (costoManoObra > 0) slices.push({ label: T.manoObra, value: Math.round(costoManoObra) });
  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + Math.round(costoTotal).toLocaleString(locale),
    centerLabel: T.total,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `For **${superficie.toFixed(1)} m²** you should buy **${m2ConDesperdicio.toFixed(1)} m²** of turf (incl. ${desperdicioPct}% waste). Material: **$${Math.round(costoMaterial).toLocaleString(locale)}**${costoManoObra > 0 ? `, labour: **$${Math.round(costoManoObra).toLocaleString(locale)}**` : ''}. Total: **$${Math.round(costoTotal).toLocaleString(locale)}**.`
      : `Para **${superficie.toFixed(1)} m²** tenés que comprar **${m2ConDesperdicio.toFixed(1)} m²** de césped (incluye ${desperdicioPct}% de desperdicio). Material: **$${Math.round(costoMaterial).toLocaleString(locale)}**${costoManoObra > 0 ? `, mano de obra: **$${Math.round(costoManoObra).toLocaleString(locale)}**` : ''}. Total: **$${Math.round(costoTotal).toLocaleString(locale)}**.`,
    tone: 'neutral' as const,
    icon: '🌿',
  };

  return {
    costoTotal: Math.round(costoTotal),
    m2ConDesperdicio: Math.round(m2ConDesperdicio * 100) / 100,
    costoMaterial: Math.round(costoMaterial),
    costoManoObra: Math.round(costoManoObra),
    formula: `(${superficie.toFixed(2)} m² × ${(1 + desperdicioPct / 100).toFixed(2)} × $${precioM2}) + (${superficie.toFixed(2)} m² × $${manoObraM2}) = $${Math.round(costoTotal)}`,
    _chart: chart,
    _insight: insight,
  };
}
