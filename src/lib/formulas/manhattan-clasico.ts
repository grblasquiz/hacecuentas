/** Manhattan */
export interface Inputs { personas: number; tragosPorPersona: number; mlryewhiskeyPorTrago: number; mlvermouthrossoPorTrago: number; mlbitterangosturaPorTrago: number; }
export interface Outputs { totalTragos: number; totalryewhiskey: string; totalvermouthrosso: string; totalbitterangostura: string; listaCompras: string; _insight?: any; _chart?: any; }

export function manhattanClasico(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const w = Number(i.mlryewhiskeyPorTrago);
  const v = Number(i.mlvermouthrossoPorTrago);
  const b = Number(i.mlbitterangosturaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const fmt = (ml: number) => `${ml}ml`;
  const lista = `Rye Whiskey: ${fmt(Math.ceil(w * tot * 1.15))} (${Math.ceil(w * tot * 1.15 / 750)} bot) | Vermouth rosso: ${fmt(Math.ceil(v * tot * 1.15))} | Angostura: ${Math.ceil(b * tot / 2)} dashes | Cerezas: ${tot} | Hielo: ${(p * 0.3).toFixed(1)}kg`;

  const mlWhiskey = w * tot;
  const mlVermouth = v * tot;
  const mlBitter = b * tot;
  const mlTotal = mlWhiskey + mlVermouth + mlBitter;
  const botellas = Math.ceil(mlWhiskey * 1.15 / 750);

  return {
    totalTragos: tot,
    totalryewhiskey: fmt(w * tot),
    totalvermouthrosso: fmt(v * tot),
    totalbitterangostura: `${b * tot}ml (${Math.ceil(b * tot / 2)} dashes)`,
    listaCompras: lista,
    _insight: {
      title: 'Tu compra para la barra',
      text: `Para **${tot} Manhattan** vas a usar **${fmt(mlWhiskey)} de rye whiskey** (≈ ${botellas} botella${botellas === 1 ? '' : 's'} de 750 ml) y **${fmt(mlVermouth)} de vermouth rosso**. No olvides el hielo (${(p * 0.3).toFixed(1)} kg) y las cerezas (${tot}).`,
      tone: 'neutral',
      icon: '🥃',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Rye whiskey', value: Number(mlWhiskey.toFixed(0)) },
        { label: 'Vermouth rosso', value: Number(mlVermouth.toFixed(0)) },
        { label: 'Angostura', value: Number(mlBitter.toFixed(0)) },
      ],
      prefix: '',
      centerValue: fmt(Number(mlTotal.toFixed(0))),
      centerLabel: 'líquido total',
      ariaLabel: `Composición de ${tot} Manhattan: ${fmt(mlWhiskey)} de whiskey, ${fmt(mlVermouth)} de vermouth y ${fmt(mlBitter)} de Angostura`,
    },
  };
}
