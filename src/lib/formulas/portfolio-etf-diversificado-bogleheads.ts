export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function portfolioEtfDiversificadoBogleheads(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const monto = Number(i.monto) || 0;
  // Bond allocation percentage (e.g. your age, or a chosen %); default 20 only when not provided
  const rawBond = i.bond_pct !== undefined && i.bond_pct !== '' ? Number(i.bond_pct) : 20;
  const bondPct = Math.min(Math.max(isNaN(rawBond) ? 20 : rawBond, 0), 100);
  // Within the stock portion, US vs international split (default 60% US / 40% intl = Bogleheads standard)
  const rawUs = i.us_split !== undefined && i.us_split !== '' ? Number(i.us_split) : 60;
  const usSplit = Math.min(Math.max(isNaN(rawUs) ? 60 : rawUs, 0), 100);

  const stockPct = 100 - bondPct;
  const vti = monto * (stockPct / 100) * (usSplit / 100);
  const vxus = monto * (stockPct / 100) * (1 - usSplit / 100);
  const bnd = monto * (bondPct / 100);

  const fmt = (n: number) =>
    '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const vtiPct = Math.round(stockPct * (usSplit / 100));
  const vxusPct = Math.round(stockPct * (1 - usSplit / 100));
  const bndPctDisplay = Math.round(bondPct);

  const resumen = __lang === 'en'
    ? `VTI ${vtiPct}% (${fmt(vti)}) · VXUS ${vxusPct}% (${fmt(vxus)}) · BND ${bndPctDisplay}% (${fmt(bnd)})`
    : `VTI ${vtiPct}% (${fmt(vti)}) · VXUS ${vxusPct}% (${fmt(vxus)}) · BND ${bndPctDisplay}% (${fmt(bnd)})`;

  const _insight = {
    title: __lang === 'en' ? 'Your 3-fund allocation' : 'Tu asignación de 3 fondos',
    text: __lang === 'en'
      ? `With **${fmt(monto)}** invested: **${fmt(vti)}** in VTI (${vtiPct}% US stocks), **${fmt(vxus)}** in VXUS (${vxusPct}% international), and **${fmt(bnd)}** in BND (${bndPctDisplay}% bonds). Bogleheads wisdom: keep costs low, automate contributions, and never time the market.`
      : `Con **${fmt(monto)}** invertidos: **${fmt(vti)}** en VTI (${vtiPct}% acciones EEUU), **${fmt(vxus)}** en VXUS (${vxusPct}% internacional), y **${fmt(bnd)}** en BND (${bndPctDisplay}% bonos). Filosofía Bogleheads: costos bajos, aportes automáticos, y nunca intentar predecir el mercado.`,
    tone: 'good',
    icon: '📈',
  };

  return { vti: fmt(vti), vxus: fmt(vxus), bnd: fmt(bnd), resumen, _insight };
}
