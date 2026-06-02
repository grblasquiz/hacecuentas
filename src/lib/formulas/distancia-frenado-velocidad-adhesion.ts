export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; }
export function distanciaFrenadoVelocidadAdhesion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const vk=Number(i.v)||0; const mu=Number(i.mu)||0.7; const tr=Number(i.treac)||1;
  const v=vk/3.6;
  const dr=v*tr; const df=v*v/(2*mu*9.81);
  const total = dr + df;
  const resumen = __lang === 'en'
    ? `At ${vk}km/h: reaction ${dr.toFixed(0)}m + braking ${df.toFixed(0)}m = ${total.toFixed(0)}m total.`
    : `A ${vk}km/h: reacción ${dr.toFixed(0)}m + frenado ${df.toFixed(0)}m = ${total.toFixed(0)}m total.`;
  const drR = Number(dr.toFixed(1));
  const dfR = Number(df.toFixed(1));
  const totR = Number(total.toFixed(1));
  const reacPct = total > 0 ? Math.round((dr / total) * 100) : 0;
  const _insight = __lang === 'en'
    ? {
        title: 'Total stopping distance',
        text: `At **${vk} km/h** you need about **${totR} m** to stop: **${drR} m** while you react (${tr}s) plus **${dfR} m** of actual braking. The braking portion grows with the *square* of speed, so it dominates as you go faster.`,
        tone: 'warn',
        icon: '🚗',
      }
    : {
        title: 'Distancia total de frenado',
        text: `A **${vk} km/h** necesitás unos **${totR} m** para detenerte: **${drR} m** mientras reaccionás (${tr}s) más **${dfR} m** de frenado real. La parte de frenado crece con el *cuadrado* de la velocidad, así que domina cuanto más rápido vas.`,
        tone: 'warn',
        icon: '🚗',
      };
  const donutTotal = Number((drR + dfR).toFixed(1));
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? `Reaction (${reacPct}%)` : `Reacción (${reacPct}%)`, value: drR },
      { label: __lang === 'en' ? 'Braking' : 'Frenado', value: dfR },
    ],
    prefix: '',
    centerValue: `${donutTotal} m`,
    centerLabel: __lang === 'en' ? 'total' : 'total',
    ariaLabel: __lang === 'en'
      ? `Total stopping distance of ${donutTotal} meters split into reaction and braking`
      : `Distancia total de frenado de ${donutTotal} metros dividida en reacción y frenado`,
  };
  return { reaccion:`${drR} m`, frenado:`${dfR} m`, total:`${totR} m`, resumen, _insight, _chart };
}
