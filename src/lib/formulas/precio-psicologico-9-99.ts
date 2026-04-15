/** Precio psicológico con terminación en 9/99/990 */

export interface Inputs {
  precioBase: number;
  costoProducto: number;
}

export interface Outputs {
  precioPsicologico: number;
  margenOriginal: number;
  margenPsicologico: number;
  detalle: string;
}

export function precioPsicologico999(i: Inputs): Outputs {
  const precio = Number(i.precioBase);
  const costo = Number(i.costoProducto);

  if (isNaN(precio) || precio <= 0) throw new Error('Ingresá el precio base del producto');
  if (isNaN(costo) || costo < 0) throw new Error('El costo no puede ser negativo');
  if (costo >= precio) throw new Error('El costo debe ser menor al precio');

  // Find the psychological price: just below the nearest round number
  let precioPsicologico: number;

  if (precio >= 100000) {
    // For 100K+: use -990 (ej: 149990)
    const redondo = Math.ceil(precio / 10000) * 10000;
    precioPsicologico = redondo - 10;
  } else if (precio >= 10000) {
    // For 10K-100K: use -990 (ej: 9990, 29990)
    const redondo = Math.ceil(precio / 1000) * 1000;
    precioPsicologico = redondo - 10;
  } else if (precio >= 1000) {
    // For 1K-10K: use -990 (ej: 2990, 9990)
    const redondo = Math.ceil(precio / 1000) * 1000;
    precioPsicologico = redondo - 10;
  } else if (precio >= 100) {
    // For 100-1000: use -99 (ej: 299, 999)
    const redondo = Math.ceil(precio / 100) * 100;
    precioPsicologico = redondo - 1;
  } else {
    // For <100: use -9 (ej: 29, 99)
    const redondo = Math.ceil(precio / 10) * 10;
    precioPsicologico = redondo - 1;
  }

  // If psych price is above the base, go one tier down
  if (precioPsicologico > precio) {
    if (precio >= 10000) {
      precioPsicologico -= 1000;
    } else if (precio >= 1000) {
      precioPsicologico -= 1000;
    } else if (precio >= 100) {
      precioPsicologico -= 100;
    } else {
      precioPsicologico -= 10;
    }
  }

  // Ensure psych price covers cost
  if (precioPsicologico <= costo) {
    precioPsicologico = precio; // Fallback to original
  }

  const margenOriginal = ((precio - costo) / precio) * 100;
  const margenPsicologico = ((precioPsicologico - costo) / precioPsicologico) * 100;
  const diferencia = precio - precioPsicologico;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let efecto: string;
  if (diferencia > 0) {
    efecto = `Resignás $${fmt.format(diferencia)} (${((diferencia / precio) * 100).toFixed(1)}%) ` +
      `pero cambiás la percepción del dígito izquierdo. Estudios muestran 8-24% más ventas.`;
  } else if (diferencia < 0) {
    efecto = `El precio psicológico es $${fmt.format(Math.abs(diferencia))} mayor. ` +
      `Ganás margen sin cambiar la percepción de rango de precio.`;
  } else {
    efecto = 'Tu precio ya es un precio psicológico óptimo.';
  }

  const detalle =
    `Precio original: $${fmt.format(precio)}. ` +
    `Precio psicológico: $${fmt.format(precioPsicologico)}. ` +
    `Margen original: ${margenOriginal.toFixed(1)}%. ` +
    `Margen psicológico: ${margenPsicologico.toFixed(1)}%. ` +
    efecto;

  return {
    precioPsicologico: Math.round(precioPsicologico),
    margenOriginal: Number(margenOriginal.toFixed(1)),
    margenPsicologico: Number(margenPsicologico.toFixed(1)),
    detalle,
  };
}
