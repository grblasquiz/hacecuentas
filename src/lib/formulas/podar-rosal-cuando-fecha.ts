export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
  return { mejorEpoca: epoca, resumen };
}
