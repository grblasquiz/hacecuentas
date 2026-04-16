/** Calculadora de fondo de emergencia */
export interface Inputs { gastosFijos: number; tipoEmpleo: string; dependientes?: string; }
export interface Outputs { fondoNecesario: number; mesesRecomendados: string; ahorroMensualSugerido: number; dondeGuardarlo: string; }

export function fondoEmergencia(i: Inputs): Outputs {
  const gastos = Number(i.gastosFijos);
  const empleo = i.tipoEmpleo || 'relacion-dependencia';
  const dependientes = i.dependientes === 'si';
  if (!gastos || gastos <= 0) throw new Error('Ingresá tus gastos fijos mensuales');

  const mesesBase: Record<string, number> = { 'relacion-dependencia': 4, 'contrato': 6, 'freelance': 8, 'emprendedor': 10 };
  let meses = mesesBase[empleo] || 6;
  if (dependientes) meses += 2;

  const fondoNecesario = gastos * meses;
  const ahorroMensual = Math.ceil(fondoNecesario / 12);

  return {
    fondoNecesario: Math.round(fondoNecesario),
    mesesRecomendados: `${meses} meses de gastos fijos`,
    ahorroMensualSugerido: ahorroMensual,
    dondeGuardarlo: 'FCI money market (rescate 24hs) + caja de ahorro remunerada. Parte en dólares MEP para protección.',
  };
}
