/** Dry Martini */
export interface Inputs { personas: number; tragosPorPersona: number; mlginPorTrago: number; mlvermouthdryPorTrago: number; }
export interface Outputs { totalTragos: number; totalgin: string; totalvermouthdry: string; listaCompras: string; ratio: string; _insight?: any; _chart?: any; }

export function martiniVermouthRatio(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const g = Number(i.mlginPorTrago);
  const v = Number(i.mlvermouthdryPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const ratio = v > 0 ? `${(g / v).toFixed(1)}:1 ${g/v > 8 ? '(very dry)' : g/v > 4 ? '(dry clásico)' : g/v > 2 ? '(wet)' : '(muy wet)'}` : 'Infinito (sin vermouth)';
  const fmt = (ml: number) => `${ml}ml`;
  const lista = `Gin: ${fmt(Math.ceil(g * tot * 1.15))} (${Math.ceil(g * tot * 1.15 / 750)} bot) | Vermouth dry: ${fmt(Math.ceil(v * tot * 1.15))} | Aceitunas verdes: ${tot} | Hielo: ${(p * 0.3).toFixed(1)}kg`;

  const ratioNum = v > 0 ? g / v : 0;
  const estilo = v <= 0 ? 'sin vermouth' : ratioNum > 8 ? 'very dry' : ratioNum > 4 ? 'dry clásico' : ratioNum > 2 ? 'wet' : 'muy wet';
  const insightText = v > 0
    ? `Con **${g}ml de gin** y **${v}ml de vermouth dry** por trago, tu ratio es **${ratioNum.toFixed(1)}:1** (${estilo}). Para ${tot} trago${tot > 1 ? 's' : ''} necesitás ${g * tot}ml de gin y ${v * tot}ml de vermouth.`
    : `Sin vermouth no es técnicamente un Martini sino gin helado: ratio **infinito**. Para ${tot} trago${tot > 1 ? 's' : ''} vas a usar ${g * tot}ml de gin.`;

  return {
    totalTragos: tot,
    totalgin: fmt(g * tot),
    totalvermouthdry: fmt(v * tot),
    listaCompras: lista,
    ratio,
    _insight: {
      title: 'Tu Martini',
      text: insightText,
      tone: 'neutral',
      icon: '🍸',
    },
    ...(v > 0 && g > 0
      ? {
          _chart: {
            type: 'doughnut',
            slices: [
              { label: 'Gin', value: g },
              { label: 'Vermouth dry', value: v },
            ],
            prefix: '',
            centerValue: `${g + v}ml`,
            centerLabel: 'Por trago',
            ariaLabel: `Composición de un Martini: ${g}ml de gin y ${v}ml de vermouth dry, total ${g + v}ml`,
          },
        }
      : {}),
  };
}
