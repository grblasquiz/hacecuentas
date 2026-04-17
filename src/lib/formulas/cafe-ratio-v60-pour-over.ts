/** V60 pour over */
export interface Inputs { tazas: number; mlPorTaza: number; ratio: number; }
export interface Outputs { gramosCafe: number; mlAgua: number; gramosBloom: number; tiempoTotal: string; intensidad: string; }

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

  return {
    gramosCafe: Number(cafe.toFixed(1)),
    mlAgua: Number(aguaTotal.toFixed(0)),
    gramosBloom: Number(bloom.toFixed(0)),
    tiempoTotal: tiempo,
    intensidad: intens,
  };
}
