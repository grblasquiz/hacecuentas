/** Calorías quemadas subiendo escaleras */
export interface Inputs {
  peso: number;
  pisos: number;
  alturaPiso: number;
}
export interface Outputs {
  caloriasQuemadas: number;
  metrosSubidos: number;
  equivalenteMinutosCaminata: number;
  detalle: string;
}

export function caloriasEscaleras(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const pisos = Number(i.pisos);
  const alturaPiso = Number(i.alturaPiso) || 3;

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!pisos || pisos <= 0) throw new Error('Ingresá la cantidad de pisos');

  const metrosSubidos = pisos * alturaPiso;

  // ~20 escalones por piso, ~0.5 seg por escalón
  const tiempoMin = (pisos * 20 * 0.5) / 60;

  // MET subir escaleras = 8.8 (Compendium of Physical Activities)
  const metEscaleras = 8.8;
  const caloriasQuemadas = metEscaleras * peso * (tiempoMin / 60);

  // Equivalente en caminata (MET 3.5)
  const metCaminata = 3.5;
  const equivalenteMinutosCaminata = caloriasQuemadas / (metCaminata * peso / 60);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    caloriasQuemadas: Math.round(caloriasQuemadas),
    metrosSubidos: Math.round(metrosSubidos),
    equivalenteMinutosCaminata: Number(equivalenteMinutosCaminata.toFixed(1)),
    detalle: `Subir ${pisos} pisos (${fmt.format(metrosSubidos)} m) quema ~${fmt.format(caloriasQuemadas)} kcal en ~${fmt.format(tiempoMin)} min. Equivale a ${fmt.format(equivalenteMinutosCaminata)} min de caminata.`,
  };
}
