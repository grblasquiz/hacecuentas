/** ABV cerveza OG/FG — fórmula estándar homebrewing */
export interface Inputs { og: number; fg: number; }
export interface Outputs { abv: number; atenuacion: number; calorias100ml: number; estilo: string; _insight?: any; _chart?: any; }

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

  const abvR = Number(abv.toFixed(2));
  const atenR = Number(atenuacion.toFixed(1));
  const calR = Number(calorias100ml.toFixed(0));

  // Tono: la atenuación ideal de la mayoría de levaduras cae ~70-85%.
  // Baja (<65%) suele indicar fermentación incompleta; alta (>85%) cuerpo muy seco.
  let tone: 'good' | 'warn' | 'neutral' = 'good';
  if (atenR < 65 || atenR > 88) tone = 'warn';
  else if (atenR < 70 || atenR > 85) tone = 'neutral';

  let atenNota = '';
  if (atenR < 65) atenNota = ' Atenuación baja: revisá si la fermentación terminó.';
  else if (atenR > 88) atenNota = ' Atenuación muy alta: cuerpo seco, casi sin azúcares residuales.';

  const _insight = {
    title: 'Tu cerveza',
    text: `Te queda en **${abvR}% ABV** (${estilo}), con **${atenR}%** de atenuación y unas **${calR} kcal** por 100 ml.${atenNota}`,
    tone,
    icon: '🍺',
  };

  // Gauge: el ABV ubica la cerveza en una banda de estilo.
  const _chart = {
    type: 'scale',
    marker: abvR,
    markerLabel: `${abvR}%`,
    min: 0,
    segments: [
      { nombre: 'Session', max: 3.5, color: '#bae6fd', colorDark: '#0c4a6e' },
      { nombre: 'Lager', max: 5, color: '#86efac', colorDark: '#14532d' },
      { nombre: 'Ale', max: 6, color: '#fde047', colorDark: '#713f12' },
      { nombre: 'IPA', max: 7.5, color: '#fdba74', colorDark: '#7c2d12' },
      { nombre: 'Fuerte', max: 9, color: '#fca5a5', colorDark: '#7f1d1d' },
      { nombre: 'Imperial', max: Math.max(15, Math.ceil(abvR) + 1), color: '#d8b4fe', colorDark: '#581c87' },
    ],
    ariaLabel: `Graduación alcohólica de ${abvR}% ABV ubicada en la banda de estilo ${estilo}`,
  };

  return {
    abv: abvR,
    atenuacion: atenR,
    calorias100ml: calR,
    estilo,
    _insight,
    _chart,
  };
}
