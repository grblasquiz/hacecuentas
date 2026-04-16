/** Lavandina: dilución por uso */
export interface Inputs { uso: string; litrosAgua: number; concentracion?: string; }
export interface Outputs { mlLavandina: number; tapitas: number; tiempoContacto: string; precaucion: string; }

const ML_POR_LITRO: Record<string, number> = {
  superficies: 10, verduras: 5, potabilizar: 0.1, bano: 15, ropa: 20, tanque: 25,
};
const TIEMPOS: Record<string, string> = {
  superficies: '10 minutos de contacto, no enjuagar',
  verduras: '10 minutos de remojo, enjuagar bien',
  potabilizar: '30 minutos antes de consumir',
  bano: '15 minutos de contacto, enjuagar',
  ropa: '10 minutos en remojo, luego lavar normal',
  tanque: '2 horas, vaciar y enjuagar 2 veces',
};

export function lavandinaDilucionLitros(i: Inputs): Outputs {
  const uso = String(i.uso || 'superficies');
  const litros = Number(i.litrosAgua);
  const conc = String(i.concentracion || 'comun');
  if (!litros || litros <= 0) throw new Error('Ingresá los litros de agua');

  const base = ML_POR_LITRO[uso] || 10;
  const factor = conc === 'concentrada' ? 0.5 : 1;
  const ml = base * litros * factor;

  return {
    mlLavandina: Number(ml.toFixed(1)),
    tapitas: Number((ml / 5).toFixed(1)),
    tiempoContacto: TIEMPOS[uso] || '10 minutos',
    precaucion: 'NUNCA mezclar con amoníaco, vinagre ni otros productos. Usar en lugar ventilado. Mantener fuera del alcance de niños.',
  };
}
