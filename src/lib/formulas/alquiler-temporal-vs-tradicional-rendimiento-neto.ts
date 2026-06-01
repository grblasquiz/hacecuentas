export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function alquilerTemporalVsTradicionalRendimientoNeto(i: Inputs): Outputs {
  const v=Number(i.valorPropiedad)||0; const t=Number(i.alquilerTemporalMes)||0; const tr=Number(i.alquilerTradicionalMes)||0; const oc=Number(i.ocupacion)||70;
  const anualTemp=t*12*oc/100*0.75; // 25% costos extra
  const anualTrad=tr*12*0.9;
  const rTemp=v>0?anualTemp/v*100:0;
  const rTrad=v>0?anualTrad/v*100:0;
  const dif=anualTemp-anualTrad;
  const difAbs=Math.abs(Math.round(dif)).toLocaleString('en-US');
  const ganaTemp=dif>=0;
  const insText=ganaTemp
    ? `Con **${oc}%** de ocupación, el alquiler temporal rinde **${rTemp.toFixed(1)}%** vs **${rTrad.toFixed(1)}%** del tradicional: **USD ${difAbs}/año** más. Te conviene el temporal, pero exige más gestión y la ocupación es el factor crítico.`
    : `Pese al precio por noche más alto, el temporal rinde **${rTemp.toFixed(1)}%** vs **${rTrad.toFixed(1)}%** del tradicional con **${oc}%** de ocupación: pierde **USD ${difAbs}/año**. El tradicional gana por estabilidad y menos costos.`;
  return { rendimientoTemporal:`${rTemp.toFixed(1)}% (USD ${Math.round(anualTemp).toLocaleString('en-US')}/año)`, rendimientoTradicional:`${rTrad.toFixed(1)}% (USD ${Math.round(anualTrad).toLocaleString('en-US')}/año)`, diferencia:`${dif>=0?'+':''}USD ${Math.round(dif).toLocaleString('en-US')}/año`,
    _insight: { title: ganaTemp ? 'Gana el alquiler temporal' : 'Gana el alquiler tradicional', text: insText, tone: ganaTemp ? 'good' : 'neutral', icon: '🏖️' } };
}
