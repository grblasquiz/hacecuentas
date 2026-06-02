export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tiemposCoccionVerdurasAlVaporHervido(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : __lang === 'pt' ? 'Seu resultado' : 'Tu resultado',
    text: __lang === 'en'
      ? `The result is **${r.toFixed(2)}**. As a guide, steaming keeps more nutrients than boiling and usually needs a couple of extra minutes.`
      : __lang === 'pt'
      ? `O resultado é **${r.toFixed(2)}**. Como referência, cozinhar no vapor preserva mais nutrientes que ferver e costuma levar alguns minutos a mais.`
      : `El resultado es **${r.toFixed(2)}**. Como referencia, cocinar al vapor conserva más nutrientes que hervir y suele tardar un par de minutos más.`,
    tone: 'neutral',
    icon: '🥦',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
