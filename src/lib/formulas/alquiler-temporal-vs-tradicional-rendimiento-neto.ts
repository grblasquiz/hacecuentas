export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function alquilerTemporalVsTradicionalRendimientoNeto(i: Inputs): Outputs {
  const v=Number(i.valorPropiedad)||0; const t=Number(i.alquilerTemporalMes)||0; const tr=Number(i.alquilerTradicionalMes)||0; const oc=Number(i.ocupacion)||70;
  const anualTemp=t*12*oc/100*0.75; // 25% costos extra
  const anualTrad=tr*12*0.9;
  const rTemp=v>0?anualTemp/v*100:0;
  const rTrad=v>0?anualTrad/v*100:0;
  const dif=anualTemp-anualTrad;
  return { rendimientoTemporal:`${rTemp.toFixed(1)}% (USD ${Math.round(anualTemp).toLocaleString('en-US')}/año)`, rendimientoTradicional:`${rTrad.toFixed(1)}% (USD ${Math.round(anualTrad).toLocaleString('en-US')}/año)`, diferencia:`${dif>=0?'+':''}USD ${Math.round(dif).toLocaleString('en-US')}/año` };
}
