/** Margen de seguridad (Graham) — diferencia entre valor intrínseco y precio */

export interface Inputs {
  precioActual: number;
  eps: number;
  tasaCrecimiento: number;
  rendimientoBono: number;
}

export interface Outputs {
  valorIntrinseco: number;
  margenSeguridad: number;
  precioMaximoCompra: number;
  recomendacion: string;
  formula: string;
  explicacion: string;
}

export function margenSeguridadInversion(i: Inputs): Outputs {
  const precio = Number(i.precioActual);
  const eps = Number(i.eps);
  const crecimiento = Number(i.tasaCrecimiento) || 0;
  const rendBono = Number(i.rendimientoBono) || 4.4;

  if (!precio || precio <= 0) throw new Error('Ingresá el precio actual');
  if (!eps || eps <= 0) throw new Error('Ingresá el EPS (ganancia por acción)');

  // Fórmula de Graham: V = EPS × (8.5 + 2g) × 4.4 / Y
  // V = valor intrínseco
  // g = tasa de crecimiento esperada (5 años)
  // Y = rendimiento del bono corporativo AAA actual
  const valorIntrinseco = (eps * (8.5 + 2 * crecimiento) * 4.4) / rendBono;

  const margenSeguridad = ((valorIntrinseco - precio) / valorIntrinseco) * 100;

  // Precio máximo de compra con 25% de margen de seguridad
  const precioMaximoCompra = valorIntrinseco * 0.75;

  let recomendacion: string;
  if (margenSeguridad >= 30) recomendacion = 'Amplio margen de seguridad — potencial compra según Graham';
  else if (margenSeguridad >= 15) recomendacion = 'Margen de seguridad moderado — analizar más antes de comprar';
  else if (margenSeguridad >= 0) recomendacion = 'Margen de seguridad bajo — precio cercano al valor intrínseco';
  else recomendacion = 'Sin margen de seguridad — precio por encima del valor intrínseco';

  const formula = `V = $${eps} × (8.5 + 2×${crecimiento}) × 4.4 / ${rendBono} = $${valorIntrinseco.toFixed(2)}`;
  const explicacion = `Fórmula de Graham: valor intrínseco = $${valorIntrinseco.toFixed(2)}. Precio actual: $${precio.toFixed(2)}. Margen de seguridad: ${margenSeguridad.toFixed(1)}%. Precio máximo de compra (con 25% de margen): $${precioMaximoCompra.toFixed(2)}. ${recomendacion}. Nota: esta es una valuación simplificada; complementá con análisis de flujos de caja, deuda y competencia.`;

  return {
    valorIntrinseco: Number(valorIntrinseco.toFixed(2)),
    margenSeguridad: Number(margenSeguridad.toFixed(2)),
    precioMaximoCompra: Number(precioMaximoCompra.toFixed(2)),
    recomendacion,
    formula,
    explicacion,
  };
}
