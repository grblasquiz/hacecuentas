/** V60 pour over */
export interface Inputs { tazas: number; mlPorTaza: number; ratio: number; }
export interface Outputs { gramosCafe: number; mlAgua: number; gramosBloom: number; tiempoTotal: string; intensidad: string; _insight?: any; _chart?: any; }

export function cafeRatioV60PourOver(i: Inputs): Outputs {
  const t = Number(i.tazas);
  const ml = Number(i.mlPorTaza);
  const r = Number(i.ratio);
  if (!t || t <= 0) throw new Error('Ingresá tazas');
  if (!ml || ml <= 0) throw new Error('Ingresá ml por taza');
  if (!r || r < 10) throw new Error('Ingresá ratio válido');

  const aguaTotal = t * ml;
  const cafe = aguaTotal / r;
  const bloom = cafe * 2.5;

  let tiempo = '';
  if (t <= 1) tiempo = '2:30 - 3:00';
  else if (t <= 2) tiempo = '3:00 - 3:30';
  else tiempo = '3:30 - 4:30';

  let intens = '';
  if (r < 14) intens = 'Muy fuerte';
  else if (r < 16) intens = 'Intenso';
  else if (r <= 16) intens = 'Balanceado SCA';
  else if (r < 18) intens = 'Suave';
  else intens = 'Muy suave';

  const gramosCafe = Number(cafe.toFixed(1));
  const mlAgua = Number(aguaTotal.toFixed(0));
  const gramosBloom = Number(bloom.toFixed(0));

  const esBalance = r >= 15 && r <= 17;
  const _insight = {
    title: `Perfil ${intens.toLowerCase()}`,
    text: esBalance
      ? `Con ratio **1:${r}** caés en la zona **balanceada** de la SCA: **${gramosCafe} g** de café para **${mlAgua} ml** de agua, con un bloom de **${gramosBloom} g**. Es el punto dulce para resaltar acidez y dulzor sin amargor.`
      : `Ratio **1:${r}** da un café **${intens.toLowerCase()}**: **${gramosCafe} g** de café para **${mlAgua} ml** de agua (bloom de **${gramosBloom} g**). ${r < 15 ? 'Si lo sentís pesado o amargo, subí el ratio hacia 1:16.' : 'Si lo querés con más cuerpo, bajá el ratio hacia 1:16.'}`,
    tone: esBalance ? 'good' : 'neutral',
    icon: '☕',
  };

  const _chart = {
    type: 'scale',
    marker: r,
    markerLabel: `1:${r}`,
    min: 10,
    segments: [
      { nombre: 'Muy fuerte', max: 14, color: '#92400e', colorDark: '#b45309' },
      { nombre: 'Intenso', max: 15, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Balanceado', max: 17, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Suave', max: 18, color: '#0ea5e9', colorDark: '#38bdf8' },
      { nombre: 'Muy suave', max: Math.max(20, Math.ceil(r) + 1), color: '#6366f1', colorDark: '#818cf8' },
    ],
    ariaLabel: `Ratio café-agua 1:${r} ubicado en la escala de intensidad, perfil ${intens.toLowerCase()}`,
  };

  return {
    gramosCafe,
    mlAgua,
    gramosBloom,
    tiempoTotal: tiempo,
    intensidad: intens,
    _insight,
    _chart,
  };
}
