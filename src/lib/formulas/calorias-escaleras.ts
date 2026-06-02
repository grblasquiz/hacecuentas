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
  _insight?: any;
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

  const calR = Math.round(caloriasQuemadas);
  const ratio = equivalenteMinutosCaminata / Math.max(tiempoMin, 0.01); // cuánto rinde vs caminar
  const _insight = {
    title: 'Subir escaleras rinde mucho por minuto',
    text: `Esos **${calR} kcal** los lográs en apenas **${fmt.format(tiempoMin)} min**: equivalen a **${fmt.format(equivalenteMinutosCaminata)} min de caminata**, casi **${ratio.toFixed(1)}×** más rendimiento por minuto. Cambiar el ascensor por la escalera es de los gestos más eficientes del día.`,
    tone: 'good',
    icon: '🪜',
  };

  return {
    caloriasQuemadas: calR,
    metrosSubidos: Math.round(metrosSubidos),
    equivalenteMinutosCaminata: Number(equivalenteMinutosCaminata.toFixed(1)),
    detalle: `Subir ${pisos} pisos (${fmt.format(metrosSubidos)} m) quema ~${fmt.format(caloriasQuemadas)} kcal en ~${fmt.format(tiempoMin)} min. Equivale a ${fmt.format(equivalenteMinutosCaminata)} min de caminata.`,
    _insight,
  };
}
