/** Cálculo de PPI (densidad de píxeles) de una pantalla */
export interface Inputs { anchoPixeles: number; altoPixeles: number; diagonalPulgadas: number; }
export interface Outputs { ppi: number; clasificacion: string; totalPixeles: number; detalle: string; }

export function resolucionPantallaPpiDensidad(i: Inputs): Outputs {
  const ancho = Number(i.anchoPixeles);
  const alto = Number(i.altoPixeles);
  const diagonal = Number(i.diagonalPulgadas);

  if (!ancho || ancho <= 0) throw new Error('Ingresá el ancho en píxeles');
  if (!alto || alto <= 0) throw new Error('Ingresá el alto en píxeles');
  if (!diagonal || diagonal <= 0) throw new Error('Ingresá la diagonal en pulgadas');

  const diagonalPx = Math.sqrt(ancho * ancho + alto * alto);
  const ppi = diagonalPx / diagonal;
  const totalPixeles = ancho * alto;

  let clasificacion: string;
  if (ppi >= 300) clasificacion = 'Retina / Ultra HD — excelente para celulares y tablets';
  else if (ppi >= 200) clasificacion = 'Excelente — nitidez premium para notebooks';
  else if (ppi >= 130) clasificacion = 'Muy bueno — ideal para monitores de trabajo';
  else if (ppi >= 90) clasificacion = 'Bueno — aceptable para uso general';
  else clasificacion = 'Básico — se notan los píxeles de cerca';

  const megapixeles = (totalPixeles / 1e6).toFixed(1);

  return {
    ppi: Number(ppi.toFixed(1)),
    clasificacion,
    totalPixeles,
    detalle: `Pantalla de ${diagonal}" a ${ancho}×${alto} (${megapixeles} MP) = ${ppi.toFixed(1)} PPI. ${clasificacion}.`,
  };
}
