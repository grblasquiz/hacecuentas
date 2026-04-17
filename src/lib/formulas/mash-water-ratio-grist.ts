/** Mash water ratio */
export interface Inputs { kgGrano: number; ratioLkg: number; }
export interface Outputs { aguaMash: number; ratioQtLb: number; perfilMash: string; recomendacion: string; }

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

  return {
    aguaMash: Number(agua.toFixed(1)),
    ratioQtLb: Number(qtLb.toFixed(2)),
    perfilMash: perfil,
    recomendacion: rec,
  };
}
