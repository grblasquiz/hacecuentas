export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function escalaRichterMagnitudEnergia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.magnitud);
  if (!m) throw new Error(__lang === 'en' ? 'Enter magnitude' : 'Ingresá magnitud');
  const E = Math.pow(10, 4.8 + 1.5 * m);
  const tntKg = E / 4.18e6;
  let eqTnt: string;
  if (tntKg >= 1e6) eqTnt = (tntKg / 1e6).toFixed(2) + ' Mt TNT';
  else if (tntKg >= 1e3) eqTnt = (tntKg / 1e3).toFixed(2) + ' kt TNT';
  else eqTnt = tntKg.toFixed(0) + ' kg TNT';

  // Categoría sísmica según magnitud (escala USGS)
  let cat: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (m < 4) { cat = __lang === 'en' ? 'minor (rarely felt or causes damage)' : 'menor (casi no se siente ni causa daño)'; tone = 'good'; }
  else if (m < 6) { cat = __lang === 'en' ? 'moderate (felt clearly, light damage)' : 'moderado (se siente claramente, daños leves)'; tone = 'neutral'; }
  else if (m < 7) { cat = __lang === 'en' ? 'strong (serious damage in populated areas)' : 'fuerte (daños serios en zonas pobladas)'; tone = 'warn'; }
  else { cat = __lang === 'en' ? 'major/great (devastating)' : 'grande/devastador'; tone = 'warn'; }

  const insightText = __lang === 'en'
    ? `A magnitude **M${m}** earthquake releases **${E.toExponential(1)} J**, equivalent to **${eqTnt}**. On the Richter scale that is a **${cat}** event. Remember each whole point means ~32× more energy.`
    : `Un sismo de magnitud **M${m}** libera **${E.toExponential(1)} J**, equivalente a **${eqTnt}**. En la escala de Richter es un evento **${cat}**. Cada punto entero equivale a ~32× más energía.`;

  const _insight = {
    title: __lang === 'en' ? 'Energy released' : 'Energía liberada',
    text: insightText,
    tone,
    icon: '🌍',
  };

  const segEs = [
    { nombre: 'Menor', max: 4, color: '#22c55e', colorDark: '#16a34a' },
    { nombre: 'Moderado', max: 6, color: '#eab308', colorDark: '#ca8a04' },
    { nombre: 'Fuerte', max: 7, color: '#f97316', colorDark: '#ea580c' },
    { nombre: 'Devastador', max: 10, color: '#dc2626', colorDark: '#b91c1c' },
  ];
  const segEn = [
    { nombre: 'Minor', max: 4, color: '#22c55e', colorDark: '#16a34a' },
    { nombre: 'Moderate', max: 6, color: '#eab308', colorDark: '#ca8a04' },
    { nombre: 'Strong', max: 7, color: '#f97316', colorDark: '#ea580c' },
    { nombre: 'Devastating', max: 10, color: '#dc2626', colorDark: '#b91c1c' },
  ];
  const _chart = {
    type: 'scale',
    marker: m,
    markerLabel: `M${m}`,
    min: 1,
    segments: __lang === 'en' ? segEn : segEs,
    ariaLabel: __lang === 'en'
      ? `Richter scale: magnitude M${m} falls in the ${cat} zone.`
      : `Escala de Richter: la magnitud M${m} cae en la zona ${cat}.`,
  };

  return { energia: E.toExponential(2) + ' J', equivalente: eqTnt, resumen: `M${m}: ${E.toExponential(1)} J (${eqTnt}).`, _insight, _chart };
}
