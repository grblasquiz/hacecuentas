/** Crédito UVA vs. tasa fija — simulación comparativa */
export interface Inputs {
  monto: number;
  plazoAnos: number;
  tasaUVA: number;
  tasaFija: number;
  inflacionEsperada: number;
  salarioActual?: number;
}
export interface Outputs {
  cuotaInicialUVA: number;
  cuotaInicialFija: number;
  cuotaFinalUVAEstimada: number;
  totalPagarUVAEstimado: number;
  totalPagarFija: number;
  ratioCuotaSalarioInicial: number;
  ratioCuotaSalarioFinal: number;
  recomendacion: string;
}

function cuotaFrancesa(capital: number, tasaMensual: number, meses: number): number {
  if (tasaMensual === 0) return capital / meses;
  return capital * (tasaMensual * Math.pow(1 + tasaMensual, meses)) / (Math.pow(1 + tasaMensual, meses) - 1);
}

export function creditoUva(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const anos = Number(i.plazoAnos);
  const uva = Number(i.tasaUVA) / 100;
  const fija = Number(i.tasaFija) / 100;
  const inf = Number(i.inflacionEsperada) / 100;
  const salario = Number(i.salarioActual) || 0;
  if (!monto || monto <= 0) throw new Error('Ingresá el monto del crédito');
  if (!anos || anos <= 0) throw new Error('Ingresá el plazo en años');
  const meses = anos * 12;

  const cuotaUVA0 = cuotaFrancesa(monto, uva / 12, meses);
  const cuotaFija = cuotaFrancesa(monto, fija / 12, meses);

  // UVA: cuota en pesos se ajusta por UVA (inflación). Simulamos cuota al final del préstamo si la inflación se mantiene
  const cuotaUVAFinal = cuotaUVA0 * Math.pow(1 + inf, anos);

  // Total a pagar UVA — aproximación: sumá cuotas ajustadas mes a mes con inflación promedio anual
  const tasaMensInf = Math.pow(1 + inf, 1 / 12) - 1;
  let totalUVA = 0;
  for (let m = 0; m < meses; m++) {
    totalUVA += cuotaUVA0 * Math.pow(1 + tasaMensInf, m);
  }

  const totalFija = cuotaFija * meses;

  const ratio0 = salario > 0 ? (cuotaUVA0 / salario) * 100 : 0;
  const ratioF = salario > 0 ? (cuotaUVAFinal / (salario * Math.pow(1 + inf, anos))) * 100 : 0;

  let recomendacion = '';
  if (cuotaFija > cuotaUVA0 * 1.5) {
    recomendacion = 'El crédito UVA tiene una cuota inicial mucho más baja; conviene si esperás que tu salario acompañe la inflación.';
  } else if (fija < inf) {
    recomendacion = 'La tasa fija está por debajo de la inflación esperada — en términos reales conviene la tasa fija.';
  } else {
    recomendacion = 'Ambas opciones son similares — depende de tu tolerancia al riesgo y estabilidad laboral.';
  }

  return {
    cuotaInicialUVA: Math.round(cuotaUVA0),
    cuotaInicialFija: Math.round(cuotaFija),
    cuotaFinalUVAEstimada: Math.round(cuotaUVAFinal),
    totalPagarUVAEstimado: Math.round(totalUVA),
    totalPagarFija: Math.round(totalFija),
    ratioCuotaSalarioInicial: Number(ratio0.toFixed(1)),
    ratioCuotaSalarioFinal: Number(ratioF.toFixed(1)),
    recomendacion,
  };
}
