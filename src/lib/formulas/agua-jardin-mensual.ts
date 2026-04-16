/** Agua de jardín: consumo mensual */
export interface Inputs { superficieM2: number; tipoVegetacion?: string; estacion?: string; precioM3?: number; }
export interface Outputs { litrosMes: number; m3Mes: number; litrosDia: number; costoMes: number; }

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

  return {
    litrosMes: Math.round(litrosMes),
    m3Mes: Number(m3.toFixed(1)),
    litrosDia: Math.round(litrosDia),
    costoMes: Math.round(costo),
  };
}
