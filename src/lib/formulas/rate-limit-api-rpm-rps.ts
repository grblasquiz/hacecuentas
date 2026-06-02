export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function rateLimitApiRpmRps(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const u=String(i.unidad||'RPS');
  const toRps:Record<string,number>={RPS:1,RPM:1/60,RPH:1/3600,RPD:1/86400};
  const rps=v*toRps[u];

  // Intervalo entre requests (segundos) para lectura humana
  const intervalo = rps > 0 ? 1 / rps : 0;
  let intervaloTxt = '';
  if (rps > 0) {
    if (intervalo < 1) intervaloTxt = `cada **${(intervalo * 1000).toFixed(0)} ms**`;
    else if (intervalo < 60) intervaloTxt = `cada **${intervalo.toFixed(1)} seg**`;
    else intervaloTxt = `cada **${(intervalo / 60).toFixed(1)} min**`;
  }

  const _insight = {
    title: 'Qué significa este rate limit',
    text: rps > 0
      ? `Un límite de **${rps.toFixed(2)} req/seg** equivale a 1 request ${intervaloTxt}, o **${(rps * 86400).toLocaleString('es-AR', { maximumFractionDigits: 0 })} requests por día**. Para no chocar el límite conviene espaciar las llamadas o agregar un backoff cuando recibís 429.`
      : `Ingresá un valor mayor a cero para ver el equivalente en req/seg, req/min y req/día.`,
    tone: 'neutral' as const,
    icon: '🚦',
  };

  return { rps:`${rps.toFixed(4)}`, rpm:`${(rps*60).toFixed(1)}`, rpd:`${(rps*86400).toLocaleString()}`, resumen:`${v} ${u} = ${rps.toFixed(2)} req/seg.`, _insight };
}
