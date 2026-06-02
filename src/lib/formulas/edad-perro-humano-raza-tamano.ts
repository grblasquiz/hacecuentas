export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function edadPerroHumanoRazaTamano(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Combining the two values gives **${r.toFixed(2)}** (${v1} × ${v2} ÷ 10).`
      : `Combinando los dos valores da **${r.toFixed(2)}** (${v1} × ${v2} ÷ 10).`,
    tone: 'neutral' as const,
    icon: '🐶',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
