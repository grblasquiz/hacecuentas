/** Precio promedio ponderado de compras de cripto */

export interface Inputs {
  compra1Cantidad: number;
  compra1Precio: number;
  compra2Cantidad: number;
  compra2Precio: number;
  compra3Cantidad: number;
  compra3Precio: number;
  compra4Cantidad: number;
  compra4Precio: number;
  compra5Cantidad: number;
  compra5Precio: number;
  __lang?: string;
}

export interface Outputs {
  precioPromedio: number;
  totalTokens: number;
  totalInvertido: number;
  precioMasAlto: number;
  precioMasBajo: number;
  formula: string;
  explicacion: string;
}

export function precioPromedioCompraCripto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorNoCompras: 'Ingresá al menos una compra con cantidad y precio',
      purchaseLabel: (idx: number, cantidad: number, precio: string) => `Compra ${idx + 1}: ${cantidad} tokens a $${precio}`,
      formulaLabel: (totalInvertido: string, totalTokens: string, precioPromedio: string) => `Precio promedio = $${totalInvertido} / ${totalTokens} tokens = $${precioPromedio}`,
      totalInvertido: 'Total invertido',
      totalTokens: 'Total tokens',
      precioPromedioDesc: (precioPromedio: string) => `Tu precio promedio ponderado es $${precioPromedio} por token`,
      rangoPreciosLabel: 'Rango de precios',
    },
    en: {
      errorNoCompras: 'Enter at least one purchase with quantity and price',
      purchaseLabel: (idx: number, cantidad: number, precio: string) => `Purchase ${idx + 1}: ${cantidad} tokens at $${precio}`,
      formulaLabel: (totalInvertido: string, totalTokens: string, precioPromedio: string) => `Average price = $${totalInvertido} / ${totalTokens} tokens = $${precioPromedio}`,
      totalInvertido: 'Total invested',
      totalTokens: 'Total tokens',
      precioPromedioDesc: (precioPromedio: string) => `Your weighted average price is $${precioPromedio} per token`,
      rangoPreciosLabel: 'Price range',
    },
  } as const)[__lang];

  const compras: Array<{ cantidad: number; precio: number }> = [];

  for (let n = 1; n <= 5; n++) {
    const cant = Number((i as Record<string, number>)[`compra${n}Cantidad`]) || 0;
    const prec = Number((i as Record<string, number>)[`compra${n}Precio`]) || 0;
    if (cant > 0 && prec > 0) {
      compras.push({ cantidad: cant, precio: prec });
    }
  }

  if (compras.length === 0) throw new Error(T.errorNoCompras);

  let totalTokens = 0;
  let totalInvertido = 0;
  let precioMasAlto = 0;
  let precioMasBajo = Infinity;

  for (const c of compras) {
    totalTokens += c.cantidad;
    totalInvertido += c.cantidad * c.precio;
    if (c.precio > precioMasAlto) precioMasAlto = c.precio;
    if (c.precio < precioMasBajo) precioMasBajo = c.precio;
  }

  const precioPromedio = totalInvertido / totalTokens;

  const detalles = compras.map((c, idx) =>
    T.purchaseLabel(idx, c.cantidad, c.precio.toLocaleString())
  ).join('. ');

  const formula = T.formulaLabel(totalInvertido.toLocaleString(), totalTokens.toFixed(4), precioPromedio.toFixed(2));
  const explicacion = `${detalles}. ${T.totalInvertido}: $${totalInvertido.toLocaleString()}. ${T.totalTokens}: ${totalTokens.toFixed(4)}. ${T.precioPromedioDesc(precioPromedio.toFixed(2))}. ${T.rangoPreciosLabel}: $${precioMasBajo.toFixed(2)} — $${precioMasAlto.toFixed(2)}.`;

  return {
    precioPromedio: Number(precioPromedio.toFixed(4)),
    totalTokens: Number(totalTokens.toFixed(6)),
    totalInvertido: Number(totalInvertido.toFixed(2)),
    precioMasAlto: Number(precioMasAlto.toFixed(2)),
    precioMasBajo: Number(precioMasBajo.toFixed(2)),
    formula,
    explicacion,
  };
}
