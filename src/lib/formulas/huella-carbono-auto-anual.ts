/** Toneladas de CO2 emitidas por un auto al año */
export interface Inputs { kmAnuales: number; consumoLPor100km: number; tipoCombustible: number; }
export interface Outputs { toneladasCO2: number; kgCO2: number; litrosAnuales: number; detalle: string; _insight?: any; _chart?: any; }

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

  const ton2 = Number(toneladas.toFixed(2));
  const arboles = Math.ceil(kgCO2 / 22);

  // Insight dinámico por nivel de emisión del vehículo
  let _insight: any;
  if (ton2 < 1.5) {
    _insight = { title: 'Auto de baja huella', text: `Tu vehículo emite **${fmt2.format(ton2)} t CO₂/año** quemando **${fmt.format(litros)} litros** de ${nombreCombustible}. Es un nivel bajo: compensarlo equivale a unos **${arboles} árboles**.`, tone: 'good', icon: '🚗' };
  } else if (ton2 <= 3) {
    _insight = { title: 'Huella típica', text: `Tu auto emite **${fmt2.format(ton2)} t CO₂/año** (**${fmt.format(litros)} litros** de ${nombreCombustible}). Está en el rango habitual de un vehículo particular; compensarlo requiere unos **${arboles} árboles**.`, tone: 'neutral', icon: '🚗' };
  } else {
    _insight = { title: 'Huella alta', text: `Tu auto emite **${fmt2.format(ton2)} t CO₂/año** (**${fmt.format(litros)} litros** de ${nombreCombustible}). Es un nivel alto: hacen falta unos **${arboles} árboles** para compensarlo. Reducir kilómetros o un vehículo más eficiente bajan bastante la cifra.`, tone: 'warn', icon: '🚗' };
  }

  // Gauge: zonas de emisión anual de un auto particular
  const _chart = {
    type: 'scale',
    marker: ton2,
    markerLabel: `${fmt2.format(ton2)} t/año`,
    min: 0,
    segments: [
      { nombre: 'Baja', max: 1.5, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Típica', max: 3, color: '#eab308', colorDark: '#ca8a04' },
      { nombre: 'Alta', max: Math.max(5, Math.ceil(ton2 + 1)), color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Nivel de emisiones de tu auto: ${fmt2.format(ton2)} toneladas de CO₂ al año`,
  };

  return {
    toneladasCO2: ton2,
    kgCO2: Number(kgCO2.toFixed(0)),
    litrosAnuales: Number(litros.toFixed(0)),
    detalle: `${fmt.format(km)} km/año × ${fmt2.format(consumo)} L/100km = ${fmt.format(litros)} litros de ${nombreCombustible} × ${fmt2.format(factor)} kg CO2/L = ${fmt.format(kgCO2)} kg CO2 = ${fmt2.format(toneladas)} toneladas de CO2 anuales.`,
    _insight,
    _chart,
  };
}
