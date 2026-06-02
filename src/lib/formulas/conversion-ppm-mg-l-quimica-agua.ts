export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionPpmMgLQuimicaAgua(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 1.0;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'ppm' : 'mg/L';
  const toU = u === 'a' ? 'mg/L' : 'ppm';
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`,
    _insight: {
      title: 'ppm y mg/L son lo mismo',
      text: `**${fmt.format(v)} ${fromU}** = **${fmt.format(r)} ${toU}**: en soluciones acuosas diluidas 1 ppm equivale exactamente a 1 mg/L, porque 1 litro de agua pesa ~1 kg. El número no cambia; solo cambia la unidad con que lo nombrás.`,
      tone: 'neutral' as const,
      icon: '💧',
    }
  };
}
