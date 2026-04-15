/** Porciones de torta según tamaño del molde y capas */
export interface Inputs { diametroMolde: number; capas?: string; }
export interface Outputs { porcionesEstimadas: number; factorMultiplicador: number; detalle: string; }

export function porcionesTorta(i: Inputs): Outputs {
  const diam = Number(i.diametroMolde);
  const capas = Number(i.capas || '2');

  if (!diam || diam < 10 || diam > 60) throw new Error('Ingresá un diámetro de molde válido (10-60 cm)');

  const area = Math.PI * Math.pow(diam / 2, 2);
  const porcionBase = area / 30; // ~30 cm² por porción estándar

  // Factor por capas
  const factorCapas: Record<number, number> = { 1: 1, 2: 1.3, 3: 1.5 };
  const fc = factorCapas[capas] || 1.3;

  const porciones = Math.round(porcionBase * fc);

  // Factor multiplicador vs molde de 22 cm (referencia estándar)
  const factorVs22 = Math.pow(diam / 22, 2);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    porcionesEstimadas: porciones,
    factorMultiplicador: Number(factorVs22.toFixed(2)),
    detalle: `Molde de ${diam} cm, ${capas} capa${capas > 1 ? 's' : ''}: ~${porciones} porciones. Si tu receta es para molde de 22 cm, multiplicá los ingredientes por ${fmt.format(factorVs22)}.`,
  };
}
