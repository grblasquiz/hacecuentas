/** Valor futuro de una anualidad: aporte mensual + rendimiento compuesto */
export interface Inputs {
  aporteMensual: number;
  tasaAnual: number; // %
  plazoAnios: number;
  capitalInicial?: number;
}
export interface Outputs {
  valorFuturo: number;
  totalAportado: number;
  interesGanado: number;
  rendimientoPorcentual: number;
  aporteAnual: number;
  resumen: string;
}

export function valorFuturoAporteMensual(i: Inputs): Outputs {
  const aporte = Number(i.aporteMensual);
  const tasa = Number(i.tasaAnual);
  const anios = Number(i.plazoAnios);
  const capital = Number(i.capitalInicial) || 0;

  if (!aporte || aporte <= 0) throw new Error('Ingresá el aporte mensual');
  if (!tasa || tasa <= 0) throw new Error('Ingresá la tasa anual esperada');
  if (!anios || anios <= 0) throw new Error('Ingresá el plazo en años');
  if (capital < 0) throw new Error('El capital inicial no puede ser negativo');

  const r = tasa / 100 / 12;
  const n = anios * 12;
  const factor = Math.pow(1 + r, n);

  // VF de capital inicial + VF de anualidad de aportes
  const vfCapital = capital * factor;
  const vfAportes = aporte * ((factor - 1) / r);
  const valorFuturo = vfCapital + vfAportes;

  const totalAportado = capital + aporte * n;
  const interesGanado = valorFuturo - totalAportado;
  const rendimientoPorcentual = (interesGanado / totalAportado) * 100;
  const aporteAnual = aporte * 12;

  const resumen = `Aportando ${aporte.toLocaleString()}/mes durante ${anios} años a ${tasa}% anual, terminás con ${Math.round(valorFuturo).toLocaleString()} (${Math.round(interesGanado).toLocaleString()} son intereses).`;

  return {
    valorFuturo: Math.round(valorFuturo),
    totalAportado: Math.round(totalAportado),
    interesGanado: Math.round(interesGanado),
    rendimientoPorcentual: Number(rendimientoPorcentual.toFixed(2)),
    aporteAnual: Math.round(aporteAnual),
    resumen,
  };
}
