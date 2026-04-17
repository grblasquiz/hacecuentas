/** Kombucha tiempos */
export interface Inputs { temperaturaAmbiente: number; volumenLitros: number; acidezDeseada: string; }
export interface Outputs { diasF1: number; diasF2: number; tazasTe: number; gramosAzucar: number; consejos: string; }

export function kombuchaFermentacionTiempo(i: Inputs): Outputs {
  const t = Number(i.temperaturaAmbiente);
  const v = Number(i.volumenLitros);
  const acidez = String(i.acidezDeseada);
  if (!t) throw new Error('Ingresá temperatura');
  if (!v || v <= 0) throw new Error('Ingresá volumen');

  // Base F1 a 23°C según acidez
  const baseMap: Record<string, number> = { suave: 6, media: 8, fuerte: 11 };
  let f1 = baseMap[acidez] ?? 8;
  // Ajuste por temperatura
  if (t < 20) f1 += (20 - t) * 1.5;
  else if (t > 26) f1 -= (t - 26) * 0.8;
  f1 = Math.max(3, Math.min(21, f1));

  let f2 = 2;
  if (t < 20) f2 = 4;
  else if (t > 26) f2 = 1.5;

  const azucar = v * 75; // 75g/L
  const te = v * 2.5; // 2.5 cucharaditas (~7g) por litro

  let consejos = '';
  if (t < 20) consejos = 'Clima frío — poné el frasco cerca de calefacción. Tardará más.';
  else if (t > 28) consejos = 'Clima caluroso — chequeá desde día 5. Riesgo sobre-fermentación.';
  else consejos = 'Temperatura ideal — resultado predecible.';

  return {
    diasF1: Number(f1.toFixed(0)),
    diasF2: Number(f2.toFixed(0)),
    tazasTe: Number(te.toFixed(1)),
    gramosAzucar: Number(azucar.toFixed(0)),
    consejos,
  };
}
