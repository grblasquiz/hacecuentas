export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function eficienciaCarnotTermodinamica(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errInputs: 'Completá T_h y T_c',
      errOrder: 'T fría debe ser menor',
    },
    en: {
      errInputs: 'Enter T_h and T_c',
      errOrder: 'Cold temperature must be lower',
    },
  } as const)[__lang];
  const tc = Number(i.tCalor); const tf = Number(i.tFrio);
  if (!tc || !tf) throw new Error(T.errInputs);
  if (tf >= tc) throw new Error(T.errOrder);
  const eta = 1 - tf / tc;
  return {
    eficiencia: (eta * 100).toFixed(2) + '%',
    resumen: __lang === 'en'
      ? `Max Carnot efficiency ${(eta*100).toFixed(1)}% between ${tc}K and ${tf}K.`
      : `Eficiencia Carnot máx ${(eta*100).toFixed(1)}% entre ${tc}K y ${tf}K.`,
  };
}
