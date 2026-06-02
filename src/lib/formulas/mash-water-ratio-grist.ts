/** Mash water ratio */
export interface Inputs { kgGrano: number; ratioLkg: number; }
export interface Outputs { aguaMash: number; ratioQtLb: number; perfilMash: string; recomendacion: string; _insight?: any; _chart?: any; }

export function mashWaterRatioGrist(i: Inputs): Outputs {
  const kg = Number(i.kgGrano);
  const r = Number(i.ratioLkg);
  if (!kg || kg <= 0) throw new Error('Ingresá kg de grano');
  if (!r || r <= 0) throw new Error('Ingresá ratio');

  const agua = kg * r;
  const qtLb = r * 0.48;

  let perfil = '';
  if (r < 2.5) perfil = 'Mash denso — más cuerpo, más dextrinas';
  else if (r < 3.0) perfil = 'Maltoso — cuerpo medio';
  else if (r < 3.5) perfil = 'Estándar balanceado';
  else perfil = 'Mash diluido — más fermentables, cerveza seca';

  let rec = '';
  if (r < 2.5) rec = 'Stout, Scotch Ale, Barleywine';
  else if (r < 3.0) rec = 'Brown Ale, Porter, Amber';
  else if (r < 3.3) rec = 'IPA, Pale Ale, Lager estándar';
  else rec = 'Pilsner, Saison, cervezas secas';

  const tone = (r < 2.5 || r >= 3.5) ? 'warn' : 'good';
  const aguaFmt = Number(agua.toFixed(1));
  const insight = {
    title: 'Tu maceración',
    text: `Con **${kg} kg** de grano a **${r} L/kg** vas a necesitar **${aguaFmt} L** de agua de maceración (${qtLb.toFixed(2)} qt/lb). Ese ratio te da un mash **${perfil.split(' — ')[0].toLowerCase()}**, ideal para estilos como ${rec}.`,
    tone,
    icon: '🍺',
  };

  const chart = {
    type: 'scale',
    marker: Number(r.toFixed(2)),
    markerLabel: `${r} L/kg`,
    min: 1.5,
    segments: [
      { nombre: 'Denso', max: 2.5, color: '#92400e', colorDark: '#b45309' },
      { nombre: 'Maltoso', max: 3.0, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Balanceado', max: 3.5, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Diluido', max: Math.max(4.5, r + 0.5), color: '#0ea5e9', colorDark: '#38bdf8' },
    ],
    ariaLabel: `Ratio de maceración ${r} litros por kilo en escala de perfiles de mash`,
  };

  return {
    aguaMash: aguaFmt,
    ratioQtLb: Number(qtLb.toFixed(2)),
    perfilMash: perfil,
    recomendacion: rec,
    _insight: insight,
    _chart: chart,
  };
}
