/** Calculadora de Tamaño de Impresión según Megapíxeles */
export interface Inputs { megapixeles: number; aspectRatio: string; dpiDeseado: number; }
export interface Outputs { anchoCm: number; altoCm: number; anchoPixeles: number; altoPixeles: number; }

export function megapixelesImpresionTamano(i: Inputs): Outputs {
  const mp = Number(i.megapixeles);
  const dpi = Number(i.dpiDeseado);
  if (!mp || mp <= 0) throw new Error('Ingresá los megapíxeles');
  if (!dpi || dpi <= 0) throw new Error('Ingresá los DPI');

  const [rw, rh] = i.aspectRatio.split(':').map(Number);
  if (!rw || !rh) throw new Error('Relación de aspecto inválida');

  const totalPixels = mp * 1000000;
  const anchoPixeles = Math.round(Math.sqrt(totalPixels * rw / rh));
  const altoPixeles = Math.round(Math.sqrt(totalPixels * rh / rw));

  const anchoCm = (anchoPixeles / dpi) * 2.54;
  const altoCm = (altoPixeles / dpi) * 2.54;

  return {
    anchoCm: Number(anchoCm.toFixed(1)),
    altoCm: Number(altoCm.toFixed(1)),
    anchoPixeles,
    altoPixeles,
  };
}
