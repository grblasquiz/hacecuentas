/** Consumo anual heladera según etiqueta energética y precio kWh */
export interface Inputs { capacidadLitros: number; etiquetaEnergetica: string; horasUsoDiario: number; precioKwh: number; }
export interface Outputs { consumoAnualKwh: number; costoAnual: number; costoMensual: number; ahorroVsClaseDPct: number; explicacion: string; _insight?: any; _chart?: any; }
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
  const ahorroR = Number(ahorroVsD.toFixed(2));
  const costoMensual = Number((costoAnual / 12).toFixed(2));

  let toneIns: 'good' | 'warn' | 'neutral';
  let txtIns: string;
  const costoTxt = precio > 0 ? ` y un gasto anual de **$${costoAnual.toFixed(0)}** (~$${costoMensual.toFixed(0)}/mes)` : '';
  if (ahorroR >= 35) {
    toneIns = 'good';
    txtIns = `Una heladera **clase ${etiq}** de ${cap}L consume ~**${consumo.toFixed(0)} kWh/año**${costoTxt}: muy eficiente, gastás **${ahorroR.toFixed(0)}% menos** que una clase D equivalente. La etiqueta se paga sola con el tiempo.`;
  } else if (ahorroR > 0) {
    toneIns = 'neutral';
    txtIns = `Una heladera **clase ${etiq}** de ${cap}L consume ~**${consumo.toFixed(0)} kWh/año**${costoTxt}: gastás **${ahorroR.toFixed(0)}% menos** que una clase D. Hay clases A+ / A++ que recortan bastante más el consumo.`;
  } else {
    toneIns = 'warn';
    txtIns = `Una heladera **clase ${etiq}** de ${cap}L consume ~**${consumo.toFixed(0)} kWh/año**${costoTxt}: está en el extremo ineficiente de la etiqueta${ahorroR < 0 ? ` (gasta ${Math.abs(ahorroR).toFixed(0)}% más que una clase D)` : ''}. Es el electrodoméstico que más horas funciona del año — conviene una clase A+ o mejor.`;
  }
  const _insight = { title: 'Qué tan eficiente es', text: txtIns, tone: toneIns, icon: '🧊' };

  const _chart = {
    type: 'scale' as const,
    marker: ahorroR,
    markerLabel: `Clase ${etiq}: ${ahorroR.toFixed(0)}%`,
    min: -20,
    unit: '%',
    segments: [
      { nombre: 'Ineficiente (D/E)', max: 0, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Básica (C)', max: 18, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Buena (B/A)', max: 45, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Muy eficiente (A+/A++)', max: 65, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Top (A+++)', max: Math.max(80, Math.ceil(ahorroR) + 5), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: `Eficiencia energética: la clase ${etiq} ahorra ${ahorroR.toFixed(0)}% de energía frente a una heladera clase D`,
  };

  return {
    consumoAnualKwh: Number(consumo.toFixed(2)),
    costoAnual: Number(costoAnual.toFixed(2)),
    costoMensual,
    ahorroVsClaseDPct: ahorroR,
    explicacion: `Heladera ${etiq} de ${cap}L consume ${consumo.toFixed(0)} kWh/año (${(consumo/12).toFixed(0)} kWh/mes). Costo anual ${costoAnual.toFixed(2)}. Ahorrás ${ahorroVsD.toFixed(0)}% vs una clase D.`,
    _insight,
    _chart,
  };
}
