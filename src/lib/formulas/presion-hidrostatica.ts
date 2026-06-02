/** Calculadora de Presión Hidrostática — P = ρgh */
export interface Inputs { densidad: number; profundidad: number; gravedad: number; }
export interface Outputs { presionPa: number; presionAtm: number; presionBar: number; presionTotal: number; _insight?: any; _chart?: any; }

export function presionHidrostatica(i: Inputs): Outputs {
  const rho = Number(i.densidad);
  const h = Number(i.profundidad);
  const g = Number(i.gravedad) || 9.81;
  if (rho <= 0) throw new Error('La densidad debe ser mayor a 0');
  if (h < 0) throw new Error('La profundidad no puede ser negativa');

  const P = rho * g * h;
  const Patm = P / 101325;
  const Pbar = P / 100000;
  const Ptotal = P + 101325; // sumando presión atmosférica

  const hidroBar = P / 100000;
  const atmBar = 101325 / 100000;
  const totalBar = Ptotal / 100000;

  const _insight = {
    title: 'Cómo se compone la presión',
    text: `De los **${totalBar.toFixed(2)} bar** de presión total absoluta, **${hidroBar.toFixed(2)} bar** los aporta la columna de fluido y **${atmBar.toFixed(2)} bar** la atmósfera sobre la superficie. La presión hidrostática equivale a **${Patm.toFixed(1)}×** la atmosférica.`,
    tone: 'neutral',
    icon: '🌊',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Presión hidrostática', value: Number(hidroBar.toFixed(2)) },
      { label: 'Presión atmosférica', value: Number(atmBar.toFixed(2)) },
    ],
    suffix: ' bar',
    centerValue: totalBar.toFixed(2) + ' bar',
    centerLabel: 'Presión total',
    ariaLabel: `Presión total absoluta de ${totalBar.toFixed(2)} bar: ${hidroBar.toFixed(2)} bar hidrostática más ${atmBar.toFixed(2)} bar atmosférica.`,
  };

  return {
    presionPa: Number(P.toFixed(2)),
    presionAtm: Number(Patm.toFixed(4)),
    presionBar: Number(Pbar.toFixed(4)),
    presionTotal: Number(Ptotal.toFixed(2)),
    _insight,
    _chart,
  };
}
