/** Cálculo de megapíxeles y tamaño estimado de imagen */
export interface Inputs { anchoPixeles: number; altoPixeles: number; formato?: string; }
export interface Outputs { megapixeles: number; totalPixeles: number; tamanoEstimadoMb: number; detalle: string; }

export function tamanoImagenPixelesMegapixeles(i: Inputs): Outputs {
  const ancho = Number(i.anchoPixeles);
  const alto = Number(i.altoPixeles);
  const formato = String(i.formato || 'jpeg').toLowerCase();

  if (!ancho || ancho <= 0) throw new Error('Ingresá el ancho en píxeles');
  if (!alto || alto <= 0) throw new Error('Ingresá el alto en píxeles');

  const totalPixeles = ancho * alto;
  const megapixeles = totalPixeles / 1e6;

  // Factores de tamaño aproximados (MB por megapíxel)
  const factores: Record<string, number> = { jpeg: 0.3, png: 1.5, raw: 2.5 };
  const factor = factores[formato] || factores.jpeg;
  const tamanoMb = megapixeles * factor;

  const nombreFormato = formato === 'jpeg' ? 'JPEG' : formato === 'png' ? 'PNG' : 'RAW';

  return {
    megapixeles: Number(megapixeles.toFixed(1)),
    totalPixeles,
    tamanoEstimadoMb: Number(tamanoMb.toFixed(1)),
    detalle: `Imagen de ${ancho}×${alto} = ${megapixeles.toFixed(1)} MP (${totalPixeles.toLocaleString()} píxeles). En ${nombreFormato}: ~${tamanoMb.toFixed(1)} MB por foto.`,
  };
}
