export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cortinasMedirTelaVentanaAnchotelaje(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Fabric estimate' : 'Tela estimada',
    text: __lang === 'en'
      ? `With a window width of **${v1}** and a fullness factor of **×${v2}**, you need **${r.toFixed(2)}** of fabric. Add 25 cm for hems before buying.`
      : `Con un ancho de ventana de **${v1}** y un factor de telaje de **×${v2}**, necesitás **${r.toFixed(2)}** de tela. Sumá 25 cm de dobladillo antes de comprar.`,
    tone: 'neutral',
    icon: '🪟',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
