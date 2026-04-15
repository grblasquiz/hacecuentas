/** Comparación costo mensual agua caliente: termo eléctrico vs gas */
export interface Inputs {
  litrosDiarios: number;
  precioKwh: number;
  precioM3Gas: number;
  eficienciaElectrico?: number;
  eficienciaGas?: number;
}
export interface Outputs {
  costoMensualElectrico: number;
  costoMensualGas: number;
  ahorroMensual: number;
  detalle: string;
}

export function ahorroTermoElectricoVsGas(i: Inputs): Outputs {
  const litros = Number(i.litrosDiarios);
  const precioKwh = Number(i.precioKwh);
  const precioM3 = Number(i.precioM3Gas);
  const efElec = (Number(i.eficienciaElectrico) || 95) / 100;
  const efGas = (Number(i.eficienciaGas) || 80) / 100;

  if (!litros || litros <= 0) throw new Error('Ingresá los litros de agua caliente por día');
  if (!precioKwh || precioKwh <= 0) throw new Error('Ingresá el precio del kWh');
  if (!precioM3 || precioM3 <= 0) throw new Error('Ingresá el precio del m³ de gas');

  const deltaT = 40; // 55°C - 15°C
  const kcalDiarias = litros * deltaT; // 1 litro × 1 kcal/(kg°C) × deltaT
  const kwhTermicos = kcalDiarias / 860; // 1 kWh = 860 kcal

  // Eléctrico
  const kwhElecDiario = kwhTermicos / efElec;
  const costoElecMes = kwhElecDiario * precioKwh * 30;

  // Gas natural: 1 m³ = 10.4 kWh (~8950 kcal)
  const kwhGasDiario = kwhTermicos / efGas;
  const m3GasDiario = kwhGasDiario / 10.4;
  const costoGasMes = m3GasDiario * precioM3 * 30;

  const ahorro = Math.abs(costoElecMes - costoGasMes);
  const masBarato = costoGasMes <= costoElecMes ? 'gas' : 'eléctrico';

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    costoMensualElectrico: Math.round(costoElecMes),
    costoMensualGas: Math.round(costoGasMes),
    ahorroMensual: Math.round(ahorro),
    detalle: `Para ${litros} L/día: eléctrico $${fmt.format(costoElecMes)}/mes vs gas $${fmt.format(costoGasMes)}/mes. El ${masBarato} es más barato por $${fmt.format(ahorro)}/mes (${((ahorro / Math.max(costoElecMes, costoGasMes)) * 100).toFixed(0)}% de ahorro).`,
  };
}
