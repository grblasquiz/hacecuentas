/**
 * Calculadora de Presupuesto Luna de Miel por Destino.
 */
export interface PresupuestoLunaMielDestinoDiasInputs { destino:string; dias:number; nivel:string; }
export interface PresupuestoLunaMielDestinoDiasOutputs { costoTotal:number; costoPorDia:number; vuelosEstimados:number; hotelEstimado:number; comidaActividades:number; }
export function presupuestoLunaMielDestinoDias(inputs: PresupuestoLunaMielDestinoDiasInputs): PresupuestoLunaMielDestinoDiasOutputs {
  const destino = inputs.destino;
  const dias = Number(inputs.dias);
  const nivel = inputs.nivel;
  if (!dias || dias <= 0) throw new Error('Ingresá días');
  const perDay: Record<string, Record<string, number>> = {
    argentina: { economico: 100, medio: 200, lujo: 400 },
    uruguay: { economico: 150, medio: 250, lujo: 500 },
    caribe: { economico: 240, medio: 400, lujo: 800 },
    brasil: { economico: 180, medio: 320, lujo: 650 },
    europa: { economico: 250, medio: 450, lujo: 1100 },
    asia: { economico: 300, medio: 550, lujo: 1700 },
    usa: { economico: 300, medio: 500, lujo: 1150 },
  };
  const costoPorDia = perDay[destino]?.[nivel] || 300;
  const costoTotal = costoPorDia * dias;
  return {
    costoTotal,
    costoPorDia,
    vuelosEstimados: Math.round(costoTotal * 0.35),
    hotelEstimado: Math.round(costoTotal * 0.4),
    comidaActividades: Math.round(costoTotal * 0.25),
  };
}
