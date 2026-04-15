/** Consumo de gas natural: pesos por m³ según cuadro tarifario y estimación mensual */
export interface Inputs {
  consumoM3Bimestral: number;
  categoria?: string;
  precioPorM3?: number;
}
export interface Outputs {
  consumoM3Mensual: number;
  subtotal: number;
  ivaPct: number;
  iva: number;
  cargoFijo: number;
  total: number;
  totalMensual: number;
  categoriaDetectada: string;
  resumen: string;
}

export function gasNaturalConsumoM3(i: Inputs): Outputs {
  const m3 = Number(i.consumoM3Bimestral);
  const categoriaIn = String(i.categoria || 'auto');
  const precioIn = Number(i.precioPorM3) || 0;

  if (!m3 || m3 < 0) throw new Error('Ingresá un consumo bimestral válido en m³');

  // Categorías R según ENARGAS (Argentina 2026 estimado)
  // R1: < 500 m3/año (<83 m3 bimestrales)
  // R2: 500-1100 m3/año
  // R3: > 1100 m3/año
  const m3Anuales = m3 * 6;
  let categoriaDetectada = '';
  let precioPorM3 = precioIn;
  let cargoFijo = 0;

  if (categoriaIn === 'auto') {
    if (m3Anuales < 500) {
      categoriaDetectada = 'R1 (bajo consumo)';
      if (!precioIn) precioPorM3 = 280; // ARS/m3 residencial
      cargoFijo = 2500;
    } else if (m3Anuales < 1100) {
      categoriaDetectada = 'R2 (medio)';
      if (!precioIn) precioPorM3 = 340;
      cargoFijo = 3200;
    } else {
      categoriaDetectada = 'R3 (alto)';
      if (!precioIn) precioPorM3 = 420;
      cargoFijo = 4500;
    }
  } else {
    categoriaDetectada = categoriaIn;
    if (!precioIn) {
      if (categoriaIn.includes('R1')) precioPorM3 = 280;
      else if (categoriaIn.includes('R2')) precioPorM3 = 340;
      else precioPorM3 = 420;
    }
    cargoFijo = categoriaIn.includes('R1') ? 2500 : categoriaIn.includes('R2') ? 3200 : 4500;
  }

  const subtotal = m3 * precioPorM3 + cargoFijo;
  const ivaPct = 21;
  const iva = subtotal * (ivaPct / 100);
  const total = subtotal + iva;
  const totalMensual = total / 2;
  const consumoM3Mensual = m3 / 2;

  return {
    consumoM3Mensual: Number(consumoM3Mensual.toFixed(1)),
    subtotal: Math.round(subtotal),
    ivaPct,
    iva: Math.round(iva),
    cargoFijo: Math.round(cargoFijo),
    total: Math.round(total),
    totalMensual: Math.round(totalMensual),
    categoriaDetectada,
    resumen: `Categoría ${categoriaDetectada}. Factura bimestral estimada: $${Math.round(total).toLocaleString('es-AR')} ($${Math.round(totalMensual).toLocaleString('es-AR')} por mes).`,
  };
}
