/** Toneladas de CO2 emitidas por un auto al año */
export interface Inputs { kmAnuales: number; consumoLPor100km: number; tipoCombustible: number; }
export interface Outputs { toneladasCO2: number; kgCO2: number; litrosAnuales: number; detalle: string; }

export function huellaCarbonoAutoAnual(i: Inputs): Outputs {
  const km = Number(i.kmAnuales);
  const consumo = Number(i.consumoLPor100km);
  const tipo = Number(i.tipoCombustible);

  if (!km || km <= 0) throw new Error('Ingresá los kilómetros anuales');
  if (!consumo || consumo <= 0) throw new Error('Ingresá el consumo del vehículo');
  if (tipo !== 1 && tipo !== 2) throw new Error('Elegí 1 (Nafta) o 2 (Diésel)');

  const factor = tipo === 1 ? 2.31 : 2.68;
  const nombreCombustible = tipo === 1 ? 'nafta' : 'diésel';
  const litros = (km * consumo) / 100;
  const kgCO2 = litros * factor;
  const toneladas = kgCO2 / 1000;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const fmt2 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    toneladasCO2: Number(toneladas.toFixed(2)),
    kgCO2: Number(kgCO2.toFixed(0)),
    litrosAnuales: Number(litros.toFixed(0)),
    detalle: `${fmt.format(km)} km/año × ${fmt2.format(consumo)} L/100km = ${fmt.format(litros)} litros de ${nombreCombustible} × ${fmt2.format(factor)} kg CO2/L = ${fmt.format(kgCO2)} kg CO2 = ${fmt2.format(toneladas)} toneladas de CO2 anuales.`,
  };
}
