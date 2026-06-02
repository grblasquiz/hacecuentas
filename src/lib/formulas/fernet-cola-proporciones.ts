/** Fernet Cola */
export interface Inputs { personas: number; tragosPorPersona: number; mlfernetbrancaPorTrago: number; mlcocacolaPorTrago: number; mlhieloPorTrago: number; }
export interface Outputs { totalTragos: number; totalfernetbranca: string; totalcocacola: string; totalhielo: string; listaCompras: string; _insight?: any; _chart?: any; }

export function fernetColaProporciones(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const f = Number(i.mlfernetbrancaPorTrago);
  const c = Number(i.mlcocacolaPorTrago);
  const h = Number(i.mlhieloPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const botellasCoca = Math.ceil(c * tot * 1.15 / 2250); // botella 2.25L
  const lista = `Fernet: ${fmt(Math.ceil(f * tot * 1.15))} (${Math.ceil(f * tot * 1.15 / 750)} bot 750ml) | Coca: ${fmt(Math.ceil(c * tot * 1.15))} (${botellasCoca} bot 2.25L) | Hielo: ${((h * tot) / 1000).toFixed(1)}kg`;

  const fernetMl = f * tot;
  const colaMl = c * tot;
  const totalLiquidoL = (fernetMl + colaMl) / 1000;
  const botFernet = Math.ceil(fernetMl * 1.15 / 750);

  const _insight = {
    title: 'Tu lista de fernet',
    text: `**${tot}** tragos para **${p}** personas: necesitás **${botFernet}** botella${botFernet === 1 ? '' : 's'} de fernet (750 ml) y **${botellasCoca}** de coca (2,25 L), más ${((h * tot) / 1000).toFixed(1)} kg de hielo. En total se sirven ~**${totalLiquidoL.toFixed(1)} L** de trago.`,
    tone: 'neutral' as const,
    icon: '🥃',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Fernet', value: Math.round(fernetMl) },
      { label: 'Coca', value: Math.round(colaMl) },
    ],
    prefix: '',
    centerValue: `${totalLiquidoL.toFixed(1)} L`,
    centerLabel: 'Trago total',
    ariaLabel: `Del trago total, ${Math.round(fernetMl)} ml son de fernet y ${Math.round(colaMl)} ml de coca.`,
  };

  return {
    totalTragos: tot,
    totalfernetbranca: fmt(f * tot),
    totalcocacola: fmt(c * tot),
    totalhielo: `${h * tot}g (${((h * tot) / 1000).toFixed(1)}kg)`,
    listaCompras: lista,
    _insight,
    _chart,
  };
}
