/** Agua de jardín: consumo mensual */
export interface Inputs { superficieM2: number; tipoVegetacion?: string; estacion?: string; precioM3?: number; }
export interface Outputs { litrosMes: number; m3Mes: number; litrosDia: number; costoMes: number; _insight?: any; }

const LITROS_DIA_M2: Record<string, number> = {
  cesped: 5, cantero: 3, huerta: 4, xerofilas: 1.5, mixto: 4,
};
const FACTOR_EST: Record<string, number> = { verano: 1.0, primavera: 0.6, invierno: 0.25 };

export function aguaJardinMensual(i: Inputs): Outputs {
  const m2 = Number(i.superficieM2);
  if (!m2 || m2 <= 0) throw new Error('Ingresá la superficie del jardín');
  const tipo = String(i.tipoVegetacion || 'cesped');
  const est = String(i.estacion || 'verano');
  const precio = Number(i.precioM3) || 0;

  const base = LITROS_DIA_M2[tipo] || 4;
  const factor = FACTOR_EST[est] || 1;
  const litrosDia = m2 * base * factor;
  const litrosMes = litrosDia * 30;
  const m3 = litrosMes / 1000;
  const costo = m3 * precio;

  const tone = costo > 0 && costo >= 5000 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Tu consumo de riego',
    text: `Regar ${Math.round(m2)} m² gasta unos **${Math.round(litrosDia)} L por día** (**${Number(m3.toFixed(1))} m³ al mes**)${costo > 0 ? `, ~**$${Math.round(costo).toLocaleString('es-AR')}** de agua` : ''}.${tone === 'warn' ? ' Regá temprano o al atardecer para evitar evaporación y bajar el gasto.' : ' Regá al amanecer o atardecer para que el agua rinda más.'}`,
    tone,
    icon: '🌱',
  };

  return {
    litrosMes: Math.round(litrosMes),
    m3Mes: Number(m3.toFixed(1)),
    litrosDia: Math.round(litrosDia),
    costoMes: Math.round(costo),
    _insight,
  };
}
