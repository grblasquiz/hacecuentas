/** Distribución sueldo regla 50/30/20 */

export interface Inputs {
  ingresoMensual: number;
  moneda?: string;
  ingresosExtra?: number;
}

export interface Outputs {
  necesidades50: number;
  deseos30: number;
  ahorro20: number;
  necesidades: number;
  deseos: number;
  ahorro: number;
  ahorroAnual: number;
  detalle: string;
  formula: string;
  explicacion: string;
}

export function presupuesto503020(i: Inputs): Outputs {
  const ingresoBase = Number(i.ingresoMensual);
  const extras = Number(i.ingresosExtra) || 0;
  const ingreso = ingresoBase + extras;
  const moneda = String(i.moneda || '$');

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso mensual');

  const necesidades50 = ingreso * 0.50;
  const deseos30 = ingreso * 0.30;
  const ahorro20 = ingreso * 0.20;
  const ahorroAnual = ahorro20 * 12;

  const detalle = `Total ingresos: ${moneda}${Math.round(ingreso).toLocaleString()}${extras > 0 ? ` (sueldo ${moneda}${Math.round(ingresoBase).toLocaleString()} + extras ${moneda}${Math.round(extras).toLocaleString()})` : ''}. Distribución: 50% necesidades = ${moneda}${Math.round(necesidades50).toLocaleString()} | 30% deseos = ${moneda}${Math.round(deseos30).toLocaleString()} | 20% ahorro = ${moneda}${Math.round(ahorro20).toLocaleString()}. En un año, el ahorro acumulado sería ${moneda}${Math.round(ahorroAnual).toLocaleString()}.`;

  const formula = `${moneda}${ingreso.toLocaleString()} → 50%: ${moneda}${Math.round(necesidades50).toLocaleString()} | 30%: ${moneda}${Math.round(deseos30).toLocaleString()} | 20%: ${moneda}${Math.round(ahorro20).toLocaleString()}`;
  const explicacion = `Ingreso mensual: ${moneda}${ingreso.toLocaleString()}. **50% necesidades**: ${moneda}${Math.round(necesidades50).toLocaleString()} (alquiler, servicios, comida, transporte, salud). **30% deseos**: ${moneda}${Math.round(deseos30).toLocaleString()} (entretenimiento, restaurantes, ropa, suscripciones). **20% ahorro/inversión**: ${moneda}${Math.round(ahorro20).toLocaleString()}/mes = ${moneda}${Math.round(ahorroAnual).toLocaleString()}/año. Si no llegás al 50/30/20, empezá con 60/20/20 o 70/20/10 y ajustá gradualmente.`;

  return {
    necesidades50: Math.round(necesidades50),
    deseos30: Math.round(deseos30),
    ahorro20: Math.round(ahorro20),
    necesidades: Math.round(necesidades50),
    deseos: Math.round(deseos30),
    ahorro: Math.round(ahorro20),
    ahorroAnual: Math.round(ahorroAnual),
    detalle,
    formula,
    explicacion,
  };
}
