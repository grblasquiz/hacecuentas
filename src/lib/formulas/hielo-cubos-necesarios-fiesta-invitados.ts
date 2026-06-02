export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function hieloCubosNecesariosFiestaInvitados(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const insight = __lang === 'en'
    ? { title: 'Your result', text: `The result is **${r.toFixed(2)}** (${v1} × ${v2}). As a rule of thumb, count about **0.5 kg of ice per guest**, doubling it in hot weather.`, tone: 'neutral', icon: '🧊' }
    : { title: 'Tu resultado', text: `El resultado es **${r.toFixed(2)}** (${v1} × ${v2}). Como regla práctica, calculá unos **0,5 kg de hielo por invitado**, duplicándolo si hace calor.`, tone: 'neutral', icon: '🧊' };
  return { resultado:r.toFixed(2), resumen, _insight: insight };
}
