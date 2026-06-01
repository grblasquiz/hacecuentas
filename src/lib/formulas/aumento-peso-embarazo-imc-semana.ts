export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function aumentoPesoEmbarazoImcSemana(i: Inputs): Outputs {
  const imc=Number(i.imc)||22; const mul=String(i.multiple||'no')==='si';
  let r:[number,number]; let cat:string;
  if (imc<18.5) { r=[12.5,18]; cat='bajo peso'; } else if (imc<25) { r=[11.5,16]; cat='peso normal'; } else if (imc<30) { r=[7,11]; cat='sobrepeso'; } else { r=[5,9]; cat='obesidad'; }
  if (mul) { r=[r[0]+5,r[1]+5]; }
  const _insight = {
    title: 'Tu rango recomendado',
    text: `Con un IMC pregestacional de **${imc}** (${cat})${mul?' y embarazo **múltiple**':''}, la ganancia de peso saludable durante todo el embarazo es de **${r[0]} a ${r[1]} kg** (unos ${(r[0]/25).toFixed(2)}–${(r[1]/25).toFixed(2)} kg por semana en el 2.º y 3.º trimestre).`,
    tone: (imc<18.5 || imc>=30) ? 'warn' : 'good',
    icon: '🤰',
  };
  const _chart = {
    type: 'scale',
    marker: imc,
    markerLabel: `IMC ${imc}`,
    min: 15,
    segments: [
      { nombre: 'Bajo peso', max: 18.5, color: '#60a5fa', colorDark: '#3b82f6' },
      { nombre: 'Normal', max: 25, color: '#4ade80', colorDark: '#22c55e' },
      { nombre: 'Sobrepeso', max: 30, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Obesidad', max: Math.max(40, imc+1), color: '#f87171', colorDark: '#ef4444' },
    ],
    ariaLabel: `IMC pregestacional ${imc} ubicado en la categoría ${cat}`,
  };
  return { rango:`${r[0]}-${r[1]} kg`, semanal:`${(r[0]/25).toFixed(2)}-${(r[1]/25).toFixed(2)} kg/sem`, resumen:`IMC ${imc} ${mul?'gemelar':''}: ${r[0]}-${r[1]}kg total.`, _insight, _chart };
}
