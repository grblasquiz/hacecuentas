export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function capacidadCargaCamionetaPesoUtil(i: Inputs): Outputs {
  const p=Number(i.pbt)||0; const t=Number(i.tara)||0;
  const u=p-t;
  return { util:`${u} kg`, resumen:`PBT ${p} - Tara ${t} = ${u} kg útiles.` };
}
