export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function ramRecomendadaUsoComputadora(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const uso=String(i.uso||'basico');
  const t:Record<string,[string,string,string]>={basico:['4 GB','8 GB','16 GB'],gaming:['8 GB','16 GB','32 GB'],dev:['16 GB','32 GB','64 GB'],creativo:['16 GB','32 GB','128 GB'],servidor:['8 GB','32 GB','256 GB']};
  const [m,r,id]=t[uso]||t.basico;
  const resumen = __lang === 'en' ? `Use ${uso}: recommended ${r} RAM.` : `Uso ${uso}: recomendado ${r} RAM.`;

  const usoLabel: Record<string, [string, string]> = {
    basico: ['uso básico (ofimática y web)', 'basic use (office and web)'],
    gaming: ['gaming', 'gaming'],
    dev: ['desarrollo de software', 'software development'],
    creativo: ['edición de video y diseño', 'video editing and design'],
    servidor: ['servidor', 'server'],
  };
  const [labelEs, labelEn] = usoLabel[uso] || usoLabel.basico;

  const _insight = {
    title: __lang === 'en' ? 'How much RAM you actually need' : 'Cuánta RAM te conviene',
    text: __lang === 'en'
      ? `For **${labelEn}**, aim for **${r}**: ${m} is the bare minimum (you'll feel the swap), and ${id} is overkill unless you push heavy workloads. The sweet spot for price-performance is the recommended tier.`
      : `Para **${labelEs}**, apuntá a **${r}**: ${m} es el mínimo justo (vas a notar el swap) y ${id} es excesivo salvo cargas pesadas. El punto óptimo precio-rendimiento es el nivel recomendado.`,
    tone: 'neutral' as const,
    icon: '🧮',
  };

  return { minimo:m, recomendado:r, ideal:id, resumen, _insight };
}
