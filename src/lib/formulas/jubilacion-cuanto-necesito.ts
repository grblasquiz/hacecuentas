/** Cuánto necesitás para jubilarte */
export interface Inputs { gastoMensualRetiro: number; aniosParaRetiro: number; ahorroActualUSD?: number; rendimientoAnual?: number; }
export interface Outputs { capitalNecesario: string; ahorroMensualNecesario: number; totalAportado: string; interesesGanados: string; _chart?: any; _insight?: any; }

export function jubilacionCuantoNecesito(i: Inputs): Outputs {
  const gastoMensual = Number(i.gastoMensualRetiro);
  const anios = Number(i.aniosParaRetiro);
  const ahorroActual = Number(i.ahorroActualUSD) || 0;
  const rendAnual = (Number.isFinite(Number(i.rendimientoAnual)) ? Number(i.rendimientoAnual) : 7);
  if (!gastoMensual || gastoMensual <= 0) throw new Error('Ingresá el ingreso mensual deseado');
  if (!anios || anios <= 0) throw new Error('Ingresá los años al retiro');

  const gastoAnual = gastoMensual * 12;
  const capitalNecesario = gastoAnual * 25; // regla del 4%
  const rendMensual = rendAnual / 100 / 12;
  const meses = anios * 12;

  const vfAhorroActual = ahorroActual * Math.pow(1 + rendMensual, meses);
  const faltante = Math.max(0, capitalNecesario - vfAhorroActual);

  let ahorroMensual = 0;
  if (faltante > 0) {
    if (rendMensual > 0) {
      const factor = (Math.pow(1 + rendMensual, meses) - 1) / rendMensual;
      ahorroMensual = faltante / factor;
    } else {
      ahorroMensual = faltante / meses;
    }
  }

  const totalAportado = ahorroMensual * meses + ahorroActual;
  const intereses = capitalNecesario - totalAportado;
  const fmt = (n: number) => `US$${Math.round(n).toLocaleString('es-AR')}`;

  const aportadoSlice = Math.max(0, Math.min(totalAportado, capitalNecesario));
  const interesesSlice = Math.max(0, capitalNecesario - aportadoSlice);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Lo que aportás', value: Math.round(aportadoSlice) },
      { label: 'Rendimiento', value: Math.round(interesesSlice) },
    ],
    prefix: 'US$',
    centerValue: 'US$' + Math.round(capitalNecesario).toLocaleString('es-AR'),
    centerLabel: 'Capital',
    ariaLabel: 'Composición del capital necesario: aportes propios vs rendimiento de la inversión',
  };

  const pctRendimiento = capitalNecesario > 0 ? Math.round((interesesSlice / capitalNecesario) * 100) : 0;
  const yaCubierto = vfAhorroActual >= capitalNecesario;
  const insight = {
    title: yaCubierto ? 'Ya estás encaminado' : 'Tu plan de ahorro',
    text: yaCubierto
      ? `Para vivir con **US$${Math.round(gastoMensual).toLocaleString('es-AR')}** por mes necesitás un capital de **${fmt(capitalNecesario)}** (regla del 4%). Con tu ahorro actual y un **${rendAnual}%** anual ya llegás sin aportar un peso más.`
      : `Para vivir con **US$${Math.round(gastoMensual).toLocaleString('es-AR')}** por mes necesitás juntar **${fmt(capitalNecesario)}** (regla del 4%). Apartando **US$${Math.round(ahorroMensual).toLocaleString('es-AR')}** por mes durante **${anios} año${anios === 1 ? '' : 's'}** al **${rendAnual}%** anual, el rendimiento aporta el **${pctRendimiento}%** del total.`,
    tone: (yaCubierto ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '🏖️',
  };

  return {
    capitalNecesario: fmt(capitalNecesario),
    ahorroMensualNecesario: Math.round(ahorroMensual),
    totalAportado: fmt(totalAportado),
    interesesGanados: fmt(Math.max(0, intereses)),
    _chart: chart,
    _insight: insight,
  };
}
