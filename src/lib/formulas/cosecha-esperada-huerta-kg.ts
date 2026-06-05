export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cosechaEsperadaHuertaKg(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const yield_: Record<string, number> = { tomate: 3, lechuga: 2, zanahoria: 2.5, papa: 3.5, calabaza: 4.5 };
  const m = Number(i.m2) || 0; const kg = (yield_[String(i.especie)] || 2) * m;
  const rendimiento = m > 0 ? kg / m : 0;
  const resumen = __lang === 'en'
    ? `Estimated harvest: ${kg.toFixed(0)} kg of ${i.especie} in ${m} m².`
    : __lang === 'pt'
    ? `Colheita estimada: ${kg.toFixed(0)} kg de ${i.especie} em ${m} m².`
    : `Cosecha estimada: ${kg.toFixed(0)} kg de ${i.especie} en ${m} m².`;
  const _insight = {
    title: __lang === 'en' ? 'Expected harvest' : __lang === 'pt' ? 'Colheita esperada' : 'Cosecha esperada',
    text: __lang === 'en'
      ? `In **${m} m²** of ${i.especie} you can expect around **${kg.toFixed(0)} kg** (about ${rendimiento.toFixed(1)} kg per m²). Real yield varies with soil, water and season.`
      : __lang === 'pt'
      ? `Em **${m} m²** de ${i.especie} você pode esperar cerca de **${kg.toFixed(0)} kg** (aproximadamente ${rendimiento.toFixed(1)} kg por m²). O rendimento real varia com solo, água e estação.`
      : `En **${m} m²** de ${i.especie} podés esperar unos **${kg.toFixed(0)} kg** (aprox. ${rendimiento.toFixed(1)} kg por m²). El rinde real varía según suelo, riego y temporada.`,
    tone: 'good',
    icon: '🌱',
  };
  return { kgTotal: kg.toFixed(1) + ' kg', resumen, _insight };
}
