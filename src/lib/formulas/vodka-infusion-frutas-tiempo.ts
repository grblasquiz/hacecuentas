/** Vodka infusión */
export interface Inputs { tipoIngrediente: string; mlVodka: number; }
export interface Outputs { tiempoInfusion: string; cantidadIngrediente: string; metodo: string; almacenamiento: string; tips: string; }

export function vodkaInfusionFrutasTiempo(i: Inputs): Outputs {
  const t = String(i.tipoIngrediente);
  const ml = Number(i.mlVodka);
  if (!ml || ml <= 0) throw new Error('Ingresá ml de vodka');

  const perfiles: Record<string, { tiempo: string; cantidad: string; tips: string }> = {
    citricos: { tiempo: '3-5 días', cantidad: `Piel de ${Math.ceil(ml / 100)} limones/naranjas`, tips: 'Solo la piel, sin parte blanca (amarga).' },
    frutas_blandas: { tiempo: '2-4 días', cantidad: `${Math.ceil(ml * 0.5)}g de fruta`, tips: 'Cortar en trozos, agitar diario.' },
    frutas_duras: { tiempo: '7-10 días', cantidad: `${Math.ceil(ml * 0.5)}g en cubos`, tips: 'Pelar si es necesario. Probar a los 7 días.' },
    vainilla: { tiempo: '2-4 semanas', cantidad: `${Math.ceil(ml / 200)} chauchas`, tips: 'Cortar longitudinal para exponer semillas.' },
    cafe_granos: { tiempo: '5-7 días', cantidad: `${Math.ceil(ml * 0.15)}g granos tostados`, tips: 'Granos enteros para infusión suave.' },
    especias: { tiempo: '1-2 semanas', cantidad: 'Canela 3-4 palos, clavo 10-15, pimienta 20-30 granos', tips: 'Especias enteras, agitar 2× por semana.' },
    hierbas: { tiempo: '3-7 días', cantidad: `${Math.ceil(ml * 0.05)}g hojas frescas`, tips: 'Lavar bien. Pasan rápido al amargor.' },
    chili: { tiempo: '2-4 días', cantidad: `${Math.ceil(ml / 250)} ajíes`, tips: 'Probar diariamente. Enseguida se pone muy picante.' },
    te: { tiempo: '1-3 días', cantidad: `${Math.ceil(ml / 150)} bolsitas`, tips: 'No sobre-infusionar: se pone tánico y astringente.' },
    jengibre: { tiempo: '1-2 semanas', cantidad: `${Math.ceil(ml * 0.07)}g rallado`, tips: 'Jengibre fresco rallado, no seco.' },
  };
  const p = perfiles[t] ?? perfiles.citricos;

  return {
    tiempoInfusion: p.tiempo,
    cantidadIngrediente: p.cantidad,
    metodo: 'Frasco de vidrio oscuro, temperatura ambiente, agitar diario primeros 2-3 días',
    almacenamiento: 'Filtrar al punto, embotellar en vidrio oscuro, heladera o ambiente fresco',
    tips: p.tips,
  };
}
