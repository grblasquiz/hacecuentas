/** Convertir entre markup (sobre costo) y margen (sobre venta) */
export interface Inputs {
  modo: 'markup-a-margen' | 'margen-a-markup';
  valor: number; // % markup o % margen
  costoReferencia?: number; // opcional: para mostrar ejemplo con números
}
export interface Outputs {
  markup: number;
  margen: number;
  precioVenta: number;
  gananciaNeta: number;
  gananciaUnitaria: number;
  markupPorcentaje: number;
  margenPorcentaje: number;
  multiplicadorPrecio: number;
  costoReferencia: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function markupVsMargen(i: Inputs): Outputs {
  const modo = i.modo || 'markup-a-margen';
  const valor = Number(i.valor);
  const costo = Number(i.costoReferencia) || 100;

  if (!valor || valor <= 0) throw new Error('Ingresá el valor del markup o margen');
  if (costo <= 0) throw new Error('El costo de referencia debe ser positivo');

  let markup = 0;
  let margen = 0;

  if (modo === 'markup-a-margen') {
    if (valor >= 500) throw new Error('Markup demasiado alto');
    markup = valor;
    // margen = markup / (1 + markup)
    margen = (markup / (100 + markup)) * 100;
  } else {
    if (valor >= 100) throw new Error('El margen debe ser menor a 100%');
    margen = valor;
    // markup = margen / (1 - margen)
    markup = (margen / (100 - margen)) * 100;
  }

  const precioVenta = costo * (1 + markup / 100);
  const gananciaNeta = precioVenta - costo;
  const multiplicador = costo > 0 ? precioVenta / costo : 0;

  const resumen = `Markup ${markup.toFixed(2)}% sobre costo equivale a margen ${margen.toFixed(2)}% sobre venta.`;

  const markupR = Number(markup.toFixed(2));
  const margenR = Number(margen.toFixed(2));
  const precioR = Number(precioVenta.toFixed(2));
  const costoR = Number(costo.toFixed(2));
  const gananciaR = Number(gananciaNeta.toFixed(2));
  const fmtMoney = (n: number) => '$' + n.toLocaleString('es-AR', { maximumFractionDigits: 2 });

  return {
    markup: markupR,
    margen: margenR,
    precioVenta: precioR,
    gananciaNeta: gananciaR,
    gananciaUnitaria: gananciaR,
    markupPorcentaje: markupR,
    margenPorcentaje: margenR,
    multiplicadorPrecio: Number(multiplicador.toFixed(2)),
    costoReferencia: costoR,
    resumen,
    _insight: {
      title: 'Markup ≠ Margen',
      text: `Un **markup del ${markupR}%** sobre el costo equivale a un **margen del ${margenR}%** sobre el precio de venta. El margen siempre da menor que el markup porque se calcula sobre un número más grande (la venta, no el costo).`,
      tone: 'neutral',
      icon: '🏷️',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Costo', value: costoR },
        { label: 'Ganancia', value: gananciaR },
      ],
      prefix: '$',
      centerValue: fmtMoney(precioR),
      centerLabel: 'Precio de venta',
      ariaLabel: `Precio de venta de ${fmtMoney(precioR)} compuesto por ${fmtMoney(costoR)} de costo y ${fmtMoney(gananciaR)} de ganancia`,
    },
  };
}
