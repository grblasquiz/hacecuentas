/** Calculadora de Tamaño de Impresión según Megapíxeles */
export interface Inputs { megapixeles: number; aspectRatio: string; dpiDeseado: number; }
export interface Outputs { anchoCm: number; altoCm: number; anchoPixeles: number; altoPixeles: number; _insight?: any; }

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

  const aCm = Number(anchoCm.toFixed(1));
  const altCm = Number(altoCm.toFixed(1));

  // Calidad de impresión según los DPI elegidos
  let calidadTxt: string;
  let tone: "good" | "warn" | "neutral";
  if (dpi >= 300) {
    tone = "good";
    calidadTxt = `A **${dpi} DPI** es calidad fotográfica: tu foto rinde nítida hasta **${aCm} × ${altCm} cm**. Si imprimís más grande, los píxeles se estiran y pierde detalle de cerca.`;
  } else if (dpi >= 150) {
    tone = "neutral";
    calidadTxt = `A **${dpi} DPI** la nitidez es buena para mirar a distancia de brazo (pósters, cuadros): hasta **${aCm} × ${altCm} cm**. Para sostener en la mano conviene apuntar a 300 DPI.`;
  } else {
    tone = "warn";
    calidadTxt = `A solo **${dpi} DPI** ganás tamaño (**${aCm} × ${altCm} cm**) pero perdés definición: sirve para vallas o impresiones que se ven de lejos, no para fotos de cerca.`;
  }
  const _insight = {
    title: "Tamaño máximo recomendado",
    text: `Tu imagen de ${mp} MP equivale a **${anchoPixeles} × ${altoPixeles} px**. ${calidadTxt}`,
    tone,
    icon: "🖼️",
  };

  return {
    anchoCm: aCm,
    altoCm: altCm,
    anchoPixeles,
    altoPixeles,
    _insight,
  };
}
