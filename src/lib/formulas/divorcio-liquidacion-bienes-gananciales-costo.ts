export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function divorcioLiquidacionBienesGanancialesCosto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      tiempo_acuerdo: '2-4 meses',
      tiempo_contradictorio: '1-3 años',
      obs_acuerdo: 'Divorcio por acuerdo: más rápido, conviene siempre que se pueda.',
      obs_contradictorio: 'Contradictorio: mayores costos + tiempo.',
    },
    en: {
      tiempo_acuerdo: '2-4 months',
      tiempo_contradictorio: '1-3 years',
      obs_acuerdo: 'Agreed divorce: faster, always recommended when possible.',
      obs_contradictorio: 'Contested: higher costs + longer timeframe.',
    },
    pt: {
      tiempo_acuerdo: '2-4 meses',
      tiempo_contradictorio: '1-3 anos',
      obs_acuerdo: 'Divórcio consensual: mais rápido, sempre recomendado quando possível.',
      obs_contradictorio: 'Litigioso: custos mais altos + prazo mais longo.',
    },
  } as const)[__lang];
  const b=Number(i.bienes)||0; const a=String(i.acuerdo||'acuerdo');
  const pct=a==='acuerdo'?0.06:0.12;
  const hon=Math.max(b*pct,1500000);
  const t=a==='acuerdo'?T.tiempo_acuerdo:T.tiempo_contradictorio;
  return { honorariosEstimados:`$${Math.round(hon).toLocaleString('es-AR')}`, tiempo:t, observacion:a==='acuerdo'?T.obs_acuerdo:T.obs_contradictorio };
}
