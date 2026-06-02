export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function creatinaDosisPesoCargaMantenimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Combining **${v1}** and **${v2}** gives **${r.toFixed(1)}**. Adjust either value to see how the result changes.`
      : `Combinando **${v1}** y **${v2}** obtenés **${r.toFixed(1)}**. Cambiá cualquiera de los dos valores para ver cómo varía el resultado.`,
    tone: 'neutral',
    icon: '🧮',
  };
  return { resultado:r.toFixed(1), resumen, _insight };
}
