/** Ganancia o pérdida en una operación de criptomonedas */

export interface Inputs {
  precioCompra: number;
  precioVenta: number;
  cantidad: number;
  comisionPorcentaje: number;
}

export interface Outputs {
  gananciaAbsoluta: number;
  gananciaPorcentaje: number;
  montoInvertido: number;
  montoFinal: number;
}

export function gananciaCrypto(i: Inputs): Outputs {
  const precioCompra = Number(i.precioCompra);
  const precioVenta = Number(i.precioVenta);
  const cantidad = Number(i.cantidad);
  const comision = Number(i.comisionPorcentaje);

  if (isNaN(precioCompra) || precioCompra <= 0) throw new Error('Ingresá el precio de compra');
  if (isNaN(precioVenta) || precioVenta <= 0) throw new Error('Ingresá el precio de venta');
  if (isNaN(cantidad) || cantidad <= 0) throw new Error('Ingresá la cantidad de unidades');
  if (isNaN(comision) || comision < 0) throw new Error('La comisión no puede ser negativa');

  const comisionDecimal = comision / 100;

  // Monto invertido incluye comisión de compra
  const montoInvertido = precioCompra * cantidad * (1 + comisionDecimal);

  // Monto recibido descuenta comisión de venta
  const montoFinal = precioVenta * cantidad * (1 - comisionDecimal);

  const gananciaAbsoluta = montoFinal - montoInvertido;
  const gananciaPorcentaje = (gananciaAbsoluta / montoInvertido) * 100;

  return {
    gananciaAbsoluta: Number(gananciaAbsoluta.toFixed(2)),
    gananciaPorcentaje: Number(gananciaPorcentaje.toFixed(2)),
    montoInvertido: Number(montoInvertido.toFixed(2)),
    montoFinal: Number(montoFinal.toFixed(2)),
  };
}
