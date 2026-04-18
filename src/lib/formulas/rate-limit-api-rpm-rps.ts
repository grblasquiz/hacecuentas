export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rateLimitApiRpmRps(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const u=String(i.unidad||'RPS');
  const toRps:Record<string,number>={RPS:1,RPM:1/60,RPH:1/3600,RPD:1/86400};
  const rps=v*toRps[u];
  return { rps:`${rps.toFixed(4)}`, rpm:`${(rps*60).toFixed(1)}`, rpd:`${(rps*86400).toLocaleString()}`, resumen:`${v} ${u} = ${rps.toFixed(2)} req/seg.` };
}
