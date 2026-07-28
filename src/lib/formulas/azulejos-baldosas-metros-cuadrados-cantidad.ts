export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function azulejosBaldosasMetrosCuadradosCantidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Inputs
  const area = Number(i.area_m2) || 0;          // m² to cover
  const m2PorCaja = Number(i.m2_por_caja) || 1; // m² coverage per box
  const desperdicioPct = (Number.isFinite(Number(i.desperdicio_pct)) ? Number(i.desperdicio_pct) : 10); // waste %

  // Real formula: Boxes = ceil( area × (1 + waste/100) / m2_per_box )
  const factorDesperdicio = 1 + desperdicioPct / 100;
  const areaConDesperdicio = area * factorDesperdicio;
  const cajasExactas = areaConDesperdicio / m2PorCaja;
  const cajasTotal = Math.ceil(cajasExactas);
  const m2Total = cajasTotal * m2PorCaja;
  const m2Sobrante = m2Total - areaConDesperdicio;

  const resultado = cajasTotal.toString();

  const resumen = __lang === 'en'
    ? `You need **${cajasTotal} boxes** (covers ${m2Total.toFixed(2)} m²). Waste included: ${desperdicioPct}% → ${(area * desperdicioPct / 100).toFixed(2)} m² buffer. Surplus after purchase: ${m2Sobrante.toFixed(2)} m².`
    : `Necesitás **${cajasTotal} cajas** (cubren ${m2Total.toFixed(2)} m²). Desperdicio incluido: ${desperdicioPct}% → ${(area * desperdicioPct / 100).toFixed(2)} m² de margen. Sobrante tras la compra: ${m2Sobrante.toFixed(2)} m².`;

  const _insight = __lang === 'en'
    ? {
        title: 'Buy from the same lot',
        text: `**${cajasTotal} boxes** cover your ${area} m² plus ${desperdicioPct}% waste. Always buy all boxes from the **same production lot** — tiles can vary in shade between batches. Keep 1 spare box for future repairs (discontinued models are hard to find).`,
        tone: 'neutral',
        icon: '🧱',
      }
    : {
        title: 'Comprá todo del mismo lote',
        text: `**${cajasTotal} cajas** cubren tus ${area} m² más el ${desperdicioPct}% de desperdicio. Siempre comprá todas del **mismo lote de producción** — distintos lotes tienen variaciones de tono. Guardá 1 caja de repuesto para roturas futuras (los modelos se discontinúan rápido).`,
        tone: 'neutral',
        icon: '🧱',
      };

  return { resultado, resumen, _insight };
}
