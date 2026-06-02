/** Calculadora de fondo de emergencia */
export interface Inputs { gastosFijos: number; tipoEmpleo: string; dependientes?: string; }
export interface Outputs { fondoNecesario: number; mesesRecomendados: string; ahorroMensualSugerido: number; dondeGuardarlo: string; _insight?: any; }

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

  const empleoLabel: Record<string, string> = {
    'relacion-dependencia': 'relación de dependencia',
    'contrato': 'contrato',
    'freelance': 'freelance',
    'emprendedor': 'emprendedor',
  };
  const _insight = {
    title: 'Cuánto y en cuánto tiempo',
    text: `Por tu perfil **${empleoLabel[empleo] || empleo}**${dependientes ? ' con dependientes' : ''} necesitás **$${Math.round(fondoNecesario).toLocaleString('es-AR')}** (${meses} meses). Apartando **$${ahorroMensual.toLocaleString('es-AR')}/mes** lo armás en un año.`,
    tone: meses >= 8 ? 'warn' : meses >= 6 ? 'neutral' : 'good',
    icon: '🛟',
  };

  return {
    fondoNecesario: Math.round(fondoNecesario),
    mesesRecomendados: `${meses} meses de gastos fijos`,
    ahorroMensualSugerido: ahorroMensual,
    dondeGuardarlo: 'FCI money market (rescate 24hs) + caja de ahorro remunerada. Parte en dólares MEP para protección.',
    _insight,
  };
}
