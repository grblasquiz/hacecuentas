export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function aguaRiegoPlantasDia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const base: Record<string, number> = { tomate: 2, lechuga: 0.5, hierba: 0.2, cactus: 0.05, arbol: 15 };
  const mult: Record<string, number> = { germinacion: 0.3, crecimiento: 0.7, fructificacion: 1.2 };
  const L = (base[String(i.especie)] || 1) * (mult[String(i.etapa)] || 1);
  const resumen = __lang === 'en'
    ? `Irrigation: ${L.toFixed(1)} L/day per plant (${i.especie}, ${i.etapa}).`
    : `Riego: ${L.toFixed(1)} L/día por planta (${i.especie}, ${i.etapa}).`;

  const semanal = L * 7;
  const Lfmt = L.toFixed(1);
  const semFmt = semanal.toFixed(1);
  const _insight = {
    title: __lang === 'en' ? 'How much to water' : 'Cuánto regar',
    text: __lang === 'en'
      ? `Each plant needs about **${Lfmt} L/day** at the ${i.etapa} stage, roughly **${semFmt} L/week**. Always check the topsoil first: water only when the top 2-3 cm feel dry, since overwatering rots roots faster than a missed day.`
      : `Cada planta necesita unos **${Lfmt} L/día** en etapa de ${i.etapa}, cerca de **${semFmt} L/semana**. Revisá siempre la tierra: regá solo cuando los primeros 2-3 cm estén secos, porque el exceso de agua pudre las raíces más rápido que un día sin regar.`,
    tone: 'neutral',
    icon: '🌱',
  };

  return { litrosDia: L.toFixed(2), resumen, _insight };
}
