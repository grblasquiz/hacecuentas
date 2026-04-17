/** IBU Tinseth 1997 */
export interface Inputs { gramosLupulo: number; alfaAcidos: number; tiempoHervor: number; volumenHervor: number; ogMosto: number; }
export interface Outputs { ibu: number; utilizacion: number; clasificacion: string; }

export function ibuCervezaLupuloTinseth(i: Inputs): Outputs {
  const g = Number(i.gramosLupulo);
  const aa = Number(i.alfaAcidos);
  const t = Number(i.tiempoHervor);
  const v = Number(i.volumenHervor);
  const og = Number(i.ogMosto);
  if (!g || g <= 0) throw new Error('Ingresá gramos de lúpulo');
  if (!aa || aa <= 0) throw new Error('Ingresá alfa ácidos');
  if (!v || v <= 0) throw new Error('Ingresá volumen');
  if (!og || og < 1) throw new Error('Ingresá OG válida');

  const factorDensidad = 1.65 * Math.pow(0.000125, og - 1);
  const factorTiempo = (1 - Math.exp(-0.04 * t)) / 4.15;
  const utilizacion = factorDensidad * factorTiempo;
  const ibu = (utilizacion * aa * g * 1000) / (v * 100);

  let clasificacion = '';
  if (ibu < 15) clasificacion = 'Muy suave (lager ligera)';
  else if (ibu < 30) clasificacion = 'Suave (Pilsner, Kölsch)';
  else if (ibu < 45) clasificacion = 'Moderado (Pale Ale)';
  else if (ibu < 70) clasificacion = 'Amargo (IPA)';
  else if (ibu < 100) clasificacion = 'Muy amargo (Double IPA)';
  else clasificacion = 'Extremo (Imperial IPA)';

  return {
    ibu: Number(ibu.toFixed(1)),
    utilizacion: Number((utilizacion * 100).toFixed(1)),
    clasificacion,
  };
}
