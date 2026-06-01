export interface BateriaCapacidadRuntimeAhInputs { ah: number; v: number; consumo: number; dod: number; eficiencia?: number; __lang?: string; }
export interface BateriaCapacidadRuntimeAhOutputs { horas: string; wh: string; resumen: string; }
export function bateriaCapacidadRuntimeAh(i: BateriaCapacidadRuntimeAhInputs): BateriaCapacidadRuntimeAhOutputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const ah = Number(i.ah); const v = Number(i.v); const w = Number(i.consumo);
  const dod = Number(i.dod) / 100; const eff = Number(i.eficiencia ?? 95) / 100;
  if (!ah || !v || !w) throw new Error(__lang === 'en' ? 'Enter Ah, V and consumption' : __lang === 'pt' ? 'Informe Ah, V e consumo' : 'Ingresá Ah, V y consumo');
  const whUtil = ah * v * dod * eff;
  const horas = whUtil / w;
  return {
    horas: horas >= 1 ? horas.toFixed(1) + ' h' : (horas * 60).toFixed(0) + ' min',
    wh: whUtil.toFixed(0) + ' Wh',
    resumen: __lang === 'en'
      ? `${ah}Ah ${v}V battery powers ${w}W for ${horas.toFixed(1)} h with DoD ${(dod*100).toFixed(0)}% and efficiency ${(eff*100).toFixed(0)}%.`
      : __lang === 'pt'
      ? `Bateria ${ah}Ah ${v}V alimenta ${w}W por ${horas.toFixed(1)} h com DoD ${(dod*100).toFixed(0)}% e eficiência ${(eff*100).toFixed(0)}%.`
      : `Batería ${ah}Ah ${v}V alimenta ${w}W durante ${horas.toFixed(1)} h con DoD ${(dod*100).toFixed(0)}% y eficiencia ${(eff*100).toFixed(0)}%.`
  };
}
