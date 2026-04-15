/**
 * Calculadora de inflación acumulada por período
 * Inflación acumulada = (1 + tasa_mensual)^n − 1
 */

export interface InflacionAcumuladaPeriodoInputs {
  cantidadMeses: number;
  tasaMensualPromedio: number;
}

export interface InflacionAcumuladaPeriodoOutputs {
  inflacionAcumulada: string;
  factorMultiplicador: string;
  equivalenteAnual: string;
  detalle: string;
}

export function inflacionAcumuladaPeriodo(
  inputs: InflacionAcumuladaPeriodoInputs
): InflacionAcumuladaPeriodoOutputs {
  const meses = Math.round(Number(inputs.cantidadMeses));
  const tasaMensual = Number(inputs.tasaMensualPromedio);

  if (!meses || meses <= 0) throw new Error('Ingresá la cantidad de meses');
  if (isNaN(tasaMensual)) throw new Error('Ingresá la tasa mensual promedio');

  const factorMensual = 1 + tasaMensual / 100;
  const factorAcumulado = Math.pow(factorMensual, meses);
  const inflacionAcumulada = (factorAcumulado - 1) * 100;

  // Equivalente anualizada
  const factorAnual = Math.pow(factorMensual, 12);
  const equivalenteAnual = (factorAnual - 1) * 100;

  // Suma simple (incorrecta) para comparar
  const sumaSimple = tasaMensual * meses;

  const anios = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  const periodoStr =
    anios > 0
      ? `${anios} año${anios > 1 ? 's' : ''}${mesesRestantes > 0 ? ` y ${mesesRestantes} mes${mesesRestantes > 1 ? 'es' : ''}` : ''}`
      : `${meses} mes${meses > 1 ? 'es' : ''}`;

  return {
    inflacionAcumulada: `${inflacionAcumulada.toFixed(1)}%`,
    factorMultiplicador: `${factorAcumulado.toFixed(3)}x`,
    equivalenteAnual: `${equivalenteAnual.toFixed(1)}% anual`,
    detalle: `En ${periodoStr} con inflación promedio del ${tasaMensual}% mensual, la acumulada es ${inflacionAcumulada.toFixed(1)}% (suma simple sería ${sumaSimple.toFixed(1)}%, diferencia de ${(inflacionAcumulada - sumaSimple).toFixed(1)} puntos). Los precios se multiplicaron por ${factorAcumulado.toFixed(3)}. Equivalente anualizada: ${equivalenteAnual.toFixed(1)}%.`,
  };
}
