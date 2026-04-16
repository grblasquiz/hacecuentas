/** Calculadora de metros cuadrados */
export interface Inputs {
  largo1: number; ancho1: number;
  largo2?: number; ancho2?: number;
  largo3?: number; ancho3?: number;
}
export interface Outputs {
  superficieTotal: string;
  espacio1: string;
  espacio2: string;
  espacio3: string;
}

export function metrosCuadradosHabitacion(i: Inputs): Outputs {
  const l1 = Number(i.largo1); const a1 = Number(i.ancho1);
  const l2 = Number(i.largo2) || 0; const a2 = Number(i.ancho2) || 0;
  const l3 = Number(i.largo3) || 0; const a3 = Number(i.ancho3) || 0;

  if (!l1 || l1 <= 0 || !a1 || a1 <= 0) throw new Error('Ingresá largo y ancho del espacio 1');

  const s1 = l1 * a1;
  const s2 = l2 > 0 && a2 > 0 ? l2 * a2 : 0;
  const s3 = l3 > 0 && a3 > 0 ? l3 * a3 : 0;
  const total = s1 + s2 + s3;

  return {
    superficieTotal: `${total.toFixed(1)} m²`,
    espacio1: `${l1}m × ${a1}m = ${s1.toFixed(1)} m²`,
    espacio2: s2 > 0 ? `${l2}m × ${a2}m = ${s2.toFixed(1)} m²` : 'No ingresado',
    espacio3: s3 > 0 ? `${l3}m × ${a3}m = ${s3.toFixed(1)} m²` : 'No ingresado',
  };
}
