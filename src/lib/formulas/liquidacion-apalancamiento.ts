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
  _insight?: any;
  _chart?: any;
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

  const distPct = Number(distanciaPorcentaje.toFixed(2));
  let tone: 'good' | 'warn' | 'neutral';
  let riesgo: string;
  if (distPct < 5) { tone = 'warn'; riesgo = 'riesgo muy alto'; }
  else if (distPct < 15) { tone = 'warn'; riesgo = 'riesgo elevado'; }
  else if (distPct < 30) { tone = 'neutral'; riesgo = 'colchón moderado'; }
  else { tone = 'good'; riesgo = 'colchón amplio'; }
  const _insight = {
    title: `Te liquidan a $${precioLiquidacion.toFixed(2)}`,
    text: `Un **${posicion.toUpperCase()}** a ${leverage}x se liquida si el precio ${direccion} solo **${distPct.toFixed(2)}%** (hasta $${precioLiquidacion.toFixed(2)}): ${riesgo}. Ahí perdés los **$${margen.toLocaleString()}** de margen completos.`,
    tone,
    icon: tone === 'warn' ? '⚠️' : '📉',
  };
  const greenMax = Math.max(distPct + 1, 30);
  const _chart = {
    type: 'scale',
    marker: distPct,
    markerLabel: `${distPct.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Muy riesgoso', max: 5, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Elevado', max: 15, color: '#f97316', colorDark: '#c2410c' },
      { nombre: 'Moderado', max: 30, color: '#eab308', colorDark: '#a16207' },
      { nombre: 'Holgado', max: greenMax, color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Distancia a la liquidación: ${distPct.toFixed(1)}%. Menos de 5% es riesgo muy alto, más de 30% es un colchón holgado.`,
  };
  return {
    precioLiquidacion: Number(precioLiquidacion.toFixed(2)),
    distanciaLiquidacion: Number(distanciaLiquidacion.toFixed(2)),
    distanciaPorcentaje: distPct,
    margenUsado: margen,
    tamanoposicion: Number(tamanoposicion.toFixed(2)),
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
