export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function aguaRiegoPlantasDia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const base: Record<string, number> = { tomate: 2, lechuga: 0.5, hierba: 0.2, cactus: 0.05, arbol: 15 };
  const mult: Record<string, number> = { germinacion: 0.3, crecimiento: 0.7, fructificacion: 1.2 };
  const L = (base[String(i.especie)] || 1) * (mult[String(i.etapa)] || 1);
  const resumen = __lang === 'en'
    ? `Irrigation: ${L.toFixed(1)} L/day per plant (${i.especie}, ${i.etapa}).`
    : `Riego: ${L.toFixed(1)} L/día por planta (${i.especie}, ${i.etapa}).`;
  return { litrosDia: L.toFixed(2), resumen };
}
