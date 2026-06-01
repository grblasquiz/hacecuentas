/** Calculadora Becas — % cobertura */
export interface Inputs { montoBeca: number; costoTotal: number; duracionMeses: number; }
export interface Outputs { porcentajeCobertura: number; costoBolsillo: number; ahorroTotal: number; resumen: string; _insight?: any; _chart?: any; }

export function becasPorcentajeCobertura(i: Inputs): Outputs {
  const beca = Number(i.montoBeca);
  const costo = Number(i.costoTotal);
  const meses = Number(i.duracionMeses);
  if (costo <= 0) throw new Error('El costo total debe ser mayor a 0');
  if (meses <= 0) throw new Error('La duración debe ser mayor a 0');

  const porcentaje = Math.min(100, (beca / costo) * 100);
  const bolsillo = Math.max(0, costo - beca);
  const ahorro = beca * meses;

  const cubierto = Math.min(beca, costo);
  const tone = porcentaje >= 75 ? 'good' : porcentaje >= 40 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Qué cubre tu beca',
    text: `La beca cubre el **${porcentaje.toFixed(1)}%** del costo y dejás **$${bolsillo.toFixed(0)}/mes** de tu bolsillo. En ${meses} meses te ahorrás **$${ahorro.toFixed(0)}**.`,
    tone,
    icon: '🎓',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cubierto por la beca', value: Number(cubierto.toFixed(0)) },
      { label: 'Tu bolsillo', value: Number(bolsillo.toFixed(0)) },
    ],
    prefix: '$',
    centerValue: `${porcentaje.toFixed(0)}%`,
    centerLabel: 'cobertura',
    ariaLabel: `La beca cubre ${porcentaje.toFixed(0)}% del costo y vos pagás $${bolsillo.toFixed(0)}.`,
  };

  return {
    porcentajeCobertura: Number(porcentaje.toFixed(1)),
    costoBolsillo: Number(bolsillo.toFixed(0)),
    ahorroTotal: Number(ahorro.toFixed(0)),
    resumen: `La beca cubre el ${porcentaje.toFixed(1)}% del costo mensual. Pagás $${bolsillo.toFixed(0)}/mes de tu bolsillo. Ahorro total en ${meses} meses: $${ahorro.toFixed(0)}.`,
    _insight,
    _chart,
  };
}
