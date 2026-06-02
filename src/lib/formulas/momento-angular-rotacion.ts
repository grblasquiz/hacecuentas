export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function momentoAngularRotacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { error: 'Completá' },
    en: { error: 'Fill in all fields' },
  } as const)[__lang];
  const I = Number(i.inercia); const w = Number(i.omega);
  if (!I || !w) throw new Error(T.error);
  const L = I * w;
  const resumen = __lang === 'en'
    ? `L = ${L.toFixed(2)} kg·m²/s with I=${I} and ω=${w} rad/s.`
    : `L = ${L.toFixed(2)} kg·m²/s con I=${I} y ω=${w} rad/s.`;
  const insight = __lang === 'en'
    ? {
        title: 'Angular momentum',
        text: `With a moment of inertia of **${I} kg·m²** spinning at **${w} rad/s**, the angular momentum is **L = ${L.toFixed(2)} kg·m²/s**. Since there is no external torque, L stays constant: if I drops, ω rises (the spinning-skater effect).`,
        tone: 'neutral',
        icon: '🌀',
      }
    : {
        title: 'Momento angular',
        text: `Con un momento de inercia de **${I} kg·m²** girando a **${w} rad/s**, el momento angular es **L = ${L.toFixed(2)} kg·m²/s**. Sin torque externo, L se conserva: si baja I, sube ω (el efecto del patinador que cierra los brazos).`,
        tone: 'neutral',
        icon: '🌀',
      };
  return { momento: L.toFixed(3) + ' kg·m²/s', resumen, _insight: insight };
}
