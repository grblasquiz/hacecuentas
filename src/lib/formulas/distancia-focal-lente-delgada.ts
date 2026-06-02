export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; }
export function distanciaFocalLenteDelgada(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const modo = String(i.modo); const v1 = Number(i.val1); const v2 = Number(i.val2);
  let r: number;
  if (modo === 'f') { r = 1 / (1/v1 + 1/v2); }
  else if (modo === 's') { r = 1 / (1/v1 - 1/v2); }
  else { r = 1 / (1/v1 - 1/v2); }
  const resumen = __lang === 'en'
    ? `${modo} = ${r.toFixed(1)} cm (thin lens equation).`
    : `${modo} = ${r.toFixed(1)} cm (ecuación de lente delgada).`;
  const conv = r > 0;
  const _insight = __lang === 'en'
    ? {
        title: 'What this result means',
        text: conv
          ? `The lens **converges** with a value of **${r.toFixed(1)} cm**, forming a real image on the opposite side (1/f = 1/s₀ + 1/sᵢ).`
          : `The result is **${r.toFixed(1)} cm** (negative): a **divergent** behavior, where the image is virtual and on the same side as the object.`,
        tone: 'neutral',
        icon: '🔍',
      }
    : {
        title: 'Qué significa el resultado',
        text: conv
          ? `La lente **converge** con un valor de **${r.toFixed(1)} cm**, formando una imagen real del lado opuesto (1/f = 1/s₀ + 1/sᵢ).`
          : `El resultado es **${r.toFixed(1)} cm** (negativo): un comportamiento **divergente**, donde la imagen es virtual y del mismo lado que el objeto.`,
        tone: 'neutral',
        icon: '🔍',
      };
  return { resultado: r.toFixed(2) + ' cm', resumen, _insight };
}
