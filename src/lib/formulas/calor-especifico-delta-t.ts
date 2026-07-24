export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function calorEspecificoDeltaT(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m); const c = Number(i.c); const dt = Number(i.dt);
  if (!m || !c || dt === undefined) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá');
  const Q = m * c * dt;
  const resumen = __lang === 'en'
    ? `Q = ${(Q/1000).toFixed(1)} kJ (${(Q/4184).toFixed(1)} kcal) to heat ${m}kg by ${dt}°C.`
    : `Q = ${(Q/1000).toFixed(1)} kJ (${(Q/4184).toFixed(1)} kcal) para calentar ${m}kg en ${dt}°C.`;
  const enfria = dt < 0;
  const kJ = (Q / 1000).toFixed(1);
  const kcal = (Q / 4184).toFixed(1);
  const _insight = __lang === 'en'
    ? {
        title: enfria ? 'Heat released' : 'Heat required',
        text: enfria
          ? `Cooling ${m} kg by ${Math.abs(dt)}°C releases **${Math.abs(Number(kJ)).toFixed(1)} kJ** (${Math.abs(Number(kcal)).toFixed(1)} kcal). The higher the specific heat **c = ${c}**, the more energy the material holds.`
          : `Heating ${m} kg by ${dt}°C requires **${kJ} kJ** (${kcal} kcal). With a specific heat of **c = ${c} J/kg·°C**, this is the energy you must supply.`,
        tone: 'neutral',
        icon: '🌡️',
      }
    : {
        title: enfria ? 'Calor liberado' : 'Calor necesario',
        text: enfria
          ? `Enfriar ${m} kg en ${Math.abs(dt)}°C libera **${Math.abs(Number(kJ)).toFixed(1)} kJ** (${Math.abs(Number(kcal)).toFixed(1)} kcal). Cuanto mayor es el calor específico **c = ${c}**, más energía retiene el material.`
          : `Calentar ${m} kg en ${dt}°C requiere **${kJ} kJ** (${kcal} kcal). Con un calor específico de **c = ${c} J/kg·°C**, esa es la energía que tenés que aportar.`,
        tone: 'neutral',
        icon: '🌡️',
      };
  // La unidad del output la agrega Calculator desde `suffix: "J"`.
  // Devolverla también acá producía el texto visible "334880 J J".
  return { calor: Q.toFixed(0), kcal: (Q/4184).toFixed(1) + ' kcal', resumen, _insight };
}
