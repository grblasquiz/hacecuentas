/**
 * Calculadora de interés compuesto
 * Fórmula: VF = VP × (1 + i)^n
 * Con aportes periódicos: VF = VP(1+i)^n + PMT × ((1+i)^n - 1)/i
 */

export interface InteresInputs {
  capitalInicial: number;
  aporteMensual: number;
  tasaAnual: number; // %
  plazoAnios: number;
}

export interface InteresOutputs {
  valorFinal: number;
  totalAportado: number;
  gananciaIntereses: number;
  rendimiento: string;
  tasaMensual: string;
}

export function interesCompuesto(inputs: InteresInputs): InteresOutputs {
  const capital = Number(inputs.capitalInicial) || 0;
  const aporte = Number(inputs.aporteMensual) || 0;
  const tasaAnual = Number(inputs.tasaAnual);
  const anios = Number(inputs.plazoAnios);

  if (capital < 0) throw new Error('El capital inicial no puede ser negativo');
  if (capital === 0 && aporte === 0) throw new Error('Ingresá un capital inicial o un aporte mensual');
  if (!tasaAnual || tasaAnual <= 0) throw new Error('Ingresá una tasa anual positiva');
  if (!anios || anios <= 0) throw new Error('Ingresá un plazo en años');

  const i = tasaAnual / 100 / 12;
  const n = anios * 12;
  const factor = Math.pow(1 + i, n);

  const vfCapital = capital * factor;
  const vfAportes = i === 0 ? aporte * n : aporte * ((factor - 1) / i);
  const valorFinal = vfCapital + vfAportes;

  const totalAportado = capital + aporte * n;
  const gananciaIntereses = valorFinal - totalAportado;
  const rendimiento = ((gananciaIntereses / totalAportado) * 100).toFixed(2);

  return {
    valorFinal: Math.round(valorFinal),
    totalAportado: Math.round(totalAportado),
    gananciaIntereses: Math.round(gananciaIntereses),
    rendimiento: `${rendimiento}% total`,
    tasaMensual: `${(i * 100).toFixed(2)}%`,
  };
}
