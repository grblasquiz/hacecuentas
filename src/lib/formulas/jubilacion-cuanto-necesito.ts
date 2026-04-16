/** Cuánto necesitás para jubilarte */
export interface Inputs { gastoMensualRetiro: number; aniosParaRetiro: number; ahorroActualUSD?: number; rendimientoAnual?: number; }
export interface Outputs { capitalNecesario: string; ahorroMensualNecesario: number; totalAportado: string; interesesGanados: string; }

export function jubilacionCuantoNecesito(i: Inputs): Outputs {
  const gastoMensual = Number(i.gastoMensualRetiro);
  const anios = Number(i.aniosParaRetiro);
  const ahorroActual = Number(i.ahorroActualUSD) || 0;
  const rendAnual = Number(i.rendimientoAnual) || 7;
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

  return {
    capitalNecesario: fmt(capitalNecesario),
    ahorroMensualNecesario: Math.round(ahorroMensual),
    totalAportado: fmt(totalAportado),
    interesesGanados: fmt(Math.max(0, intereses)),
  };
}
