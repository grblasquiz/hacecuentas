export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function pinturaMueblesBarnizLataCobertura(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumenText = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Coverage to buy' : 'Cobertura a comprar',
    text: __lang === 'en'
      ? `This lata covers about **${r.toFixed(2)}** with the figures entered. Add a 10% margin (~**${(r * 0.1).toFixed(2)}**) for a second coat and touch-ups on edges and corners.`
      : `Esta lata cubre cerca de **${r.toFixed(2)}** con los datos cargados. Sumá un 10% de margen (~**${(r * 0.1).toFixed(2)}**) para la segunda mano y los retoques en cantos y esquinas.`,
    tone: 'neutral' as const,
    icon: '🪑',
  };
  return { resultado:r.toFixed(2), resumen:resumenText, _insight };
}
