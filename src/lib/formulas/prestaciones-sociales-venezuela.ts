/** Prestaciones sociales Venezuela — LOTTT Art. 142
 *  Garantía: 15 días de salario por trimestre (primeros 3 meses retroactivo)
 *  + 2 días adicionales por año a partir del 2do año (máximo 30 días)
 */

export interface Inputs {
  salarioMensual: number;
  salarioDiarioIntegral: number;
  aniosServicio: number;
  diasAdicionales: number;
}

export interface Outputs {
  garantiaAnual: number;
  diasAdicionales: number;
  totalDias: number;
  prestacionesAcumuladas: number;
  prestacionesPorAnio: number;
  formula: string;
  explicacion: string;
}

export function prestacionesSocialesVenezuela(i: Inputs): Outputs {
  const salarioMensual = Number(i.salarioMensual);
  const salarioDiarioInt = Number(i.salarioDiarioIntegral) || (salarioMensual / 30);
  const anios = Math.max(0, Number(i.aniosServicio) || 0);

  if (!salarioMensual || salarioMensual <= 0) throw new Error('Ingresá tu salario mensual');

  // 15 días por trimestre = 60 días por año (retroactivo)
  const DIAS_POR_TRIMESTRE = 15;
  const diasGarantiaPorAnio = DIAS_POR_TRIMESTRE * 4; // 60 días por año

  // Días adicionales: 2 por año a partir del 2do, máximo 30
  let diasAdicionalesTotal = 0;
  if (anios >= 2) {
    diasAdicionalesTotal = Math.min(30, (anios - 1) * 2);
  }

  const totalDiasAnio = diasGarantiaPorAnio + diasAdicionalesTotal;
  const prestacionesPorAnio = totalDiasAnio * salarioDiarioInt;

  // Acumulado total
  let prestacionesAcumuladas = 0;
  for (let a = 1; a <= Math.floor(anios); a++) {
    const diasAd = a >= 2 ? Math.min(30, (a - 1) * 2) : 0;
    prestacionesAcumuladas += (60 + diasAd) * salarioDiarioInt;
  }
  // Proporcional del año parcial
  const fraccion = anios - Math.floor(anios);
  if (fraccion > 0) {
    const trimestresCompletos = Math.floor(fraccion * 4);
    prestacionesAcumuladas += trimestresCompletos * DIAS_POR_TRIMESTRE * salarioDiarioInt;
  }

  const formula = `Prestaciones año = (${diasGarantiaPorAnio} + ${diasAdicionalesTotal} días) × Bs ${salarioDiarioInt.toFixed(2)} = Bs ${prestacionesPorAnio.toFixed(2)}`;
  const explicacion = `Con ${anios.toFixed(1)} años de servicio y salario diario integral de Bs ${salarioDiarioInt.toFixed(2)}: garantía de 60 días/año (15 × 4 trimestres)${diasAdicionalesTotal > 0 ? ` + ${diasAdicionalesTotal} días adicionales` : ''}. Total este año: ${totalDiasAnio} días = Bs ${prestacionesPorAnio.toFixed(2)}. Prestaciones acumuladas estimadas: Bs ${prestacionesAcumuladas.toFixed(2)}. Según LOTTT Art. 142, al terminar la relación laboral se compara este monto con el cálculo retroactivo (30 días × último salario × años) y se paga el mayor.`;

  return {
    garantiaAnual: diasGarantiaPorAnio * salarioDiarioInt,
    diasAdicionales: diasAdicionalesTotal,
    totalDias: totalDiasAnio,
    prestacionesAcumuladas: Number(prestacionesAcumuladas.toFixed(2)),
    prestacionesPorAnio: Number(prestacionesPorAnio.toFixed(2)),
    formula,
    explicacion,
  };
}
