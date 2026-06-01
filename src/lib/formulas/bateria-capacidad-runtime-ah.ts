export interface BateriaCapacidadRuntimeAhInputs { ah: number; v: number; consumo: number; dod: number; eficiencia?: number; __lang?: string; }
export interface BateriaCapacidadRuntimeAhOutputs { horas: string; wh: string; resumen: string; _insight?: any; }
export function bateriaCapacidadRuntimeAh(i: BateriaCapacidadRuntimeAhInputs): BateriaCapacidadRuntimeAhOutputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const ah = Number(i.ah); const v = Number(i.v); const w = Number(i.consumo);
  const dod = Number(i.dod) / 100; const eff = Number(i.eficiencia ?? 95) / 100;
  if (!ah || !v || !w) throw new Error(__lang === 'en' ? 'Enter Ah, V and consumption' : __lang === 'pt' ? 'Informe Ah, V e consumo' : 'Ingresá Ah, V y consumo');
  const whUtil = ah * v * dod * eff;
  const horas = whUtil / w;
  const whNominal = ah * v;
  const perdidoPct = whNominal > 0 ? (1 - whUtil / whNominal) * 100 : 0;
  const horasFmt = horas >= 1 ? horas.toFixed(1) + ' h' : (horas * 60).toFixed(0) + ' min';
  const tone = horas < 1 ? 'warn' : horas >= 5 ? 'good' : 'neutral';
  const insight = {
    title: __lang === 'en' ? 'Real runtime' : __lang === 'pt' ? 'Autonomia real' : 'Autonomía real',
    text: __lang === 'en'
      ? `Of the **${whNominal.toFixed(0)} Wh** nominal, only **${whUtil.toFixed(0)} Wh** are usable (DoD ${(dod*100).toFixed(0)}% + ${(perdidoPct).toFixed(0)}% lost to efficiency), giving **${horasFmt}** at ${w} W.`
      : __lang === 'pt'
      ? `Dos **${whNominal.toFixed(0)} Wh** nominais, só **${whUtil.toFixed(0)} Wh** são utilizáveis (DoD ${(dod*100).toFixed(0)}% + ${(perdidoPct).toFixed(0)}% perdidos na eficiência), o que dá **${horasFmt}** a ${w} W.`
      : `De los **${whNominal.toFixed(0)} Wh** nominales, solo **${whUtil.toFixed(0)} Wh** son aprovechables (DoD ${(dod*100).toFixed(0)}% + ${(perdidoPct).toFixed(0)}% perdido en eficiencia), lo que da **${horasFmt}** a ${w} W.`,
    tone,
    icon: '🔋'
  };
  return {
    horas: horasFmt,
    wh: whUtil.toFixed(0) + ' Wh',
    resumen: __lang === 'en'
      ? `${ah}Ah ${v}V battery powers ${w}W for ${horas.toFixed(1)} h with DoD ${(dod*100).toFixed(0)}% and efficiency ${(eff*100).toFixed(0)}%.`
      : __lang === 'pt'
      ? `Bateria ${ah}Ah ${v}V alimenta ${w}W por ${horas.toFixed(1)} h com DoD ${(dod*100).toFixed(0)}% e eficiência ${(eff*100).toFixed(0)}%.`
      : `Batería ${ah}Ah ${v}V alimenta ${w}W durante ${horas.toFixed(1)} h con DoD ${(dod*100).toFixed(0)}% y eficiencia ${(eff*100).toFixed(0)}%.`,
    _insight: insight
  };
}
