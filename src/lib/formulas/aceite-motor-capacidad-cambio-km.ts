export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function aceiteMotorCapacidadCambioKm(i: Inputs): Outputs {
  const t=String(i.tipo||'mineral'); const km=Number(i.kmActual)||0;
  const iv:Record<string,number>={mineral:5000,semi:7500,sint:10000,sintLong:20000};
  const int=iv[t]||5000;
  const prox=km+int;
  return { proximo:prox.toLocaleString()+' km', km:int.toLocaleString()+' km', resumen:`${t}: próximo cambio a ${prox.toLocaleString()} km.` };
}
