/** Calculadora de Dimensiones Ideales para Acústica de Sala */
export interface Inputs {
  dimension: number;
  proporcion: string;
}
export interface Outputs {
  altura: number;
  ancho: number;
  largo: number;
  volumen: number;
  frecModo: number;
}

const PROPORCIONES: Record<string, [number, number, number]> = {
  bolt: [1, 1.26, 1.59],
  iec: [1, 1.4, 1.9],
  sepmeyer: [1, 1.28, 1.54],
};

export function tamanoSalaAcustica(i: Inputs): Outputs {
  const dim = Number(i.dimension);
  if (!dim || dim <= 0) throw new Error('Ingresá la dimensión base');

  const ratios = PROPORCIONES[i.proporcion];
  if (!ratios) throw new Error('Seleccioná una proporción válida');

  const altura = dim * ratios[0];
  const ancho = dim * ratios[1];
  const largo = dim * ratios[2];
  const volumen = altura * ancho * largo;

  // First axial mode of longest dimension: f = c / (2 * L) where c = 343 m/s
  const frecModo = 343 / (2 * largo);

  return {
    altura: Number(altura.toFixed(2)),
    ancho: Number(ancho.toFixed(2)),
    largo: Number(largo.toFixed(2)),
    volumen: Number(volumen.toFixed(1)),
    frecModo: Number(frecModo.toFixed(1)),
  };
}
