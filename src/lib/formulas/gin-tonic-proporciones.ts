/** Gin Tonic */
export interface Inputs { personas: number; tragosPorPersona: number; mlginPorTrago: number; mltonicaPorTrago: number; }
export interface Outputs { totalTragos: number; totalgin: string; totaltonica: string; listaCompras: string; _insight?: any; _chart?: any; }

export function ginTonicProporciones(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const g = Number(i.mlginPorTrago);
  const to = Number(i.mltonicaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const botellasTonica = Math.ceil(to * tot * 1.15 / 200); // tónicas de 200ml
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Gin: ${fmt(Math.ceil(g * tot * 1.15))} (${Math.ceil(g * tot * 1.15 / 750)} bot 750ml) | Tónica: ${botellasTonica} bot 200ml | Limones/pepinos: ${Math.ceil(tot / 4)} | Hielo (macizo): ${(p * 0.8).toFixed(1)}kg`;

  const ginMl = g * tot;
  const tonicaMl = to * tot;
  const totalMl = ginMl + tonicaMl;
  const ratio = ginMl > 0 ? Math.round(tonicaMl / ginMl) : 0;
  const _insight = {
    title: 'Tu tanda de gin tonics',
    text: `Para **${p} personas** salen **${tot} tragos**: vas a necesitar **${(ginMl / 1000).toFixed(2)} L de gin** y **${(tonicaMl / 1000).toFixed(2)} L de tónica**${ratio > 0 ? ` (proporción ~1:${ratio})` : ''}. Comprá ~15% extra por las dudas y mucho hielo.`,
    tone: 'good' as const,
    icon: '🍸',
  };

  const out: Outputs = {
    totalTragos: tot,
    totalgin: fmt(ginMl),
    totaltonica: fmt(tonicaMl),
    listaCompras: lista,
    _insight,
  };

  if (totalMl > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Gin', value: ginMl },
        { label: 'Tónica', value: tonicaMl },
      ],
      prefix: '',
      centerValue: `${(totalMl / 1000).toFixed(2)} L`,
      centerLabel: 'líquido total',
      ariaLabel: `Composición de la tanda: ${(ginMl / 1000).toFixed(2)} L de gin y ${(tonicaMl / 1000).toFixed(2)} L de tónica`,
    };
  }

  return out;
}
