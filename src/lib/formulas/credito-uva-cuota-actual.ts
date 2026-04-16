/** Calculadora de cuota de crédito UVA */
export interface Inputs { montoPrestamoUVAs: number; tasaAnual: number; plazoAnios: number; valorUVAHoy: number; }
export interface Outputs { cuotaPesos: number; cuotaUVAs: number; totalPagado: number; interesesTotales: number; }

export function creditoUvaCuotaActual(i: Inputs): Outputs {
  const monto = Number(i.montoPrestamoUVAs);
  const tasaAnual = Number(i.tasaAnual);
  const plazo = Number(i.plazoAnios);
  const uva = Number(i.valorUVAHoy);

  if (!monto || monto <= 0) throw new Error('Ingresá el monto en UVAs');
  if (tasaAnual < 0) throw new Error('La tasa no puede ser negativa');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo');
  if (!uva || uva <= 0) throw new Error('Ingresá el valor UVA de hoy');

  const tasaMensual = tasaAnual / 100 / 12;
  const meses = plazo * 12;

  let cuotaUVAs: number;
  if (tasaMensual > 0) {
    cuotaUVAs = monto * (tasaMensual * Math.pow(1 + tasaMensual, meses)) / (Math.pow(1 + tasaMensual, meses) - 1);
  } else {
    cuotaUVAs = monto / meses;
  }

  const totalPagado = cuotaUVAs * meses;
  const interesesTotales = totalPagado - monto;
  const cuotaPesos = cuotaUVAs * uva;

  return {
    cuotaPesos: Math.round(cuotaPesos),
    cuotaUVAs: Math.round(cuotaUVAs * 100) / 100,
    totalPagado: Math.round(totalPagado),
    interesesTotales: Math.round(interesesTotales),
  };
}
