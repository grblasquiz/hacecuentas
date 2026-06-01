export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function bitcoinHalving2028Proyeccion(i: Inputs): Outputs {
  const p=Number(i.precioActual)||0; const m=Number(i.multiplicadorEsperado)||2;
  const pp=p*m; const gan=((m-1)*100);
  const ganUsd=pp-p;
  const usd=(n:number)=>`USD ${Math.round(n).toLocaleString('en-US')}`;
  const _insight = {
    title: 'Proyección post-halving 2028',
    text: `Con un multiplicador de **${m}×**, los **${usd(p)}** de hoy quedarían en **${usd(pp)}** (una ganancia de **${gan>=0?'+':''}${gan.toFixed(0)}%**, ${usd(Math.abs(ganUsd))}). Es un escenario hipotético: ningún ciclo garantiza el multiplicador y BTC puede caer.`,
    tone: 'warn',
    icon: '₿',
  };
  const out: Outputs = { precioPost:usd(pp), gananciaPercent:`+${gan.toFixed(0)}%`, interpretacion:`Si BTC se multiplica por ${m} tras el halving 2028: precio ~$${Math.round(pp).toLocaleString('en-US')}. Nadie garantiza el multiplicador.`, _insight };
  if (ganUsd>0 && p>0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Precio actual', value: Math.round(p) },
        { label: 'Ganancia proyectada', value: Math.round(ganUsd) },
      ],
      prefix: 'USD ',
      centerValue: usd(pp),
      centerLabel: 'Precio proyectado',
      ariaLabel: `Precio proyectado de ${usd(pp)}: ${usd(p)} del precio actual más ${usd(ganUsd)} de ganancia esperada.`,
    };
  }
  return out;
}
