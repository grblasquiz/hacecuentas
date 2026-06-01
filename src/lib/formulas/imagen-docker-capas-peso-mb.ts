export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function imagenDockerCapasPesoMb(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { ok: 'OK', heavy: 'Demasiado pesada, revisá capas', multistage: 'Considera multi-stage' },
    en: { ok: 'OK', heavy: 'Too heavy, review your layers', multistage: 'Consider multi-stage builds' },
  } as const)[__lang];
  const b=String(i.base||'alpine'); const dep=Number(i.deps)||0;
  const bSize:Record<string,number>={alpine:5,'debian-slim':70,ubuntu:80,distroless:20};
  const total=(bSize[b]||50)+dep;
  let cons=T.ok; if (total>500) cons=T.heavy; else if (total>200) cons=T.multistage;
  return { total:`${total} MB`, consejo:cons, resumen:`${b} + ${dep}MB deps = ${total} MB. ${cons}.` };
}
