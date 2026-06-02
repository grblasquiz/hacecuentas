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
  _insight?: any;
}

export function proteinaPorComidaAnabolismo(inputs: ProteinaPorComidaAnabolismoInputs): ProteinaPorComidaAnabolismoOutputs {
  const peso = Number(inputs.peso);
  const edad = Number(inputs.edad);
  if (!peso || peso <= 0) throw new Error('Ingresá peso válido');
  const esMayor = edad >= 65;
  const factor = esMayor ? 0.55 : 0.4;
  const porComida = peso * factor;
  const leu = (porComida * 0.1).toFixed(1);
  const porComidaR = Number(porComida.toFixed(0));
  const leuOk = porComida * 0.1 >= 2.5;

  const _insight = {
    title: 'Tu dosis anabólica por comida',
    text: esMayor
      ? `A partir de los 65 la resistencia anabólica exige más estímulo: apuntá a **${porComidaR} g de proteína por comida** (factor **0,55 g/kg**), con ~**${leu} g de leucina** para disparar la síntesis muscular${leuOk ? ', por encima del umbral de 2,5-3 g' : '; quizás necesites una fuente rica en leucina (whey, lácteos) para llegar al umbral de 2,5-3 g'}.`
      : `Para maximizar la síntesis muscular (MPS), apuntá a **${porComidaR} g de proteína por comida** (factor **0,4 g/kg**) en unas 4 tomas, aportando ~**${leu} g de leucina**${leuOk ? ', dentro del umbral anabólico de 2,5-3 g' : '; conviene una fuente rica en leucina para llegar al umbral de 2,5-3 g'}.`,
    tone: 'neutral',
    icon: '🧬',
  };

  return {
    proteinaPorComida: porComidaR,
    leucina: `${leu} g leucina aprox (umbral 2.5-3g)`,
    ejemplosAlimentos: '100-120g pollo, 130g salmón, 4 huevos, 300g yogur griego, 1 scoop whey',
    resumen: `Consumí ${porComida.toFixed(0)}g proteína por comida en 4 tomas para MPS óptima.`,
    _insight,
  };
}
