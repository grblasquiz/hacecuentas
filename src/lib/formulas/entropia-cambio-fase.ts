export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function entropiaCambioFase(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const q = Number(i.q); const t = Number(i.t);
  if (q === undefined || !t) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá');
  const dS = q / t;
  const resumen = __lang === 'en'
    ? `ΔS = ${dS.toFixed(1)} J/K (absorbing ${(q/1000).toFixed(1)}kJ at ${t}K).`
    : `ΔS = ${dS.toFixed(1)} J/K (absorbiendo ${(q/1000).toFixed(1)}kJ a ${t}K).`;
  const absorbe = dS >= 0;
  const _insight = {
    title: __lang === 'en' ? 'Reading the result' : 'Cómo leer el resultado',
    text: __lang === 'en'
      ? `At a phase change temperature stays fixed at **${t} K** while the system ${absorbe ? 'absorbs' : 'releases'} **${(q/1000).toFixed(1)} kJ**, so entropy ${absorbe ? 'rises' : 'falls'} by **${dS.toFixed(2)} J/K**. The colder the transition, the larger the entropy change for the same heat.`
      : `En un cambio de fase la temperatura queda fija en **${t} K** mientras el sistema ${absorbe ? 'absorbe' : 'libera'} **${(q/1000).toFixed(1)} kJ**, así que la entropía ${absorbe ? 'aumenta' : 'disminuye'} en **${dS.toFixed(2)} J/K**. Cuanto más fría la transición, mayor el cambio de entropía para el mismo calor.`,
    tone: absorbe ? 'good' : 'warn',
    icon: '🧊',
  };
  return { deltaS: dS.toFixed(2) + ' J/K', resumen, _insight };
}
