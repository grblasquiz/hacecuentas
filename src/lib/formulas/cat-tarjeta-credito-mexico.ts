/**
 * Calculadora del CAT (Costo Anual Total) en tarjeta de crédito México
 * Regulado por Banxico. Incluye intereses + comisiones + IVA sobre intereses
 */

export interface Inputs {
  saldo: number;
  pagoMinimo: number;
  tasaAnual: number; // en %
  comisionAnual: number; // anualidad $
  iva?: number; // % default 16
}

export interface Outputs {
  catPorcentaje: number;
  costoTotalAnual: number;
  interesesAnuales: number;
  comisionesAnuales: number;
  ivaAnual: number;
  mensaje: string;
}

export function catTarjetaCreditoMexico(i: Inputs): Outputs {
  const saldo = Number(i.saldo);
  const pagoMin = Number(i.pagoMinimo);
  const tasa = Number(i.tasaAnual);
  const comision = Number(i.comisionAnual);
  const iva = Number(i.iva ?? 16);

  if (!saldo || saldo <= 0) throw new Error('Ingresá el saldo de la tarjeta');
  if (!pagoMin || pagoMin <= 0) throw new Error('Ingresá el pago mínimo');
  if (!tasa || tasa <= 0) throw new Error('Ingresá la tasa anual (%)');

  // Saldo promedio aproximado (asume que vas pagando y el saldo baja)
  const saldoPromedio = (saldo + Math.max(0, saldo - pagoMin * 12)) / 2;

  const interesesAnuales = saldoPromedio * tasa / 100;
  const ivaAnual = interesesAnuales * iva / 100;
  const comisionesAnuales = comision;
  const costoTotalAnual = interesesAnuales + ivaAnual + comisionesAnuales;

  const catPorcentaje = (costoTotalAnual / saldoPromedio) * 100;

  return {
    catPorcentaje: Number(catPorcentaje.toFixed(2)),
    costoTotalAnual: Number(costoTotalAnual.toFixed(2)),
    interesesAnuales: Number(interesesAnuales.toFixed(2)),
    comisionesAnuales: Number(comisionesAnuales.toFixed(2)),
    ivaAnual: Number(ivaAnual.toFixed(2)),
    mensaje: `CAT aproximado: ${catPorcentaje.toFixed(2)}% anual. Costo total al año: $${costoTotalAnual.toFixed(2)} sobre saldo promedio $${saldoPromedio.toFixed(2)}.`,
  };
}
