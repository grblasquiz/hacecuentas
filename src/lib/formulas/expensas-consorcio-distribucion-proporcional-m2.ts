export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function expensasConsorcioDistribucionProporcionalM2(i: Inputs): Outputs {
  const t=Number(i.totalExpensa)||0; const m=Number(i.m2UnidadTuya)||0; const me=Number(i.m2Edificio)||1;
  const pct=m/me; const tu=t*pct;
  const tuRound = Math.round(tu);
  const restoRound = Math.max(0, Math.round(t - tu));

  // --- Insight: tu porción frente al resto del consorcio ---
  const tone = pct >= 0.15 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Tu parte de las expensas',
    text:
      `Tus **${m} m²** representan el **${(pct*100).toFixed(2)}%** de los ${me} m² del edificio, ` +
      `así que te corresponde pagar **$${tuRound.toLocaleString('es-AR')}** de un total de $${Math.round(t).toLocaleString('es-AR')}. ` +
      `El resto del consorcio cubre los $${restoRound.toLocaleString('es-AR')} restantes.`,
    tone,
    icon: '🏢',
  };

  // --- Donut: tu unidad vs resto del edificio (suman el total) ---
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Tu unidad', value: tuRound },
      { label: 'Resto del edificio', value: restoRound },
    ],
    prefix: '$',
    centerValue: `$${Math.round(t).toLocaleString('es-AR')}`,
    centerLabel: 'Total expensas',
    ariaLabel: `Tu unidad paga $${tuRound.toLocaleString('es-AR')} y el resto del edificio $${restoRound.toLocaleString('es-AR')} del total de $${Math.round(t).toLocaleString('es-AR')}.`,
  };

  return { tuExpensa:`$${Math.round(tu).toLocaleString('es-AR')}`, porcentaje:`${(pct*100).toFixed(2)}%`, interpretacion:`Tu unidad (${m} m²) paga el ${(pct*100).toFixed(1)}% de $${(t/1000).toFixed(0)}k = $${Math.round(tu).toLocaleString('es-AR')}.`, _insight, _chart };
}
