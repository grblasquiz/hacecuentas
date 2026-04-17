/**
 * Calorías del perro por raza y edad (MER = RER × factor).
 */
export interface Inputs { raza: string; peso: number; edad: string; actividad: string; castrado: string; }
export interface Outputs { kcalDia: number; rer: number; factor: number; gramosAlimento: number; }

export function caloriasPerroPorRazaEdad(inputs: Inputs): Outputs {
  const peso = Number(inputs.peso);
  const edad = String(inputs.edad || 'adulto');
  const actividad = String(inputs.actividad || 'media');
  const castrado = String(inputs.castrado || 'si') === 'si';
  if (!peso || peso <= 0) throw new Error('Ingresá peso válido');

  const rer = 70 * Math.pow(peso, 0.75);

  let factor = 1.6;
  if (edad === 'cachorro_2_4m') factor = 3.0;
  else if (edad === 'cachorro_4_12m') factor = 2.0;
  else if (edad === 'senior') factor = 1.4;
  else if (edad === 'adulto') {
    factor = castrado ? 1.6 : 1.8;
  }

  // actividad override sólo para adulto/senior
  if (edad === 'adulto' || edad === 'senior') {
    if (actividad === 'baja') factor = castrado ? 1.3 : 1.4;
    else if (actividad === 'alta') factor = 2.2;
  }

  const mer = rer * factor;
  const gramos = (mer / 380) * 100;

  return {
    kcalDia: Math.round(mer),
    rer: Math.round(rer),
    factor: Number(factor.toFixed(2)),
    gramosAlimento: Math.round(gramos),
  };
}
