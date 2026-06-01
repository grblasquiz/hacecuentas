export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function cosechaEsperadaHuertaKg(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const yield_: Record<string, number> = { tomate: 3, lechuga: 2, zanahoria: 4, papa: 2.5, calabaza: 5 };
  const m = Number(i.m2) || 0; const kg = (yield_[String(i.especie)] || 2) * m;
  const resumen = __lang === 'en'
    ? `Estimated harvest: ${kg.toFixed(0)} kg of ${i.especie} in ${m} m².`
    : __lang === 'pt'
    ? `Colheita estimada: ${kg.toFixed(0)} kg de ${i.especie} em ${m} m².`
    : `Cosecha estimada: ${kg.toFixed(0)} kg de ${i.especie} en ${m} m².`;
  return { kgTotal: kg.toFixed(1) + ' kg', resumen };
}
