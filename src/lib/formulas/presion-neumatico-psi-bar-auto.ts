export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function presionNeumaticoPsiBarAuto(i: Inputs): Outputs {
  const v=Number(i.v)||0; const de=String(i.de||'psi');
  let bar:number;
  if (de==='psi') bar=v/14.504; else if (de==='kpa') bar=v/100; else bar=v;
  const psiVal = bar * 14.504;
  let zona: string; let tone: 'good' | 'warn' | 'neutral';
  if (psiVal < 28) { zona = 'baja para un auto típico (subinfla el desgaste y el consumo)'; tone = 'warn'; }
  else if (psiVal <= 36) { zona = 'dentro del rango habitual de un auto de pasajeros'; tone = 'good'; }
  else if (psiVal <= 45) { zona = 'propia de SUV o pickup con carga'; tone = 'neutral'; }
  else { zona = 'alta: revisá la especificación de tu vehículo'; tone = 'warn'; }
  const _insight = {
    title: 'Tu presión en contexto',
    text: `**${bar.toFixed(2)} bar** equivalen a **${psiVal.toFixed(1)} PSI**, una presión ${zona}. Inflá siempre en frío y seguí el valor de la etiqueta del auto, no el máximo del neumático.`,
    tone,
    icon: '🛞',
  };
  return { psi:`${(bar*14.504).toFixed(1)} PSI`, bar:`${bar.toFixed(2)} bar`, kpa:`${(bar*100).toFixed(0)} kPa`, resumen:`${v} ${de} = ${bar.toFixed(2)} bar.`, _insight };
}
