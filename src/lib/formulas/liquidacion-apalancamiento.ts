/** Precio de liquidación según leverage en trading de cripto */

export interface Inputs {
  precioEntrada: number;
  leverage: number;
  posicion: string;
  margenInicial: number;
  tasaMantenimiento: number;
}

export interface Outputs {
  precioLiquidacion: number;
  distanciaLiquidacion: number;
  distanciaPorcentaje: number;
  margenUsado: number;
  tamanoposicion: number;
  formula: string;
  explicacion: string;
}

export function liquidacionApalancamiento(i: Inputs): Outputs {
  const precioEntrada = Number(i.precioEntrada);
  const leverage = Number(i.leverage);
  const margen = Number(i.margenInicial);
  const tasaMant = Number(i.tasaMantenimiento) || 0.5;
  const posicion = String(i.posicion || 'long').toLowerCase();

  if (!precioEntrada || precioEntrada <= 0) throw new Error('Ingresá el precio de entrada');
  if (!leverage || leverage <= 0) throw new Error('Ingresá el leverage');
  if (!margen || margen <= 0) throw new Error('Ingresá el margen inicial');

  const tamanoposicion = margen * leverage;
  const maintenanceMarginRate = tasaMant / 100;

  let precioLiquidacion: number;

  if (posicion === 'long') {
    // Long: Liq price = Entry Price × (1 - 1/Leverage + Maintenance Margin Rate)
    precioLiquidacion = precioEntrada * (1 - 1 / leverage + maintenanceMarginRate);
  } else {
    // Short: Liq price = Entry Price × (1 + 1/Leverage - Maintenance Margin Rate)
    precioLiquidacion = precioEntrada * (1 + 1 / leverage - maintenanceMarginRate);
  }

  precioLiquidacion = Math.max(0, precioLiquidacion);

  const distanciaLiquidacion = Math.abs(precioEntrada - precioLiquidacion);
  const distanciaPorcentaje = (distanciaLiquidacion / precioEntrada) * 100;

  const direccion = posicion === 'long' ? 'baje' : 'suba';

  const formula = posicion === 'long'
    ? `Liq = $${precioEntrada} × (1 - 1/${leverage} + ${tasaMant}%) = $${precioLiquidacion.toFixed(2)}`
    : `Liq = $${precioEntrada} × (1 + 1/${leverage} - ${tasaMant}%) = $${precioLiquidacion.toFixed(2)}`;

  const explicacion = `Con un ${posicion.toUpperCase()} a $${precioEntrada.toLocaleString()} con ${leverage}x leverage y $${margen.toLocaleString()} de margen (posición total: $${tamanoposicion.toLocaleString()}), tu precio de liquidación es $${precioLiquidacion.toFixed(2)}. Si el precio ${direccion} un ${distanciaPorcentaje.toFixed(2)}% ($${distanciaLiquidacion.toFixed(2)}), perdés todo el margen.`;

  return {
    precioLiquidacion: Number(precioLiquidacion.toFixed(2)),
    distanciaLiquidacion: Number(distanciaLiquidacion.toFixed(2)),
    distanciaPorcentaje: Number(distanciaPorcentaje.toFixed(2)),
    margenUsado: margen,
    tamanoposicion: Number(tamanoposicion.toFixed(2)),
    formula,
    explicacion,
  };
}
