export interface InversorSolarPotenciaInputs { cargasContinuas: number; cargasPicoMotores?: number; }
export interface InversorSolarPotenciaOutputs { nominal: string; pico: string; resumen: string; }
export function inversorSolarPotencia(i: InversorSolarPotenciaInputs): InversorSolarPotenciaOutputs {
  const c = Number(i.cargasContinuas); const m = Number(i.cargasPicoMotores ?? 0);
  if (!c) throw new Error('Ingresá cargas continuas');
  const total = c + m;
  const nominal = total * 1.25;
  const pico = c + m * 3;
  return { nominal: nominal.toFixed(0) + ' W', pico: pico.toFixed(0) + ' W',
    resumen: `Inversor ${(nominal/1000).toFixed(1)} kW nominal con capacidad pico ${(pico/1000).toFixed(1)} kW. ${m > 0 ? 'Importante: pico por arranque de motores.' : ''}` };
}
