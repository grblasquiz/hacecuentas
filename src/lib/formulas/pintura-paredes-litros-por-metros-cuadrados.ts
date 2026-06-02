export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function pinturaParedesLitrosPorMetrosCuadrados(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Litres to buy' : 'Litros a comprar',
    text: __lang === 'en'
      ? `You need about **${r.toFixed(2)} L** with the data entered. Round up and add ~10% (**${(r * 1.1).toFixed(2)} L**) so you don't run out mid-wall or for touch-ups.`
      : `Necesitás cerca de **${r.toFixed(2)} L** con los datos cargados. Redondeá para arriba y sumá ~10% (**${(r * 1.1).toFixed(2)} L**) para no quedarte corto a mitad de pared ni en los retoques.`,
    tone: 'neutral' as const,
    icon: '🎨',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
