export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function drenajeGravaMaceta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const V = Number(i.volumenMaceta) || 0;
  const min = V * 0.05; const max = V * 0.15;
  const r = (n: number) => n.toFixed(1);
  const resumen = __lang === 'en'
    ? `Drainage: ${r(min)}-${r(max)} L of gravel for a ${V} L pot.`
    : __lang === 'pt'
    ? `Drenagem: ${r(min)}-${r(max)} L de cascalho para um vaso de ${V} L.`
    : `Drenaje: ${r(min)}-${r(max)} L de grava para maceta de ${V} L.`;
  const _insight = {
    title: __lang === 'en' ? 'Drainage layer' : __lang === 'pt' ? 'Camada de drenagem' : 'Capa de drenaje',
    text: __lang === 'en'
      ? `Add a **${r(min)}–${r(max)} L** gravel layer at the bottom of your **${V} L** pot (about 5–15% of the volume) so excess water drains and roots don't rot.`
      : __lang === 'pt'
      ? `Coloque uma camada de **${r(min)}–${r(max)} L** de cascalho no fundo do vaso de **${V} L** (cerca de 5–15% do volume) para escoar o excesso de água e evitar o apodrecimento das raízes.`
      : `Poné una capa de **${r(min)}–${r(max)} L** de grava en el fondo de tu maceta de **${V} L** (un 5–15% del volumen) para que el exceso de agua drene y las raíces no se pudran.`,
    tone: 'neutral',
    icon: '🪴',
  };
  return { litrosGrava: `${r(min)}-${r(max)} L`, resumen, _insight };
}
