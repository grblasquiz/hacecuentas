export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tiempoEstudioExamenDificultadPaginas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Vas a necesitar ${r.toFixed(1)} horas de estudio (${v1} páginas ÷ ${v2} páginas por hora).`;
  const _insight = __lang === 'en'
    ? { title: 'Your result', text: `Dividing **${v1}** by **${v2}** gives **${r.toFixed(2)}**.`, tone: 'neutral', icon: '📐' }
    : { title: 'Tu resultado', text: `Dividir **${v1}** entre **${v2}** da **${r.toFixed(2)}**.`, tone: 'neutral', icon: '📐' };
  return { resultado:r.toFixed(2), resumen, _insight };
}
