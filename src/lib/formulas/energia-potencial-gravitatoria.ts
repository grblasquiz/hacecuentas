export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function energiaPotencialGravitatoria(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m); const h = Number(i.h); const g = Number(i.g) || 9.81;
  if (!m || h === undefined || Number.isNaN(h)) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  const ep = m * g * h;
  const v = Math.sqrt(2 * g * Math.abs(h));
  const kmh = v * 3.6;
  const kcal = ep / 4184;
  const resumen = __lang === 'en'
    ? `Ep = ${ep.toFixed(1)} J (${kcal.toFixed(3)} kcal). Dropped from ${h} m it would hit the ground at ${v.toFixed(2)} m/s (${kmh.toFixed(1)} km/h).`
    : `Ep = ${ep.toFixed(1)} J (${kcal.toFixed(3)} kcal). Soltado desde ${h} m llegaría al suelo a ${v.toFixed(2)} m/s (${kmh.toFixed(1)} km/h).`;
  const _insight = {
    title: __lang === 'en' ? 'Stored energy and impact speed' : 'Energía almacenada y velocidad de impacto',
    text: __lang === 'en'
      ? `**${ep.toFixed(1)} J** are stored at ${h} m. The impact speed of ${v.toFixed(2)} m/s does **not** depend on the mass — a heavier object arrives just as fast, only with more energy behind it.`
      : `Hay **${ep.toFixed(1)} J** almacenados a ${h} m. La velocidad de impacto de ${v.toFixed(2)} m/s **no** depende de la masa: un objeto más pesado llega igual de rápido, solo que con más energía detrás.`,
    tone: 'neutral',
    icon: '⛰️',
  };
  return { ep: ep.toFixed(1), velocidad: v.toFixed(2) + ' m/s (' + kmh.toFixed(1) + ' km/h)', kcal: kcal.toFixed(3) + ' kcal', resumen, _insight };
}
