export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function seguroAutoComparativaCoberturaTipo(i: Inputs): Outputs {
  const t=String(i.tipo||'terceros_completo'); const v=Number(i.valorVehiculo)||0;
  const rate={'terceros':0.015,'terceros_completo':0.03,'todo_riesgo':0.045,'todo_riesgo_sin_franquicia':0.06}[t];
  const prem=v*rate;
  const cob={'terceros':'Solo daños a terceros','terceros_completo':'+ robo/incendio parcial','todo_riesgo':'+ daños propios con franquicia','todo_riesgo_sin_franquicia':'+ sin franquicia'}[t];
  const rec=v>15000000?'Todo riesgo recomendado':v>5000000?'Terceros completo':'Terceros puede bastar';
  const nombreTipo={'terceros':'Terceros','terceros_completo':'Terceros completo','todo_riesgo':'Todo riesgo','todo_riesgo_sin_franquicia':'Todo riesgo sin franquicia'}[t]||'cobertura';
  const pctValor=((prem/(v||1))*100).toFixed(1);
  const mensualFmt=`$${Math.round(prem/12).toLocaleString('es-AR')}`;
  const _insight = {
    title: 'Tu prima anual estimada',
    text: `La cobertura **${nombreTipo}** sobre un auto de **$${v.toLocaleString('es-AR')}** cuesta unas **$${Math.round(prem).toLocaleString('es-AR')}/año** (~${mensualFmt}/mes), equivalente al **${pctValor}%** del valor. ${rec}.`,
    tone: 'neutral',
    icon: '🚗',
  };
  return { premiumAnual:`$${Math.round(prem).toLocaleString('es-AR')}`, cobertura:cob, recomendacion:rec, _insight } as Outputs;
}
