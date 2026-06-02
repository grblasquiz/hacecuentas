/** Convertir precio en dólares a pesos argentinos */
export interface Inputs {
  precioUSD: number;
  tipoCambio: string;
  cotizacion: number;
  impuestoPct?: number;
}
export interface Outputs {
  precioFinalPesos: number;
  cotizacionEfectiva: number;
  impuestosMonto: number;
  _insight?: any;
  _chart?: any;
}

export function precioDolarProducto(i: Inputs): Outputs {
  const usd = Number(i.precioUSD);
  const cotiz = Number(i.cotizacion);
  const impPct = Number(i.impuestoPct) || 0;

  if (!usd || usd <= 0) throw new Error('Ingresá el precio en dólares');
  if (!cotiz || cotiz <= 0) throw new Error('Ingresá la cotización del dólar');
  if (impPct < 0) throw new Error('Los impuestos no pueden ser negativos');

  const cotizacionEfectiva = cotiz * (1 + impPct / 100);
  const precioBase = usd * cotiz;
  const impuestosMonto = usd * cotiz * (impPct / 100);
  const precioFinalPesos = precioBase + impuestosMonto;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const out: Outputs = {
    precioFinalPesos: Math.round(precioFinalPesos),
    cotizacionEfectiva: Math.round(cotizacionEfectiva),
    impuestosMonto: Math.round(impuestosMonto),
  };

  if (impPct > 0) {
    out._insight = {
      title: 'Cuánto suman los impuestos',
      text: `Los **USD ${usd}** te salen **${fmt(precioFinalPesos)}**: **${fmt(precioBase)}** al dólar de ${fmt(cotiz)} más **${fmt(impuestosMonto)}** de impuestos (**${impPct}%**). El dólar efectivo que terminás pagando es **${fmt(cotizacionEfectiva)}** por cada USD.`,
      tone: 'warn',
      icon: '💸',
    };
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Precio base', value: Math.round(precioBase) },
        { label: `Impuestos (${impPct}%)`, value: Math.round(impuestosMonto) },
      ],
      prefix: '$',
      centerValue: fmt(precioFinalPesos),
      centerLabel: 'Precio final',
      ariaLabel: `De ${fmt(precioFinalPesos)} finales, ${fmt(precioBase)} es el producto y ${fmt(impuestosMonto)} son impuestos.`,
    };
  } else {
    out._insight = {
      title: 'Precio en pesos',
      text: `Los **USD ${usd}** equivalen a **${fmt(precioFinalPesos)}** al dólar de **${fmt(cotiz)}**. No agregaste impuestos; si comprás con tarjeta sumá los recargos vigentes (PAÍS, percepción de Ganancias) para el costo real.`,
      tone: 'neutral',
      icon: '💵',
    };
  }

  return out;
}
