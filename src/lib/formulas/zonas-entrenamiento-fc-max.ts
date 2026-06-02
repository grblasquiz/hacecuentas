export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function zonasEntrenamientoFcMax(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const e = Number(i.edad) || 30; const fr = Number(i.fcReposo) || 60;
  const fm = 208 - 0.7 * e;
  const reserve = fm - fr;
  const zona = (pct: number) => Math.round(fr + reserve * pct);
  const z1 = `${zona(0)}-${zona(0.6)}`; const z2 = `${zona(0.6)}-${zona(0.7)}`;
  const z3 = `${zona(0.7)}-${zona(0.8)}`; const z4 = `${zona(0.8)}-${zona(0.9)}`; const z5 = `${zona(0.9)}-${zona(1)}`;
  const resumen = __lang === 'en'
    ? `Max HR ${fm.toFixed(0)} bpm. Karvonen zones: Z2 ${z2} (aerobic base).`
    : `FC máx ${fm.toFixed(0)} bpm. Zonas por Karvonen: Z2 ${z2} (base aeróbica).`;
  const insight = __lang === 'en'
    ? { title: 'Use your zones', text: `Your max HR is **${fm.toFixed(0)} bpm** (Tanaka formula). Spend most of your training in **Z2 ${z2} bpm** to build aerobic base, and save **Z4 ${z4} bpm** for hard interval days. Avoiding the "gray zone" (always Z3) is what drives real gains.`, tone: 'neutral' as const, icon: '❤️' }
    : { title: 'Usá tus zonas', text: `Tu FC máx es **${fm.toFixed(0)} bpm** (fórmula de Tanaka). Pasá la mayor parte del entrenamiento en **Z2 ${z2} bpm** para base aeróbica, y reservá la **Z4 ${z4} bpm** para los días de series. Evitar la "zona gris" (siempre Z3) es lo que produce mejoras reales.`, tone: 'neutral' as const, icon: '❤️' };
  return { fcMax: fm.toFixed(0), zonas: `Z1 ${z1} | Z2 ${z2} | Z3 ${z3} | Z4 ${z4} | Z5 ${z5}`,
    resumen, _insight: insight };
}
