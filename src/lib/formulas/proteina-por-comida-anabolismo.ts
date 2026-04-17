/**
 * Proteína por comida para MPS.
 */

export interface ProteinaPorComidaAnabolismoInputs {
  peso: number;
  edad: number;
}

export interface ProteinaPorComidaAnabolismoOutputs {
  proteinaPorComida: number;
  leucina: string;
  ejemplosAlimentos: string;
  resumen: string;
}

export function proteinaPorComidaAnabolismo(inputs: ProteinaPorComidaAnabolismoInputs): ProteinaPorComidaAnabolismoOutputs {
  const peso = Number(inputs.peso);
  const edad = Number(inputs.edad);
  if (!peso || peso <= 0) throw new Error('Ingresá peso válido');
  const factor = edad >= 65 ? 0.55 : 0.4;
  const porComida = peso * factor;
  const leu = (porComida * 0.1).toFixed(1);
  return {
    proteinaPorComida: Number(porComida.toFixed(0)),
    leucina: `${leu} g leucina aprox (umbral 2.5-3g)`,
    ejemplosAlimentos: '100-120g pollo, 130g salmón, 4 huevos, 300g yogur griego, 1 scoop whey',
    resumen: `Consumí ${porComida.toFixed(0)}g proteína por comida en 4 tomas para MPS óptima.`,
  };
}
