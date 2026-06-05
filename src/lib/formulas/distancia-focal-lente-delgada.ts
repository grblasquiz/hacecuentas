export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; }
export function distanciaFocalLenteDelgada(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const modo = String(i.modo); const v1 = Number(i.val1); const v2 = Number(i.val2);
  let r: number;
  if (modo === 'f') { r = 1 / (1/v1 + 1/v2); }
  else if (modo === 's') { r = 1 / (1/v1 - 1/v2); }
  else { r = 1 / (1/v1 - 1/v2); }

  const conv = r > 0;
  const dioptriasMm = Math.abs(r) > 0 ? (1 / (r / 100)).toFixed(2) : '∞';

  let label: string;
  if (modo === 'f') {
    label = __lang === 'en' ? 'Focal length f' : 'Distancia focal f';
  } else if (modo === 's') {
    label = __lang === 'en' ? 'Object distance s' : 'Distancia del objeto s';
  } else {
    label = __lang === 'en' ? "Image distance s'" : "Distancia de la imagen s'";
  }

  const resumen = __lang === 'en'
    ? `${label} = ${r.toFixed(2)} cm · 1/f = 1/s + 1/s' (thin lens).${modo === 'f' ? ' Power: ' + (conv ? '+' : '') + dioptriasMm + ' D' : ''}`
    : `${label} = ${r.toFixed(2)} cm · 1/f = 1/s + 1/s' (lente delgada).${modo === 'f' ? ' Potencia: ' + (conv ? '+' : '') + dioptriasMm + ' D' : ''}`;

  const _insight = __lang === 'en'
    ? {
        title: 'What this result means',
        text: conv
          ? `**${label} = ${r.toFixed(1)} cm** — the lens **converges** light, forming a real image on the opposite side. ${modo === 'f' ? 'Equivalent power: **' + dioptriasMm + ' D**.  Positive focal length = converging lens (biconvex).' : ''}`
          : `**${label} = ${r.toFixed(1)} cm** (negative) — **diverging** behavior: the image is virtual, appearing on the same side as the object. ${modo === 'f' ? 'Equivalent power: **' + dioptriasMm + ' D** (myopia correction).' : ''}`,
        tone: 'neutral',
        icon: '🔍',
      }
    : {
        title: 'Qué significa el resultado',
        text: conv
          ? `**${label} = ${r.toFixed(1)} cm** — la lente **converge** la luz, formando una imagen real del lado opuesto. ${modo === 'f' ? 'Potencia equivalente: **' + dioptriasMm + ' D**. Focal positiva = lente convergente (biconvexa).' : ''}`
          : `**${label} = ${r.toFixed(1)} cm** (negativo) — comportamiento **divergente**: la imagen es virtual, del mismo lado que el objeto. ${modo === 'f' ? 'Potencia: **' + dioptriasMm + ' D** (corrección de miopía).' : ''}`,
        tone: 'neutral',
        icon: '🔍',
      };
  return { resultado: r.toFixed(2) + ' cm', resumen, _insight };
}
