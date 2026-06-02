/** Cálculo de megapíxeles y tamaño estimado de imagen */
export interface Inputs { anchoPixeles: number; altoPixeles: number; formato?: string; }
export interface Outputs { megapixeles: number; totalPixeles: number; tamanoEstimadoMb: number; detalle: string; _insight?: any; }

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

  // Calidad de impresión a 300 DPI (foto nítida)
  const ladoLargoPx = Math.max(ancho, alto);
  const pulgadas300 = ladoLargoPx / 300;
  const cm300 = Math.round(pulgadas300 * 2.54);
  const pesada = tamanoMb >= 8;

  return {
    megapixeles: Number(megapixeles.toFixed(1)),
    totalPixeles,
    tamanoEstimadoMb: Number(tamanoMb.toFixed(1)),
    detalle: `Imagen de ${ancho}×${alto} = ${megapixeles.toFixed(1)} MP (${totalPixeles.toLocaleString()} píxeles). En ${nombreFormato}: ~${tamanoMb.toFixed(1)} MB por foto.`,
    _insight: {
      title: pesada ? 'Archivo pesado' : 'Buena resolución de impresión',
      text: `Con **${megapixeles.toFixed(1)} MP** podés imprimir nítido hasta unos **${cm300} cm** de lado largo a 300 DPI. En ${nombreFormato} cada foto ocupa **~${tamanoMb.toFixed(1)} MB**${pesada ? ', así que cargarlas de a muchas o subirlas a la web va a tardar — conviene comprimir o pasar a JPEG.' : ', un peso cómodo para compartir o subir.'}`,
      tone: pesada ? 'warn' : 'good',
      icon: '📷',
    },
  };
}
