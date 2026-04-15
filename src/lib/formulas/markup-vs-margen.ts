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
  costoReferencia: number;
  resumen: string;
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

  const resumen = `Markup ${markup.toFixed(2)}% sobre costo equivale a margen ${margen.toFixed(2)}% sobre venta.`;

  return {
    markup: Number(markup.toFixed(2)),
    margen: Number(margen.toFixed(2)),
    precioVenta: Number(precioVenta.toFixed(2)),
    gananciaNeta: Number(gananciaNeta.toFixed(2)),
    costoReferencia: Number(costo.toFixed(2)),
    resumen,
  };
}
