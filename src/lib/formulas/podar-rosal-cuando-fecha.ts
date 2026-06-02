export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function podarRosalCuandoFecha(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const plan = ({
    es: { frio: 'Agosto-septiembre (fin invierno)', templado: 'Junio-julio (invierno)', calido: 'Mayo-junio (transición)', fallback: 'Invierno' },
    en: { frio: 'August-September (end of winter)', templado: 'June-July (winter)', calido: 'May-June (transition)', fallback: 'Winter' },
    pt: { frio: 'Agosto-setembro (fim do inverno)', templado: 'Junho-julho (inverno)', calido: 'Maio-junho (transição)', fallback: 'Inverno' },
  } as const)[__lang];
  const z = String(i.zona);
  const epoca = plan[z as keyof typeof plan] ?? plan.fallback;
  const resumen = __lang === 'en'
    ? `Best time to prune roses in zone ${z}: ${plan[z as keyof typeof plan] ?? plan.fallback}.`
    : __lang === 'pt'
    ? `Melhor época para podar roseiras na zona ${z}: ${plan[z as keyof typeof plan] ?? plan.fallback}.`
    : `Mejor época poda rosales en zona ${z}: ${plan[z as keyof typeof plan] ?? plan.fallback}.`;
  const _insight = {
    title: __lang === 'en' ? 'When to prune' : __lang === 'pt' ? 'Quando podar' : 'Cuándo podar',
    text: __lang === 'en'
      ? `Prune your roses during **${epoca}**: the dormant or transition window for your zone, when the plant has stopped active growth and the hard prune triggers strong spring sprouting.`
      : __lang === 'pt'
      ? `Pode suas roseiras em **${epoca}**: a janela de dormência ou transição da sua zona, quando a planta parou de crescer e a poda forte estimula uma brotação forte na primavera.`
      : `Podá tus rosales en **${epoca}**: la ventana de reposo o transición de tu zona, cuando la planta frenó el crecimiento y la poda fuerte dispara un buen rebrote en primavera.`,
    tone: 'good',
    icon: '🌹',
  };
  return { mejorEpoca: epoca, resumen, _insight };
}
