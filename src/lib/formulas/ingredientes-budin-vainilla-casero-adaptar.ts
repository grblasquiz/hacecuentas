export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ingredientesBudinVainillaCaseroAdaptar(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Adjusted amount' : 'Cantidad ajustada',
    text: __lang === 'en'
      ? `Scaling **${v1}** by a factor of **${v2}** gives **${r.toFixed(2)}**. Apply the same factor to every ingredient so the vanilla loaf keeps its balance.`
      : `Escalando **${v1}** por un factor de **${v2}** da **${r.toFixed(2)}**. Aplicá el mismo factor a cada ingrediente para que el budín de vainilla mantenga su equilibrio.`,
    tone: 'neutral',
    icon: '🍰'
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
