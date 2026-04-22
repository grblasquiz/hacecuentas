/** IMC infantil con percentiles OMS */
export interface Inputs { pesoNinoIMC: number; tallaNinoIMC: number; edadNinoIMC: number; sexoNinoIMC: string; }
export interface Outputs { imc: string; percentilIMC: string; clasificacion: string; recomendacion: string; }

// P5, P50, P85, P97 de IMC por edad (simplificado, varones)
const imcVaron: Record<number, number[]> = {
  2: [14.8, 16.4, 18.0, 19.4], 3: [14.3, 15.7, 17.2, 18.5],
  4: [13.9, 15.3, 16.9, 18.2], 5: [13.8, 15.2, 16.9, 18.3],
  6: [13.7, 15.3, 17.1, 18.8], 7: [13.7, 15.5, 17.5, 19.6],
  8: [13.8, 15.7, 18.0, 20.4], 9: [14.0, 16.0, 18.6, 21.3],
  10: [14.2, 16.4, 19.3, 22.3], 12: [15.0, 17.5, 20.9, 24.4],
  14: [16.0, 19.0, 22.6, 26.2], 16: [17.0, 20.2, 24.0, 27.5],
  18: [17.8, 21.1, 25.0, 28.5],
};
const imcMujer: Record<number, number[]> = {
  2: [14.4, 16.0, 17.7, 19.1], 3: [13.9, 15.4, 17.1, 18.5],
  4: [13.6, 15.1, 16.9, 18.4], 5: [13.4, 15.0, 17.0, 18.7],
  6: [13.3, 15.1, 17.2, 19.2], 7: [13.4, 15.4, 17.7, 20.0],
  8: [13.5, 15.7, 18.3, 21.0], 9: [13.7, 16.1, 19.1, 22.1],
  10: [14.0, 16.6, 19.9, 23.2], 12: [14.8, 17.5, 21.3, 25.0],
  14: [15.8, 18.9, 22.8, 26.7], 16: [16.6, 19.9, 24.0, 27.8],
  18: [17.1, 20.4, 24.5, 28.4],
};

export function imcInfantilPercentil(i: Inputs): Outputs {
  const peso = Number(i.pesoNinoIMC);
  const talla = Number(i.tallaNinoIMC);
  const edad = Number(i.edadNinoIMC);
  const sexo = String(i.sexoNinoIMC);
  if (!peso || peso < 5) throw new Error('Ingresá el peso');
  if (!talla || talla < 60) throw new Error('Ingresá la talla');
  if (edad < 2 || edad > 18) throw new Error('Esta calculadora es para niños de 2 a 18 años');

  const tallaM = talla / 100;
  const imc = peso / (tallaM * tallaM);

  const tabla = sexo === 'f' ? imcMujer : imcVaron;
  const edades = Object.keys(tabla).map(Number).sort((a, b) => a - b);
  // Interpolación lineal entre edades. Antes el código usaba la edad menor más
  // cercana (ej. 13 años → usaba tabla de 12), perdiendo granularidad. Ahora
  // si edad cae entre dos edades tabuladas, interpolamos los percentiles.
  let lower = edades[0];
  let upper = edades[edades.length - 1];
  for (let k = 0; k < edades.length; k++) {
    if (edades[k] <= edad) lower = edades[k];
    if (edades[k] >= edad) { upper = edades[k]; break; }
  }
  const interp = (a: number, b: number): number => {
    if (upper === lower) return a;
    const t = (edad - lower) / (upper - lower);
    return a + (b - a) * t;
  };
  const low = tabla[lower];
  const up = tabla[upper];
  const p5  = interp(low[0], up[0]);
  const p50 = interp(low[1], up[1]);
  const p85 = interp(low[2], up[2]);
  const p97 = interp(low[3], up[3]);

  let percentil = '';
  let clasificacion = '';
  let recomendacion = '';

  if (imc < p5) {
    percentil = '< percentil 5';
    clasificacion = 'Bajo peso';
    recomendacion = 'Consultá con el pediatra para evaluar causas y plan nutricional.';
  } else if (imc < p85) {
    percentil = 'percentil 5-84 (normal)';
    clasificacion = 'Peso saludable';
    recomendacion = 'Peso adecuado para la edad. Seguí con alimentación variada y actividad física.';
  } else if (imc < p97) {
    percentil = 'percentil 85-96';
    clasificacion = 'Sobrepeso';
    recomendacion = 'Consultá con el pediatra. Más actividad física y menos ultraprocesados.';
  } else {
    percentil = '≥ percentil 97';
    clasificacion = 'Obesidad';
    recomendacion = 'Consultá con pediatra y nutricionista. Plan de alimentación + actividad física.';
  }

  return {
    imc: `${imc.toFixed(1)} kg/m²`,
    percentilIMC: percentil,
    clasificacion,
    recomendacion,
  };
}
