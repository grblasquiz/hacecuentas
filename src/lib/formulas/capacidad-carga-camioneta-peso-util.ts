export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function capacidadCargaCamionetaPesoUtil(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.pbt)||0; const t=Number(i.tara)||0;
  const u=p-t;
  const resumen = __lang === 'en'
    ? `GVW ${p} - Tare ${t} = ${u} kg payload.`
    : `PBT ${p} - Tara ${t} = ${u} kg útiles.`;
  return { util:`${u} kg`, resumen };
}
