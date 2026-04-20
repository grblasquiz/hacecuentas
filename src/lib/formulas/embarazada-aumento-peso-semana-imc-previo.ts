export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function embarazadaAumentoPesoSemanaImcPrevio(i: Inputs): Outputs {
  const imc=Number(i.imcPrevio)||22; const s=Number(i.semanasEmbarazo)||0;
  let min=0,max=0;
  if(imc<18.5){min=12.5;max=18}
  else if(imc<25){min=11;max=16}
  else if(imc<30){min=7;max=11.5}
  else {min=5;max=9}
  const prog=s/40;
  const aumSemMin=min*prog*0.9;
  const aumSemMax=max*prog;
  return { aumentoEsperadoSemana:`${aumSemMin.toFixed(1)}-${aumSemMax.toFixed(1)} kg hasta semana ${s}`, aumentoTotal:`${min}-${max} kg total`, observacion:`IMC previo ${imc.toFixed(1)}: rango basado en IOM 2009.` };
}
