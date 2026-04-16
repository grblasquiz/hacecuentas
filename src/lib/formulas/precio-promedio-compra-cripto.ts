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
  const compras: Array<{ cantidad: number; precio: number }> = [];

  for (let n = 1; n <= 5; n++) {
    const cant = Number((i as Record<string, number>)[`compra${n}Cantidad`]) || 0;
    const prec = Number((i as Record<string, number>)[`compra${n}Precio`]) || 0;
    if (cant > 0 && prec > 0) {
      compras.push({ cantidad: cant, precio: prec });
    }
  }

  if (compras.length === 0) throw new Error('Ingresá al menos una compra con cantidad y precio');

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
    `Compra ${idx + 1}: ${c.cantidad} tokens a $${c.precio.toLocaleString()}`
  ).join('. ');

  const formula = `Precio promedio = $${totalInvertido.toLocaleString()} / ${totalTokens.toFixed(4)} tokens = $${precioPromedio.toFixed(2)}`;
  const explicacion = `${detalles}. Total invertido: $${totalInvertido.toLocaleString()}. Total tokens: ${totalTokens.toFixed(4)}. Tu precio promedio ponderado es $${precioPromedio.toFixed(2)} por token. Rango de precios: $${precioMasBajo.toFixed(2)} — $${precioMasAlto.toFixed(2)}.`;

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
