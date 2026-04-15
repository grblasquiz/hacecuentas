/**
 * Calculadora de brecha cambiaria dólar blue vs oficial
 * Brecha (%) = ((blue − oficial) / oficial) × 100
 */

export interface DolarBlueVsOficialBrechaInputs {
  dolarBlue: number;
  dolarOficial: number;
  montoPesos?: number;
}

export interface DolarBlueVsOficialBrechaOutputs {
  brechaPct: string;
  diferenciaPesos: number;
  usdOficial: string;
  usdBlue: string;
  detalle: string;
}

export function dolarBlueVsOficialBrecha(
  inputs: DolarBlueVsOficialBrechaInputs
): DolarBlueVsOficialBrechaOutputs {
  const blue = Number(inputs.dolarBlue);
  const oficial = Number(inputs.dolarOficial);
  const montoPesos = Number(inputs.montoPesos) || 0;

  if (!blue || blue <= 0) throw new Error('Ingresá la cotización del dólar blue');
  if (!oficial || oficial <= 0) throw new Error('Ingresá la cotización del dólar oficial');

  const brecha = ((blue - oficial) / oficial) * 100;
  const diferencia = blue - oficial;

  const usdOficialStr =
    montoPesos > 0
      ? `USD ${(montoPesos / oficial).toFixed(2)}`
      : 'Ingresá un monto para calcular';
  const usdBlueStr =
    montoPesos > 0
      ? `USD ${(montoPesos / blue).toFixed(2)}`
      : 'Ingresá un monto para calcular';

  let nivel = '';
  const brechaAbs = Math.abs(brecha);
  if (brechaAbs < 5) nivel = 'Prácticamente sin brecha.';
  else if (brechaAbs < 15) nivel = 'Brecha baja.';
  else if (brechaAbs < 30) nivel = 'Brecha moderada.';
  else if (brechaAbs < 50) nivel = 'Brecha alta — señal de tensión cambiaria.';
  else nivel = 'Brecha muy alta — históricamente anticipa correcciones.';

  let detalleExtra = '';
  if (montoPesos > 0) {
    const usdOf = montoPesos / oficial;
    const usdBl = montoPesos / blue;
    const diff = usdOf - usdBl;
    detalleExtra = ` Con $${montoPesos.toLocaleString('es-AR')}: al oficial comprás USD ${usdOf.toFixed(2)}, al blue USD ${usdBl.toFixed(2)} (diferencia de USD ${diff.toFixed(2)}).`;
  }

  return {
    brechaPct: `${brecha.toFixed(1)}%`,
    diferenciaPesos: Math.round(diferencia),
    usdOficial: usdOficialStr,
    usdBlue: usdBlueStr,
    detalle: `La brecha cambiaria es del ${brecha.toFixed(1)}% ($${Math.round(diferencia).toLocaleString('es-AR')} de diferencia por dólar). ${nivel}${detalleExtra}`,
  };
}
