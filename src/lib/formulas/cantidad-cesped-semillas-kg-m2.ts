export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cantidadCespedSemillasKgM2(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0;
  const rate: Record<string, number> = { rye: 35, fescue: 40, mezcla: 35 };
  const dosis = rate[String(i.tipo)] || 35;
  const g = m * dosis;
  const kg = (g/1000).toFixed(2);
  const nameEs: Record<string, string> = { rye: 'ray grass', fescue: 'festuca', mezcla: 'mezcla general' };
  const nameEn: Record<string, string> = { rye: 'ryegrass', fescue: 'tall fescue', mezcla: 'seed blend' };
  const label = __lang === 'en' ? (nameEn[String(i.tipo)] || String(i.tipo)) : (nameEs[String(i.tipo)] || String(i.tipo));
  const resumen = __lang === 'en'
    ? `${(g/1000).toFixed(2)} kg of ${label} seed for ${m} m² (${dosis} g/m²).`
    : `${(g/1000).toFixed(2)} kg de semilla de ${label} para ${m} m² (${dosis} g/m²).`;
  const insight = __lang === 'en'
    ? { title: 'Buy this much, no more', text: `For **${m} m²** you need **${kg} kg** (${dosis} g/m²). Don't over-seed: going past ~50 g/m² crowds the seedlings and leaves the lawn thin — and sow in autumn or spring, never mid-summer.`, tone: 'neutral', icon: '🌱' }
    : { title: 'Comprá esto, ni más ni menos', text: `Para **${m} m²** necesitás **${kg} kg** (${dosis} g/m²). No siembres de más: pasar de ~50 g/m² genera competencia entre plantines y deja el césped ralo — y sembrá en otoño o primavera, nunca en pleno verano.`, tone: 'neutral', icon: '🌱' };
  return { gramos: (g/1000).toFixed(2) + ' kg', resumen, _insight: insight };
}
