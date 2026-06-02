export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function divorcioLiquidacionBienesGanancialesCosto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      tiempo_acuerdo: '2-4 meses',
      tiempo_contradictorio: '1-3 años',
      obs_acuerdo: 'Divorcio por acuerdo: más rápido, conviene siempre que se pueda.',
      obs_contradictorio: 'Contradictorio: mayores costos + tiempo.',
      insight_title: 'Honorarios de liquidación',
      insight_acuerdo: (hon: string, pct: number, t: string) =>
        `Por acuerdo, liquidar los bienes cuesta unos **${hon}** (${pct}% del patrimonio, con piso de $1.500.000) y demora **${t}**. Es la vía más barata: evitás el recargo del litigio.`,
      insight_contra: (hon: string, pct: number, t: string) =>
        `En la vía contradictoria los honorarios suben a **${hon}** (${pct}% del patrimonio) y el proceso se estira **${t}**. Negociar un acuerdo recorta tanto el costo como el plazo.`,
    },
    en: {
      tiempo_acuerdo: '2-4 months',
      tiempo_contradictorio: '1-3 years',
      obs_acuerdo: 'Agreed divorce: faster, always recommended when possible.',
      obs_contradictorio: 'Contested: higher costs + longer timeframe.',
      insight_title: 'Asset settlement fees',
      insight_acuerdo: (hon: string, pct: number, t: string) =>
        `By agreement, settling the assets costs about **${hon}** (${pct}% of the estate, with a $1,500,000 floor) and takes **${t}**. It is the cheapest route: you avoid the litigation surcharge.`,
      insight_contra: (hon: string, pct: number, t: string) =>
        `In the contested route, fees rise to **${hon}** (${pct}% of the estate) and the process stretches to **${t}**. Reaching an agreement cuts both the cost and the timeline.`,
    },
    pt: {
      tiempo_acuerdo: '2-4 meses',
      tiempo_contradictorio: '1-3 anos',
      obs_acuerdo: 'Divórcio consensual: mais rápido, sempre recomendado quando possível.',
      obs_contradictorio: 'Litigioso: custos mais altos + prazo mais longo.',
      insight_title: 'Honorários da partilha',
      insight_acuerdo: (hon: string, pct: number, t: string) =>
        `No consenso, partilhar os bens custa cerca de **${hon}** (${pct}% do patrimônio, com piso de $1.500.000) e leva **${t}**. É a via mais barata: você evita o acréscimo do litígio.`,
      insight_contra: (hon: string, pct: number, t: string) =>
        `Na via litigiosa os honorários sobem para **${hon}** (${pct}% do patrimônio) e o processo se estende por **${t}**. Negociar um acordo reduz tanto o custo quanto o prazo.`,
    },
  } as const)[__lang];
  const b=Number(i.bienes)||0; const a=String(i.acuerdo||'acuerdo');
  const pct=a==='acuerdo'?0.06:0.12;
  const hon=Math.max(b*pct,1500000);
  const t=a==='acuerdo'?T.tiempo_acuerdo:T.tiempo_contradictorio;
  const honFmt=`$${Math.round(hon).toLocaleString('es-AR')}`;
  return {
    honorariosEstimados:honFmt, tiempo:t, observacion:a==='acuerdo'?T.obs_acuerdo:T.obs_contradictorio,
    _insight: {
      title: T.insight_title,
      text: a==='acuerdo' ? T.insight_acuerdo(honFmt, pct*100, t) : T.insight_contra(honFmt, pct*100, t),
      tone: a==='acuerdo' ? 'good' : 'warn',
      icon: '⚖️',
    },
  };
}
