/** Whisky Sour */
export interface Inputs { personas: number; tragosPorPersona: number; mlwhiskyPorTrago: number; mljugodelimonPorTrago: number; mljarabesimplePorTrago: number; mlclaradehuevoPorTrago: number; }
export interface Outputs { totalTragos: number; totalwhisky: string; totaljugodelimon: string; totaljarabesimple: string; totalclaradehuevo: string; listaCompras: string; _insight?: any; _chart?: any; }

export function whiskySourProporciones(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const w = Number(i.mlwhiskyPorTrago);
  const lim = Number(i.mljugodelimonPorTrago);
  const j = Number(i.mljarabesimplePorTrago);
  const cl = Number(i.mlclaradehuevoPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const limones = Math.ceil((lim * tot) / 30);
  const huevos = Math.ceil((cl * tot) / 30);
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Whisky: ${fmt(Math.ceil(w * tot * 1.15))} (${Math.ceil(w * tot * 1.15 / 750)} botellas) | Limones: ${limones} | Jarabe: ${fmt(Math.ceil(j * tot * 1.15))} | Huevos: ${huevos} | Hielo: ${(p * 0.5).toFixed(1)}kg | Cerezas al marrasquino: ${tot} unidades`;

  const volWhisky = w * tot;
  const volLimon = lim * tot;
  const volJarabe = j * tot;
  const volClara = cl * tot;
  const volTotal = volWhisky + volLimon + volJarabe + volClara;

  const _insight = {
    title: 'Tu batch de Whisky Sour',
    text: `Para **${tot} tragos** (${p} personas × ${t}) necesitás **${(volWhisky / 1000).toFixed(2)} L de whisky**, ${limones} limones y ${huevos} huevos. La proporción clásica del Whisky Sour es 2:1:1 (whisky, jugo de limón, jarabe); la clara aporta la espuma sedosa. La lista de compras suma un ~15% de margen.`,
    tone: 'neutral' as const,
    icon: '🍸',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Whisky', value: Number(volWhisky.toFixed(0)) },
      { label: 'Jugo de limón', value: Number(volLimon.toFixed(0)) },
      { label: 'Jarabe simple', value: Number(volJarabe.toFixed(0)) },
      { label: 'Clara de huevo', value: Number(volClara.toFixed(0)) },
    ],
    suffix: ' ml',
    centerValue: `${(volTotal / 1000).toFixed(2)} L`,
    centerLabel: 'Líquido total',
    ariaLabel: `Composición del batch de Whisky Sour: ${volWhisky.toFixed(0)} ml de whisky, ${volLimon.toFixed(0)} ml de jugo de limón, ${volJarabe.toFixed(0)} ml de jarabe simple y ${volClara.toFixed(0)} ml de clara de huevo.`,
  };

  return {
    totalTragos: tot,
    totalwhisky: fmt(w * tot),
    totaljugodelimon: fmt(lim * tot),
    totaljarabesimple: fmt(j * tot),
    totalclaradehuevo: `${cl * tot}ml (${huevos} huevos)`,
    listaCompras: lista,
    _insight,
    _chart,
  };
}
