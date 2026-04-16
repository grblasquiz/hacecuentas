/** Impuesto sobre ganancia por venta de criptomonedas en Argentina
 *  Ley 27.430 (2018): ganancias de fuente argentina por enajenación de monedas digitales
 *  Alícuota 15% sobre ganancia neta (en pesos) para personas humanas
 *  Desde 2024: eliminación de diferenciación fuente arg/exterior para cripto
 */

export interface Inputs {
  precioCompraArs: number;
  precioVentaArs: number;
  cantidadTokens: number;
  gastoOperacion: number;
  tieneOtrasGanancias: string;
}

export interface Outputs {
  gananciabruta: number;
  gastosDeducibles: number;
  gananciaNeta: number;
  impuesto15: number;
  gananciaNetaPostImpuesto: number;
  alicuotaEfectiva: number;
  formula: string;
  explicacion: string;
}

export function impuestoGananciaCriptoArgentina(i: Inputs): Outputs {
  const precioCompra = Number(i.precioCompraArs);
  const precioVenta = Number(i.precioVentaArs);
  const cantidad = Number(i.cantidadTokens);
  const gastos = Number(i.gastoOperacion) || 0;

  if (!precioCompra || precioCompra < 0) throw new Error('Ingresá el precio de compra en ARS');
  if (!precioVenta || precioVenta < 0) throw new Error('Ingresá el precio de venta en ARS');
  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de tokens');

  const costoTotal = precioCompra * cantidad;
  const ingresoTotal = precioVenta * cantidad;
  const gananciabruta = ingresoTotal - costoTotal;
  const gastosDeducibles = gastos;
  const gananciaNeta = Math.max(0, gananciabruta - gastosDeducibles);

  // Alícuota: 15% sobre ganancia neta para personas humanas (Art. 98 bis LIG)
  const ALICUOTA = 0.15;
  const impuesto15 = gananciaNeta > 0 ? gananciaNeta * ALICUOTA : 0;
  const gananciaNetaPostImpuesto = gananciabruta - gastosDeducibles - impuesto15;
  const alicuotaEfectiva = ingresoTotal > 0 ? (impuesto15 / ingresoTotal) * 100 : 0;

  const formula = `Impuesto = (${cantidad} × ($${precioVenta} - $${precioCompra}) - $${gastos}) × 15% = $${Math.round(impuesto15).toLocaleString('es-AR')}`;
  const explicacion = gananciabruta <= 0
    ? `No tenés ganancia: vendiste a $${precioVenta.toLocaleString('es-AR')} lo que compraste a $${precioCompra.toLocaleString('es-AR')}. La pérdida de $${Math.abs(gananciabruta).toLocaleString('es-AR')} se puede usar para compensar futuras ganancias del mismo tipo.`
    : `Ganancia bruta: $${Math.round(gananciabruta).toLocaleString('es-AR')} ARS. Deduciendo gastos de $${gastos.toLocaleString('es-AR')}, la ganancia neta es $${Math.round(gananciaNeta).toLocaleString('es-AR')}. Impuesto a las ganancias (15%): $${Math.round(impuesto15).toLocaleString('es-AR')}. Te queda $${Math.round(gananciaNetaPostImpuesto).toLocaleString('es-AR')} neto.`;

  return {
    gananciabruta: Math.round(gananciabruta),
    gastosDeducibles: Math.round(gastosDeducibles),
    gananciaNeta: Math.round(gananciaNeta),
    impuesto15: Math.round(impuesto15),
    gananciaNetaPostImpuesto: Math.round(gananciaNetaPostImpuesto),
    alicuotaEfectiva: Number(alicuotaEfectiva.toFixed(2)),
    formula,
    explicacion,
  };
}
