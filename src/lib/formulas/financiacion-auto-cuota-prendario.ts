/** Calcula la cuota mensual de un crédito prendario automotor (sistema francés) */
export interface Inputs {
  montoFinanciar: number;
  tasaAnual: number;
  plazoMeses: number;
}
export interface Outputs {
  cuotaMensual: number;
  totalAPagar: number;
  totalIntereses: number;
  cft: number;
  detalle: string;
}

export function financiacionAutoCuotaPrendario(i: Inputs): Outputs {
  const monto = Number(i.montoFinanciar);
  const tna = Number(i.tasaAnual);
  const plazo = Number(i.plazoMeses);

  if (!monto || monto < 500000) throw new Error('Ingresá el monto a financiar (mínimo $500.000)');
  if (!tna || tna < 1 || tna > 200) throw new Error('La tasa nominal anual debe estar entre 1% y 200%');
  if (!plazo || plazo < 6 || plazo > 84) throw new Error('El plazo debe estar entre 6 y 84 meses');

  const tasaMensual = tna / 12 / 100;

  // Fórmula sistema francés
  const cuotaMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / (Math.pow(1 + tasaMensual, plazo) - 1);

  const totalAPagar = cuotaMensual * plazo;
  const totalIntereses = totalAPagar - monto;
  const cft = totalAPagar / monto;

  return {
    cuotaMensual: Math.round(cuotaMensual),
    totalAPagar: Math.round(totalAPagar),
    totalIntereses: Math.round(totalIntereses),
    cft: Number(cft.toFixed(2)),
    detalle: `Cuota mensual: $${Math.round(cuotaMensual).toLocaleString('es-AR')} × ${plazo} meses. Total a pagar: $${Math.round(totalAPagar).toLocaleString('es-AR')} (${cft.toFixed(1)}x el monto). Intereses: $${Math.round(totalIntereses).toLocaleString('es-AR')}.`,
  };
}
