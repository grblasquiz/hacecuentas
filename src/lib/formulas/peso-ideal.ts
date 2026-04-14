/** Peso ideal — fórmulas clásicas Devine, Lorentz, Robinson */
export interface Inputs { altura: number; sexo: 'm' | 'f' | string; }
export interface Outputs {
  devine: number;
  robinson: number;
  lorentz: number;
  rangoImcSaludable: string;
  promedio: number;
}

export function pesoIdeal(i: Inputs): Outputs {
  const alt = Number(i.altura);
  const sexo = String(i.sexo || 'm');
  if (!alt || alt <= 0) throw new Error('Ingresá la altura en cm');
  const alturaPulgadas = alt / 2.54;
  const pulgadasSobre5pies = Math.max(0, alturaPulgadas - 60);

  // Devine
  const devine = sexo === 'f'
    ? 45.5 + 2.3 * pulgadasSobre5pies
    : 50 + 2.3 * pulgadasSobre5pies;

  // Robinson
  const robinson = sexo === 'f'
    ? 49 + 1.7 * pulgadasSobre5pies
    : 52 + 1.9 * pulgadasSobre5pies;

  // Lorentz: (altura cm − 100) − ((altura cm − 150) / {4 hombres, 2.5 mujeres})
  const divisor = sexo === 'f' ? 2.5 : 4;
  const lorentz = (alt - 100) - ((alt - 150) / divisor);

  // IMC saludable: 18.5 a 24.9
  const alturaM = alt / 100;
  const imcMin = Math.round(18.5 * alturaM * alturaM);
  const imcMax = Math.round(24.9 * alturaM * alturaM);

  const promedio = (devine + robinson + lorentz) / 3;

  return {
    devine: Math.round(devine * 10) / 10,
    robinson: Math.round(robinson * 10) / 10,
    lorentz: Math.round(lorentz * 10) / 10,
    rangoImcSaludable: `${imcMin} – ${imcMax} kg`,
    promedio: Math.round(promedio * 10) / 10,
  };
}
