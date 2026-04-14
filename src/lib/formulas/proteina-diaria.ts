/** Proteína diaria por peso y objetivo */
export interface Inputs { peso: number; objetivo?: string; }
export interface Outputs {
  gramosMinimo: number;
  gramosOptimo: number;
  gramosMaximo: number;
  porcionesCarne: number;
  mensaje: string;
}

export function proteinaDiaria(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const obj = String(i.objetivo || 'mantenimiento');
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');

  let rango: [number, number, number];
  if (obj === 'sedentario') rango = [0.8, 1.0, 1.2];
  else if (obj === 'mantenimiento') rango = [1.2, 1.6, 2.0];
  else if (obj === 'muscular') rango = [1.6, 2.0, 2.4];
  else if (obj === 'deficit') rango = [2.0, 2.3, 2.6];
  else rango = [1.2, 1.6, 2.0];

  const gMin = peso * rango[0];
  const gOpt = peso * rango[1];
  const gMax = peso * rango[2];

  // Porciones: 100 g pollo/carne magra tienen ~25 g proteína
  const porciones = gOpt / 25;

  return {
    gramosMinimo: Math.round(gMin),
    gramosOptimo: Math.round(gOpt),
    gramosMaximo: Math.round(gMax),
    porcionesCarne: Number(porciones.toFixed(1)),
    mensaje: `Apuntá a ${Math.round(gOpt)} g de proteína al día (rango ${Math.round(gMin)}–${Math.round(gMax)} g).`,
  };
}
