/**
 * Calculadora de infill recomendado por tipo de uso
 */

export interface Inputs {
  uso: number; tamano: number; peso100: number;
}

export interface Outputs {
  infillRecomendado: string; patron: string; ahorroGramos: string; pesoEstimado: string;
  _insight?: any; _chart?: any;
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
  const ahorroPct = (ahorro / p100) * 100;

  const zona = infill <= 15 ? 'ligero' : infill <= 35 ? 'estándar' : infill <= 60 ? 'resistente' : 'sólido';
  const _insight = {
    title: `Infill ${zona} recomendado`,
    text: `Para tu uso te conviene **${infill}%** con patrón **${tabla.patron}**: pieza ${zona} que pesa **~${pesoEst.toFixed(0)} g** y te ahorra **${ahorro.toFixed(0)} g** de filamento (${ahorroPct.toFixed(0)}% menos que macizo).`,
    tone: infill >= 60 ? 'warn' : 'good',
    icon: '🖨️',
  };

  const _chart = {
    type: 'scale',
    marker: infill,
    markerLabel: `${infill}%`,
    min: 0,
    segments: [
      { nombre: 'Ligero', max: 15, color: '#86efac', colorDark: '#22c55e' },
      { nombre: 'Estándar', max: 35, color: '#7dd3fc', colorDark: '#0ea5e9' },
      { nombre: 'Resistente', max: 60, color: '#fcd34d', colorDark: '#f59e0b' },
      { nombre: 'Sólido', max: 100, color: '#fca5a5', colorDark: '#ef4444' },
    ],
    ariaLabel: `Infill recomendado de ${infill}% en zona ${zona}, sobre escala de 0 a 100%`,
  };

  return {
    infillRecomendado: `${infill}%`,
    patron: tabla.patron,
    ahorroGramos: `Ahorrás ${ahorro.toFixed(0)} g (${ahorroPct.toFixed(0)}% menos material)`,
    pesoEstimado: `~${pesoEst.toFixed(0)} g con infill ${infill}%`,
    _insight,
    _chart,
  };
}
