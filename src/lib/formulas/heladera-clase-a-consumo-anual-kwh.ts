/** Consumo anual heladera según etiqueta energética y precio kWh */
export interface Inputs { capacidadLitros: number; etiquetaEnergetica: string; horasUsoDiario: number; precioKwh: number; }
export interface Outputs { consumoAnualKwh: number; costoAnual: number; costoMensual: number; ahorroVsClaseDPct: number; explicacion: string; }
export function heladeraClaseAConsumoAnualKwh(i: Inputs): Outputs {
  const cap = Number(i.capacidadLitros);
  const etiq = String(i.etiquetaEnergetica || 'A').toUpperCase().trim();
  const horas = Number(i.horasUsoDiario) || 24;
  const precio = Number(i.precioKwh) || 0;
  if (!cap || cap <= 0) throw new Error('Ingresá la capacidad en litros');
  // Coeficiente kWh/año aproximado por litro y etiqueta (basado en estándar UE/IRAM)
  const coef: Record<string, number> = { 'A+++': 0.45, 'A++': 0.6, 'A+': 0.75, 'A': 0.95, 'B': 1.15, 'C': 1.4, 'D': 1.7, 'E': 2.0 };
  const c = coef[etiq] ?? 0.95;
  const baseAnual = cap * c;
  const consumo = baseAnual * (horas / 24);
  const costoAnual = consumo * precio;
  const ahorroVsD = ((coef['D'] - c) / coef['D']) * 100;
  return {
    consumoAnualKwh: Number(consumo.toFixed(2)),
    costoAnual: Number(costoAnual.toFixed(2)),
    costoMensual: Number((costoAnual / 12).toFixed(2)),
    ahorroVsClaseDPct: Number(ahorroVsD.toFixed(2)),
    explicacion: `Heladera ${etiq} de ${cap}L consume ${consumo.toFixed(0)} kWh/año (${(consumo/12).toFixed(0)} kWh/mes). Costo anual ${costoAnual.toFixed(2)}. Ahorrás ${ahorroVsD.toFixed(0)}% vs una clase D.`,
  };
}
