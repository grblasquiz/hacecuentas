export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function jpgCalidadTamanoWebOptimizacion(i: Inputs): Outputs {
  const mp=Number(i.mpx)||0; const q=Number(i.calidad)||85;
  const kb=mp*120*(q/85)**1.5;
  let rec='OK'; if (q>=95) rec='Excesivo para web'; else if (q<70) rec='Artefactos visibles';
  const kbR = Number(kb.toFixed(0));
  const _insight = {
    title: q >= 95 ? 'Calidad excesiva para web' : q < 70 ? 'Riesgo de artefactos' : 'Buen balance peso/calidad',
    text: q >= 95
      ? `Una JPG de **${mp} MP** al **${q}%** pesa ~**${kbR} KB**. Para web es **excesivo**: bajando a 80-85% reducís mucho el peso sin diferencia visible.`
      : q < 70
        ? `Al **${q}%** una JPG de **${mp} MP** pesa solo ~**${kbR} KB**, pero a esa calidad aparecen **artefactos** (bloques, halos). Subí a 75-85% para que se vea limpia.`
        : `Una JPG de **${mp} MP** al **${q}%** pesa ~**${kbR} KB**: buen punto para web, peso contenido sin pérdida visible. Considerá WebP/AVIF para bajar aún más.`,
    tone: q >= 95 || q < 70 ? 'warn' : 'good',
    icon: q >= 95 ? '🐘' : q < 70 ? '🧩' : '🖼️',
  };
  const _chart = {
    type: 'scale',
    marker: q,
    markerLabel: `${q}%`,
    min: 0,
    segments: [
      { nombre: 'Artefactos', max: 69, color: '#fca5a5', colorDark: '#ef4444' },
      { nombre: 'Óptimo web', max: 94, color: '#86efac', colorDark: '#22c55e' },
      { nombre: 'Excesivo', max: 100, color: '#fdba74', colorDark: '#f97316' },
    ],
    ariaLabel: `Calidad JPG: ${q}%, zona ${rec}`,
  };
  return { tamano:`${kbR} KB`, recomendacion:rec, resumen:`${mp}MP a ${q}% ≈ ${kbR} KB.`, _insight, _chart };
}
