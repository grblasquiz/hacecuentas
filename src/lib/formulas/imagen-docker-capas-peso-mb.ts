export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function imagenDockerCapasPesoMb(i: Inputs): Outputs {
  const b=String(i.base||'alpine'); const dep=Number(i.deps)||0;
  const bSize:Record<string,number>={alpine:5,'debian-slim':70,ubuntu:80,distroless:20};
  const total=(bSize[b]||50)+dep;
  let cons='OK'; if (total>500) cons='Demasiado pesada, revisá capas'; else if (total>200) cons='Considera multi-stage';
  return { total:`${total} MB`, consejo:cons, resumen:`${b} + ${dep}MB deps = ${total} MB. ${cons}.` };
}
