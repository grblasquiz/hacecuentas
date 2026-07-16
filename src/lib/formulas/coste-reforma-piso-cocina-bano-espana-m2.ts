/** Coste de una reforma (piso, cocina o baño) por m² — España.
 *  Estimador orientativo de precios de mercado (NO es una tarifa oficial): el coste real
 *  depende de calidades, comunidad autónoma, estado de la vivienda y mano de obra.
 *  Rangos de referencia 2026 (materiales + mano de obra, IVA aparte cuando proceda):
 *    - Reforma integral de piso: básica ~450 €/m², media ~700 €/m², alta ~1.000 €/m².
 *    - Reforma de cocina: 6.000–15.000 € (media ~9.000 €).
 *    - Reforma de baño: 3.500–8.000 € (media ~5.500 €).
 *  Fuente: elaboración a partir de índices de precios del sector (INE) y precios medios
 *  de mercado; cifras referenciales, pedí siempre presupuesto cerrado. */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 })
    .format(Math.round(n)) + ' €';

// Precios de mercado por m² para reforma integral de piso (referencial 2026).
const PRECIO_M2: Record<string, number> = {
  basica: 450,
  media: 700,
  alta: 1000,
};
// Coste medio orientativo de reforma de una cocina y un baño (referencial 2026).
const COSTE_COCINA_MEDIO = 9000;
const COSTE_BANO_MEDIO = 5500;

export interface Inputs {
  metros: number;              // superficie a reformar (m²)
  nivelCalidad?: string;       // 'basica' | 'media' | 'alta'
  incluyeCocina?: string;      // 'si' | 'no'
  incluyeBano?: string;        // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const metros = Number(i.metros) || 0;
  const nivel = ['basica', 'media', 'alta'].includes(String(i.nivelCalidad)) ? String(i.nivelCalidad) : 'media';
  const conCocina = String(i.incluyeCocina || 'no') === 'si';
  const conBano = String(i.incluyeBano || 'no') === 'si';
  if (metros <= 0) throw new Error('Introduce los metros cuadrados a reformar');

  const precioM2 = PRECIO_M2[nivel];
  const costeReformaGeneral = metros * precioM2;
  const costeCocina = conCocina ? COSTE_COCINA_MEDIO : 0;
  const costeBano = conBano ? COSTE_BANO_MEDIO : 0;
  const costeTotal = costeReformaGeneral + costeCocina + costeBano;
  const costeMedioM2 = metros > 0 ? costeTotal / metros : 0;

  const nivelTexto = nivel === 'basica' ? 'básica' : nivel === 'alta' ? 'alta' : 'media';

  const _insight = {
    title: 'Presupuesto estimado de tu reforma',
    text: `Reformar **${metros} m²** con calidad **${nivelTexto}** (${precioM2} €/m²) ronda los **${fmtEur(costeReformaGeneral)}**.${conCocina || conBano ? ` Sumando ${conCocina ? 'cocina' : ''}${conCocina && conBano ? ' y ' : ''}${conBano ? 'baño' : ''}, el total estimado es de **${fmtEur(costeTotal)}**` : ''}. Son cifras orientativas de mercado: pide siempre varios presupuestos cerrados antes de decidir.`,
    tone: 'neutral',
    icon: '🛠️',
  };
  const _chart = {
    type: 'bar',
    labels: (() => {
      const l = ['Reforma general'];
      if (conCocina) l.push('Cocina');
      if (conBano) l.push('Baño');
      return l;
    })(),
    values: (() => {
      const v = [Math.round(costeReformaGeneral)];
      if (conCocina) v.push(Math.round(costeCocina));
      if (conBano) v.push(Math.round(costeBano));
      return v;
    })(),
    prefix: '€ ',
    ariaLabel: `Reforma general ${fmtEur(costeReformaGeneral)}${conCocina ? `, cocina ${fmtEur(costeCocina)}` : ''}${conBano ? `, baño ${fmtEur(costeBano)}` : ''}.`,
  };

  return {
    costeTotal: fmtEur(costeTotal),
    costeReformaGeneral: fmtEur(costeReformaGeneral),
    costeCocina: fmtEur(costeCocina),
    costeBano: fmtEur(costeBano),
    costeMedioM2: fmtEur(costeMedioM2) + '/m²',
    detalle: `${metros} m² × ${precioM2} €/m² (${nivelTexto}) = ${fmtEur(costeReformaGeneral)}${conCocina ? ` + cocina ${fmtEur(costeCocina)}` : ''}${conBano ? ` + baño ${fmtEur(costeBano)}` : ''} = ${fmtEur(costeTotal)}. Referencial; pedí presupuesto.`,
    _insight,
    _chart,
  };
}
