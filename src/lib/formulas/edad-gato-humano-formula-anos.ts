export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function edadGatoHumanoFormulaAnos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`;

  const _insight = {
    title: __lang === 'en' ? 'Result' : 'Resultado',
    text: __lang === 'en'
      ? `Applying the formula **${v1} × ${v2} ÷ 10** gives **${r.toFixed(2)}**.`
      : `Aplicando la fórmula **${v1} × ${v2} ÷ 10** obtenés **${r.toFixed(2)}**.`,
    tone: 'neutral',
    icon: '🐱',
  };

  return { resultado:r.toFixed(2), resumen, _insight };
}
