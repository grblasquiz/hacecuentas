/** Vodka infusión */
export interface Inputs { tipoIngrediente: string; mlVodka: number; __lang?: string; }
export interface Outputs { tiempoInfusion: string; cantidadIngrediente: string; metodo: string; almacenamiento: string; tips: string; _insight?: any; }

export function vodkaInfusionFrutasTiempo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const t = String(i.tipoIngrediente);
  const ml = Number(i.mlVodka);
  if (!ml || ml <= 0) throw new Error(__lang === 'en' ? 'Enter vodka ml' : 'Ingresá ml de vodka');

  const perfiles: Record<string, { tiempo: string; cantidad: string; tips: string }> = __lang === 'en' ? {
    citricos: { tiempo: '3–5 days', cantidad: `Zest of ${Math.ceil(ml / 100)} lemons/oranges`, tips: 'Zest only, no white pith (bitter).' },
    frutas_blandas: { tiempo: '2–4 days', cantidad: `${Math.ceil(ml * 0.5)}g of fruit`, tips: 'Cut into pieces, shake daily.' },
    frutas_duras: { tiempo: '7–10 days', cantidad: `${Math.ceil(ml * 0.5)}g cubed`, tips: 'Peel if needed. Taste-test at 7 days.' },
    vainilla: { tiempo: '2–4 weeks', cantidad: `${Math.ceil(ml / 200)} vanilla beans`, tips: 'Split lengthwise to expose seeds.' },
    cafe_granos: { tiempo: '5–7 days', cantidad: `${Math.ceil(ml * 0.15)}g roasted whole beans`, tips: 'Whole beans for a smooth infusion.' },
    especias: { tiempo: '1–2 weeks', cantidad: 'Cinnamon 3–4 sticks, cloves 10–15, peppercorns 20–30', tips: 'Whole spices, shake 2× per week.' },
    hierbas: { tiempo: '3–7 days', cantidad: `${Math.ceil(ml * 0.05)}g fresh leaves`, tips: 'Rinse well. They turn bitter quickly.' },
    chili: { tiempo: '2–4 days', cantidad: `${Math.ceil(ml / 250)} chili peppers`, tips: 'Taste daily. It gets very spicy fast.' },
    te: { tiempo: '1–3 days', cantidad: `${Math.ceil(ml / 150)} tea bags`, tips: 'Don\'t over-infuse: it turns tannic and astringent.' },
    jengibre: { tiempo: '1–2 weeks', cantidad: `${Math.ceil(ml * 0.07)}g grated`, tips: 'Use fresh grated ginger, not dried.' },
  } : {
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

  const labels: Record<string, string> = __lang === 'en' ? {
    citricos: 'citrus', frutas_blandas: 'soft fruit', frutas_duras: 'hard fruit', vainilla: 'vanilla',
    cafe_granos: 'coffee beans', especias: 'spices', hierbas: 'herbs', chili: 'chili', te: 'tea', jengibre: 'ginger',
  } : {
    citricos: 'cítricos', frutas_blandas: 'frutas blandas', frutas_duras: 'frutas duras', vainilla: 'vainilla',
    cafe_granos: 'granos de café', especias: 'especias', hierbas: 'hierbas', chili: 'chili', te: 'té', jengibre: 'jengibre',
  };
  const slow = ['vainilla', 'especias', 'jengibre'].includes(t);
  const fast = ['frutas_blandas', 'chili', 'te'].includes(t);
  const lbl = labels[t] ?? labels.citricos;

  const _insight = {
    title: __lang === 'en' ? 'Your infusion plan' : 'Tu plan de infusión',
    text: __lang === 'en'
      ? `For ${ml} ml of vodka with **${lbl}**, use **${p.cantidad}** and let it rest **${p.tiempo}**${slow ? '. This one is slow: be patient and taste before bottling' : (fast ? '. It infuses fast, so taste-test daily to avoid overpowering it' : '')}.`
      : `Para ${ml} ml de vodka con **${lbl}**, usá **${p.cantidad}** y dejá reposar **${p.tiempo}**${slow ? '. Esta infusión es lenta: tené paciencia y probá antes de embotellar' : (fast ? '. Infusiona rápido, así que probá a diario para que no se pase' : '')}.`,
    tone: fast ? 'warn' : 'neutral',
    icon: '🍸',
  };

  return {
    tiempoInfusion: p.tiempo,
    cantidadIngrediente: p.cantidad,
    metodo: __lang === 'en'
      ? 'Dark glass jar, room temperature, shake daily for the first 2–3 days'
      : 'Frasco de vidrio oscuro, temperatura ambiente, agitar diario primeros 2-3 días',
    almacenamiento: __lang === 'en'
      ? 'Strain when ready, bottle in dark glass, store in fridge or cool place'
      : 'Filtrar al punto, embotellar en vidrio oscuro, heladera o ambiente fresco',
    tips: p.tips,
    _insight,
  };
}
