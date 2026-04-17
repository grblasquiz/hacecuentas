/** ABV cerveza OG/FG — fórmula estándar homebrewing */
export interface Inputs { og: number; fg: number; }
export interface Outputs { abv: number; atenuacion: number; calorias100ml: number; estilo: string; }

export function abvCervezaOgFg(i: Inputs): Outputs {
  const og = Number(i.og);
  const fg = Number(i.fg);
  if (!og || og < 1 || og > 1.2) throw new Error('OG debe estar entre 1.000 y 1.200');
  if (!fg || fg < 0.98 || fg > 1.1) throw new Error('FG debe estar entre 0.980 y 1.100');
  if (fg >= og) throw new Error('La FG debe ser menor que la OG');

  const abv = (og - fg) * 131.25;
  const atenuacion = ((og - fg) / (og - 1)) * 100;
  const calorias100ml = (6.9 * abv + 4 * ((og - fg) * 1000 * 0.1)) * fg;

  let estilo = '';
  if (abv < 3.5) estilo = 'Session / Light lager';
  else if (abv < 5) estilo = 'Lager / Pilsner / Blonde Ale';
  else if (abv < 6) estilo = 'Pale Ale / Amber / Stout';
  else if (abv < 7.5) estilo = 'IPA / Brown Ale / Porter';
  else if (abv < 9) estilo = 'Double IPA / Belgian Strong';
  else estilo = 'Imperial / Barleywine';

  return {
    abv: Number(abv.toFixed(2)),
    atenuacion: Number(atenuacion.toFixed(1)),
    calorias100ml: Number(calorias100ml.toFixed(0)),
    estilo,
  };
}
