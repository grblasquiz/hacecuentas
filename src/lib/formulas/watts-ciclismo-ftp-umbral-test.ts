export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function wattsCiclismoFtpUmbralTest(i: Inputs): Outputs {
  const f=Number(i.ftp)||0;
  return { zona1:`<${Math.round(f*0.55)} W`, zona2:`${Math.round(f*0.55)}-${Math.round(f*0.75)} W`, zona3:`${Math.round(f*0.75)}-${Math.round(f*0.90)} W`, zona4:`${Math.round(f*0.90)}-${Math.round(f*1.05)} W (umbral)` };
}
