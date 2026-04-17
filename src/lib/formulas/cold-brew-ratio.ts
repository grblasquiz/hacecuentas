/** Cold brew ratio */
export interface Inputs { tipoBatch: string; mlAguaTotal: number; horasInfusion: number; }
export interface Outputs { gramosCafe: number; ratio: string; vasosConcentrado: string; tiempoPerfil: string; molidoRecomendado: string; }

export function coldBrewRatio(i: Inputs): Outputs {
  const tipo = String(i.tipoBatch);
  const ml = Number(i.mlAguaTotal);
  const h = Number(i.horasInfusion);
  if (!ml || ml <= 0) throw new Error('Ingresá ml de agua');
  if (!h) throw new Error('Ingresá horas');

  let r = 5;
  if (tipo === 'concentrado') r = 5;
  else r = 12;

  const cafe = ml / r;

  let perfil = '';
  if (h < 12) perfil = 'Suave, poco cuerpo';
  else if (h < 14) perfil = 'Balanceado';
  else if (h <= 18) perfil = 'Ideal (dulce y complejo)';
  else if (h <= 24) perfil = 'Intenso, más tánico';
  else perfil = 'Sobre-extraído, puede amargar';

  const porciones = tipo === 'concentrado' ? `${Math.round(ml / 60)} tazas 250ml (diluyendo 1:1)` : `${Math.round(ml / 250)} tazas 250ml`;

  return {
    gramosCafe: Number(cafe.toFixed(0)),
    ratio: `1:${r}`,
    vasosConcentrado: porciones,
    tiempoPerfil: perfil,
    molidoRecomendado: 'Grueso (sal marina gruesa)',
  };
}
