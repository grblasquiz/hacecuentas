/** Calculadora de DPI para Impresión según Distancia */
export interface Inputs { distanciaCm: number; anchoImpresionCm: number; altoImpresionCm: number; }
export interface Outputs { dpiMinimo: number; dpiRecomendado: number; pixelesAncho: number; mpNecesarios: number; }

export function impresionDpiCalidad(i: Inputs): Outputs {
  const dist = Number(i.distanciaCm);
  const ancho = Number(i.anchoImpresionCm);
  const alto = Number(i.altoImpresionCm);
  if (!dist || dist <= 0) throw new Error('Ingresá la distancia de visualización');
  if (!ancho || ancho <= 0) throw new Error('Ingresá el ancho de impresión');
  if (!alto || alto <= 0) throw new Error('Ingresá el alto de impresión');

  // Human eye resolution: ~1 arcminute = 1/3438 radian
  // DPI minimum = 3438 / distance_cm * 2.54
  const dpiMinimo = Math.ceil((3438 / dist) * 2.54);
  const dpiRecomendado = Math.ceil(dpiMinimo * 1.3);

  const pixelesAncho = Math.ceil((ancho / 2.54) * dpiRecomendado);
  const pixelesAlto = Math.ceil((alto / 2.54) * dpiRecomendado);
  const mpNecesarios = (pixelesAncho * pixelesAlto) / 1000000;

  return {
    dpiMinimo,
    dpiRecomendado,
    pixelesAncho,
    mpNecesarios: Number(mpNecesarios.toFixed(1)),
  };
}
