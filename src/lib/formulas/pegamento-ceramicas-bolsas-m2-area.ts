export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function pegamentoCeramicasBolsasM2Area(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const rFmt = r.toFixed(2);
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${rFmt}.`
    : `Cálculo: ${v1} × ${v2} = ${rFmt}.`;
  const _insight = {
    title: __lang === 'en' ? 'Adhesive needed' : 'Pegamento necesario',
    text: __lang === 'en'
      ? `You need about **${rFmt}** bags of adhesive for that area. Buy one spare bag: cuts, leveling and waste usually push real consumption above the estimate.`
      : `Vas a necesitar unas **${rFmt}** bolsas de pegamento para esa superficie. Comprá una bolsa de más: cortes, nivelación y desperdicio suelen empujar el consumo real por encima de la estimación.`,
    tone: 'neutral',
    icon: '🧱',
  };
  return { resultado:rFmt, resumen, _insight };
}
