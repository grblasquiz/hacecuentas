/** Hop utilization Tinseth */
export interface Inputs { tiempoHervor: number; ogMosto: number; }
export interface Outputs { utilizacion: number; factorDensidad: number; factorTiempo: number; comentario: string; }

export function hopUtilizationBoilTime(i: Inputs): Outputs {
  const t = Number(i.tiempoHervor);
  const og = Number(i.ogMosto);
  if (!isFinite(t) || t < 0) throw new Error('Ingresá tiempo válido');
  if (!og || og < 1 || og > 1.2) throw new Error('Ingresá OG válida');

  const factorDensidad = 1.65 * Math.pow(0.000125, og - 1);
  const factorTiempo = (1 - Math.exp(-0.04 * t)) / 4.15;
  const utilizacion = factorDensidad * factorTiempo;

  let com = '';
  if (t < 5) com = 'Flameout / aroma — casi sin IBU';
  else if (t < 15) com = 'Aroma-flavor — poco amargor';
  else if (t < 30) com = 'Flavor — amargor moderado';
  else if (t < 60) com = 'Transición — equilibrio';
  else if (t < 90) com = 'Bittering — amargor máximo eficiente';
  else com = 'Plateau — hervor largo, poco extra por tiempo';

  return {
    utilizacion: Number((utilizacion * 100).toFixed(2)),
    factorDensidad: Number(factorDensidad.toFixed(3)),
    factorTiempo: Number(factorTiempo.toFixed(3)),
    comentario: com,
  };
}
