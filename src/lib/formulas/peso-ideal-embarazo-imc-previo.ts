export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function pesoIdealEmbarazoImcPrevio(i: Inputs): Outputs {
  const p=Number(i.pesoPrevio)||0; const h=Number(i.alturaMts)||0; const g=String(i.gemelar||'no')==='si';
  if (h===0) return { imcPrevio:'—', rangoKg:'—', semanal:'—', resumen:'Falta altura.' };
  const imc=p/(h*h);
  let r:[number,number];
  let categoria:string; let tone:'good'|'warn'|'neutral';
  if (imc<18.5) { r=[12.5,18]; categoria='bajo peso'; tone='warn'; }
  else if (imc<25) { r=[11.5,16]; categoria='peso normal'; tone='good'; }
  else if (imc<30) { r=[7,11.5]; categoria='sobrepeso'; tone='warn'; }
  else { r=[5,9]; categoria='obesidad'; tone='warn'; }
  if (g) r=[r[0]+5,r[1]+10];

  const _insight = {
    title: `IMC pregestacional: ${categoria}`,
    text: `Con un IMC previo de **${imc.toFixed(1)}** (${categoria})${g?' y embarazo **gemelar**':''}, la ganancia total recomendada es de **${r[0]}-${r[1]} kg** durante todo el embarazo, o sea **${(r[0]/26).toFixed(2)}-${(r[1]/26).toFixed(2)} kg por semana** en los dos últimos trimestres.`,
    tone,
    icon: '🤰',
  };

  const _chart = {
    type: 'scale',
    marker: Number(imc.toFixed(1)),
    markerLabel: `IMC ${imc.toFixed(1)}`,
    min: 14,
    segments: [
      { nombre: 'Bajo peso', max: 18.5, color: '#60a5fa', colorDark: '#3b82f6' },
      { nombre: 'Normal', max: 25, color: '#34d399', colorDark: '#10b981' },
      { nombre: 'Sobrepeso', max: 30, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Obesidad', max: Math.max(40, Math.ceil(imc) + 1), color: '#f87171', colorDark: '#ef4444' },
    ],
    ariaLabel: `Tu IMC pregestacional ${imc.toFixed(1)} cae en la zona de ${categoria}`,
  };

  return { imcPrevio:imc.toFixed(1), rangoKg:`${r[0]}-${r[1]} kg`, semanal:`${(r[0]/26).toFixed(2)}-${(r[1]/26).toFixed(2)} kg/sem`, resumen:`IMC ${imc.toFixed(1)}${g?' gemelar':''}: ganar ${r[0]}-${r[1]} kg total.`, _insight, _chart };
}
