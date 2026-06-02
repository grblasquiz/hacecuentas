/** Cold brew ratio */
export interface Inputs { tipoBatch: string; mlAguaTotal: number; horasInfusion: number; }
export interface Outputs { gramosCafe: number; ratio: string; vasosConcentrado: string; tiempoPerfil: string; molidoRecomendado: string; _insight?: any; _chart?: any; }

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

  const esIdeal = h >= 14 && h <= 18;
  const esSobre = h > 24;
  const _insight = {
    title: esIdeal ? 'Ventana de extracción ideal' : esSobre ? 'Te pasaste de tiempo' : 'Ajustá la infusión',
    text: `Con **${Math.round(cafe)} g** de café para ${ml} ml (ratio **1:${r}**) y **${h} h** de reposo, el perfil queda **${perfil.toLowerCase()}**.` +
      (esIdeal ? ' Estás justo en la franja dulce de 14-18 h.'
        : esSobre ? ' Pasadas las 24 h el café empieza a amargar: cortá la infusión antes.'
        : h < 14 ? ' Dejalo hasta las 14-18 h para más dulzor y cuerpo.'
        : ' Cerca del límite: por encima de 18-24 h se vuelve más tánico.'),
    tone: esSobre ? 'warn' : esIdeal ? 'good' : 'neutral',
    icon: '☕',
  };
  const _chart = {
    type: 'scale',
    marker: Number(h.toFixed(1)),
    markerLabel: `${h} h`,
    min: 0,
    segments: [
      { nombre: 'Suave', max: 12, color: '#bfdbfe', colorDark: '#1e3a8a' },
      { nombre: 'Balanceado', max: 14, color: '#a7f3d0', colorDark: '#065f46' },
      { nombre: 'Ideal', max: 18, color: '#34d399', colorDark: '#047857' },
      { nombre: 'Intenso', max: 24, color: '#fcd34d', colorDark: '#92400e' },
      { nombre: 'Sobre-extraído', max: Math.max(36, Math.ceil(h) + 2), color: '#fca5a5', colorDark: '#991b1b' },
    ],
    ariaLabel: `${h} horas de infusión: perfil ${perfil.toLowerCase()}`,
  };

  return {
    gramosCafe: Number(cafe.toFixed(0)),
    ratio: `1:${r}`,
    vasosConcentrado: porciones,
    tiempoPerfil: perfil,
    molidoRecomendado: 'Grueso (sal marina gruesa)',
    _insight,
    _chart,
  };
}
