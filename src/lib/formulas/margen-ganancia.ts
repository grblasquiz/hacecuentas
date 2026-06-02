/** Margen de ganancia: sobre costo vs sobre venta */
export interface Inputs { costo: number; precioVenta: number; __lang?: string; }
export interface Outputs {
  gananciaBruta: number;
  margenSobreCosto: number;
  margenSobreVenta: number;
  markup: number;
  _insight?: any;
}

export function margenGanancia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errCosto: 'Ingresá el costo',
      errVenta: 'Ingresá el precio de venta',
      insTitle: 'Costo vs venta: no es lo mismo',
    },
    en: {
      errCosto: 'Enter the cost',
      errVenta: 'Enter the selling price',
      insTitle: 'Markup vs margin: not the same',
    },
  } as const)[__lang];
  const costo = Number(i.costo);
  const venta = Number(i.precioVenta);
  if (!costo || costo <= 0) throw new Error(T.errCosto);
  if (!venta || venta <= 0) throw new Error(T.errVenta);
  const ganancia = venta - costo;
  const sobreCosto = (ganancia / costo) * 100;
  const sobreVenta = (ganancia / venta) * 100;
  const fmt = new Intl.NumberFormat(__lang === 'en' ? 'en-US' : 'es-AR', { maximumFractionDigits: 0 });
  const g = fmt.format(Math.round(ganancia));
  const mc = sobreCosto.toFixed(1);
  const mv = sobreVenta.toFixed(1);
  const tone = ganancia <= 0 ? 'warn' : sobreVenta < 15 ? 'warn' : 'good';
  const insText = __lang === 'en'
    ? (ganancia <= 0
        ? `You're selling **at or below cost**: $${g} gain. Raise the price or the business bleeds on every sale.`
        : `You earn **$${g}** per unit. That's a **${mc}% markup over cost**, but only a **${mv}% margin over the selling price** — the figure that actually fits your P&L. People mix these up and overstate profit; the margin (${mv}%) is always the smaller, honest one.`)
    : (ganancia <= 0
        ? `Estás vendiendo **al costo o por debajo**: $${g} de ganancia. Subí el precio o el negocio pierde en cada venta.`
        : `Ganás **$${g}** por unidad. Eso es un **markup del ${mc}% sobre el costo**, pero apenas un **margen del ${mv}% sobre la venta** — el número que de verdad entra en tu P&L. Mucha gente los confunde e infla la ganancia; el margen (${mv}%) es siempre el más chico y el honesto.`);
  const _insight = {
    title: T.insTitle,
    text: insText,
    tone,
    icon: '💰',
  };
  return {
    gananciaBruta: Math.round(ganancia),
    margenSobreCosto: Number(sobreCosto.toFixed(2)),
    margenSobreVenta: Number(sobreVenta.toFixed(2)),
    markup: Number(sobreCosto.toFixed(2)),
    _insight,
  };
}
