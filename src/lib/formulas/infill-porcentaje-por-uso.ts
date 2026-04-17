/**
 * Calculadora de infill recomendado por tipo de uso
 */

export interface Inputs {
  uso: number; tamano: number; peso100: number;
}

export interface Outputs {
  infillRecomendado: string; patron: string; ahorroGramos: string; pesoEstimado: string;
}

export function infillPorcentajePorUso(inputs: Inputs): Outputs {
  const uso = Math.round(Number(inputs.uso));
  const tam = Number(inputs.tamano);
  const p100 = Number(inputs.peso100);
  if (!uso || !tam || !p100) throw new Error('Completá todos los campos');
  const tablaUso: Record<number, { base: number; patron: string }> = {
    1: { base: 8, patron: 'Lines o Gyroid' },
    2: { base: 18, patron: 'Grid o Gyroid' },
    3: { base: 30, patron: 'Cubic o Gyroid' },
    4: { base: 50, patron: 'Cubic o Triangle' },
    5: { base: 90, patron: 'Concentric o Cubic' },
  };
  const tabla = tablaUso[uso] || tablaUso[2];
  let infill = tabla.base;
  if (tam < 30) infill += 8;
  else if (tam > 150) infill = Math.max(5, infill - 5);
  const volEfectivo = 0.30 + (infill / 100) * 0.70;
  const pesoEst = p100 * volEfectivo;
  const ahorro = p100 - pesoEst;
  return {
    infillRecomendado: `${infill}%`,
    patron: tabla.patron,
    ahorroGramos: `Ahorrás ${ahorro.toFixed(0)} g (${((ahorro/p100)*100).toFixed(0)}% menos material)`,
    pesoEstimado: `~${pesoEst.toFixed(0)} g con infill ${infill}%`,
  };
}
