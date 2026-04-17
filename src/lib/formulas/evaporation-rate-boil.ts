/** Evaporation rate boil */
export interface Inputs { volumenPreHervor: number; volumenPostHervor: number; duracionHervor: number; }
export interface Outputs { tasaEvaporacion: number; litrosHora: number; clasificacion: string; proyeccion90min: number; }

export function evaporationRateBoil(i: Inputs): Outputs {
  const vPre = Number(i.volumenPreHervor);
  const vPost = Number(i.volumenPostHervor);
  const mins = Number(i.duracionHervor);
  if (!vPre || vPre <= 0) throw new Error('Ingresá volumen pre-hervor');
  if (!vPost || vPost <= 0) throw new Error('Ingresá volumen post-hervor');
  if (vPost >= vPre) throw new Error('Post debe ser menor que pre');
  if (!mins || mins <= 0) throw new Error('Ingresá duración');

  const perdida = vPre - vPost;
  const litrosHora = perdida * (60 / mins);
  const tasa = (perdida / vPre) * (60 / mins) * 100;
  const proy90 = litrosHora * 1.5;

  let clasif = '';
  if (tasa < 6) clasif = 'Muy baja — hervor débil';
  else if (tasa < 8) clasif = 'Baja — típico de olla eléctrica';
  else if (tasa < 12) clasif = 'Normal homebrew';
  else if (tasa < 15) clasif = 'Alta — buena para Pilsner';
  else clasif = 'Excesiva — bajá el fuego';

  return {
    tasaEvaporacion: Number(tasa.toFixed(1)),
    litrosHora: Number(litrosHora.toFixed(2)),
    clasificacion: clasif,
    proyeccion90min: Number(proy90.toFixed(2)),
  };
}
