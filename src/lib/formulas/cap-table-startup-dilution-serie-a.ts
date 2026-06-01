export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function capTableStartupDilutionSerieA(i: Inputs): Outputs {
  const pre=Number(i.equityPreRound)||0; const inv=Number(i.porcentajeInversor)||0;
  const post=pre*(1-inv/100);
  const dil=pre-post;
  const dilPct = pre > 0 ? (dil/pre)*100 : 0;
  // Dilución relativa alta (>25% de lo tuyo) merece atención
  const tone = dilPct >= 25 ? 'warn' : (dilPct >= 12 ? 'neutral' : 'good');
  const _insight = {
    title: dilPct >= 25 ? 'Dilución fuerte en esta ronda' : 'Dilución bajo control',
    text: `El inversor tomó **${inv}%** de la compañía, así que tu **${pre.toFixed(1)}%** baja a **${post.toFixed(1)}%** (resignás un **${dilPct.toFixed(0)}%** de tu posición). ${dilPct >= 25 ? 'Cuidá el cap table en las próximas rondas: dilución compuesta achica mucho al fundador.' : 'Es un nivel razonable para una Serie A; te queda margen para futuras rondas.'}`,
    tone,
    icon: '📉',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Te queda (post)', value: Number(post.toFixed(2)) },
      { label: 'Diluido en la ronda', value: Number(dil.toFixed(2)) },
    ],
    prefix: '',
    centerValue: `${post.toFixed(1)}%`,
    centerLabel: 'Tu equity post',
    ariaLabel: `De tu ${pre.toFixed(1)}% pre-ronda, te quedan ${post.toFixed(1)}% y se diluyen ${dil.toFixed(1)} puntos.`,
  };
  return { equityPost:`${post.toFixed(1)}%`, dilucion:`-${dil.toFixed(1)}pp (${dilPct.toFixed(0)}%)`, observacion:`Inversor tomó ${inv}%, diluíste proporcionalmente. Post: ${post.toFixed(1)}%.`, _insight, _chart };
}
