/**
 * Azúcar agregada: gramos → cucharaditas y % del límite OMS.
 */

export interface AzucarAgregadaOcultaGramosInputs {
  gramos: number;
  porciones: number;
}

export interface AzucarAgregadaOcultaGramosOutputs {
  azucarTotal: string;
  cucharaditas: string;
  porcentajeLimite: string;
  evaluacion: string;
}

export function azucarAgregadaOcultaGramos(inputs: AzucarAgregadaOcultaGramosInputs): AzucarAgregadaOcultaGramosOutputs {
  const g = Number(inputs.gramos);
  const p = Number(inputs.porciones);
  if (g < 0) throw new Error('Gramos inválidos');
  if (!p || p <= 0) throw new Error('Porciones inválidas');

  const total = g * p;
  const ctas = total / 4;
  const pct = (total / 25) * 100;

  let eval_ = '';
  if (pct < 20) eval_ = 'Bajo en azúcar ✅';
  else if (pct < 50) eval_ = 'Moderado: cuidar el total del día.';
  else if (pct < 100) eval_ = 'Alto: llegás a más de la mitad del límite diario.';
  else eval_ = 'Excede límite diario OMS ⚠️';

  return {
    azucarTotal: `${total.toFixed(1)} g`,
    cucharaditas: `${ctas.toFixed(1)} cucharaditas`,
    porcentajeLimite: `${pct.toFixed(0)}% del límite OMS (25 g/día)`,
    evaluacion: eval_,
  };
}
