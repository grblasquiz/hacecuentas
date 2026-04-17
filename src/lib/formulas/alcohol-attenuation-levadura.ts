/** Atenuación levadura */
export interface Inputs { og: number; fg: number; atenuacionEsperada?: number; }
export interface Outputs { atenuacionAparente: number; atenuacionReal: number; estado: string; diagnostico: string; }

export function alcoholAttenuationLevadura(i: Inputs): Outputs {
  const og = Number(i.og);
  const fg = Number(i.fg);
  const esperada = Number(i.atenuacionEsperada) || 0;
  if (!og || og < 1) throw new Error('Ingresá OG');
  if (!fg || fg < 0.98) throw new Error('Ingresá FG');
  if (fg >= og) throw new Error('FG debe ser menor que OG');

  const aparente = ((og - fg) / (og - 1)) * 100;
  const real = aparente * 0.81;

  let estado = '';
  if (aparente < 60) estado = 'Fermentación muy incompleta';
  else if (aparente < 70) estado = 'Baja atenuación (cuerpo fuerte o stuck)';
  else if (aparente < 80) estado = 'Atenuación normal ale';
  else if (aparente < 88) estado = 'Alta (lager, saison seco)';
  else estado = 'Muy alta (Brett, enzimas agregadas)';

  let diag = '';
  if (esperada > 0) {
    if (aparente < esperada - 5) diag = `Por debajo del rango de la cepa (${esperada}%). Revisá temperatura y pitch rate.`;
    else if (aparente > esperada + 5) diag = `Por encima del rango esperado (${esperada}%). Posible contaminación o mash muy bajo.`;
    else diag = `Dentro del rango esperado (${esperada}%). Fermentación sana.`;
  } else {
    diag = 'Resultado sin comparación contra datasheet. Buscá atenuación típica de tu cepa.';
  }

  return {
    atenuacionAparente: Number(aparente.toFixed(1)),
    atenuacionReal: Number(real.toFixed(1)),
    estado,
    diagnostico: diag,
  };
}
