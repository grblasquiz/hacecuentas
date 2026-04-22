/** Costo mensual aire acondicionado: frigorías × horas/día × días/mes × tarifa kWh */
export interface Inputs {
  frigorias: number; // frig/h del equipo
  eer: number; // coeficiente eficiencia (3 fijo típico, 4-5 inverter)
  horasDia: number;
  diasMes: number;
  tarifaKwh: number; // en moneda local
  moneda: string; // ARS | MXN | CLP | EUR | USD
}

export interface Outputs {
  kwhMes: string;
  costoMesFormateado: string;
  costoDiaFormateado: string;
  costoHoraFormateado: string;
  potenciaConsumoWatts: string;
  costoMes: number;
  ahorroInverterVsFijo: string;
}

function fmt(moneda: string, n: number): string {
  const monedaUpper = moneda.toUpperCase();
  const rounded = Math.round(n);
  const localized = rounded.toLocaleString('es-AR');
  if (monedaUpper === 'ARS') return 'ARS $' + localized;
  if (monedaUpper === 'MXN') return 'MXN $' + rounded.toLocaleString('es-MX');
  if (monedaUpper === 'CLP') return 'CLP $' + rounded.toLocaleString('es-CL');
  if (monedaUpper === 'EUR') return '€ ' + n.toFixed(2);
  if (monedaUpper === 'USD') return 'USD ' + n.toFixed(2);
  return monedaUpper + ' ' + localized;
}

export function costoMensualAireAcondicionado(i: Inputs): Outputs {
  const frig = Number(i.frigorias) || 0;
  const eer = Number(i.eer) || 3;
  const hsDia = Number(i.horasDia) || 0;
  const dias = Number(i.diasMes) || 0;
  const tarifa = Number(i.tarifaKwh) || 0;
  const moneda = (i.moneda || 'ARS').toUpperCase();

  if (frig <= 0 || eer <= 0 || hsDia < 0 || dias < 0 || tarifa < 0) {
    throw new Error('Valores inválidos');
  }

  // Convertir frigorías a watts térmicos: 1 frig/h = 1,163 W térmicos
  const wattsTermicos = frig * 1.163;
  // Consumo eléctrico = watts térmicos / EER
  const wattsElectricos = wattsTermicos / eer;
  const kwhHora = wattsElectricos / 1000;
  const kwhMes = kwhHora * hsDia * dias;

  const costoMes = kwhMes * tarifa;
  const costoDia = costoMes / (dias || 1);
  const costoHora = costoMes / (hsDia * dias || 1);

  // Ahorro inverter vs fijo: asumiendo inverter EER 4,5 vs fijo EER 3
  const kwhInverter = (wattsTermicos / 4.5 / 1000) * hsDia * dias;
  const kwhFijo = (wattsTermicos / 3 / 1000) * hsDia * dias;
  const ahorroKwh = kwhFijo - kwhInverter;
  const ahorroMoney = ahorroKwh * tarifa;

  return {
    kwhMes: kwhMes.toFixed(1) + ' kWh',
    costoMesFormateado: fmt(moneda, costoMes),
    costoDiaFormateado: fmt(moneda, costoDia),
    costoHoraFormateado: fmt(moneda, costoHora),
    potenciaConsumoWatts: Math.round(wattsElectricos) + ' W',
    costoMes: Math.round(costoMes),
    ahorroInverterVsFijo: fmt(moneda, ahorroMoney) + ' / mes',
  };
}
