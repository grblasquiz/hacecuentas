export interface InversorSolarPotenciaInputs { cargasContinuas: number; cargasPicoMotores?: number; }
export interface InversorSolarPotenciaOutputs { nominal: string; pico: string; resumen: string; _insight?: any; }
export function inversorSolarPotencia(i: InversorSolarPotenciaInputs): InversorSolarPotenciaOutputs {
  const c = Number(i.cargasContinuas); const m = Number(i.cargasPicoMotores ?? 0);
  if (!c) throw new Error('Ingresá cargas continuas');
  const total = c + m;
  const nominal = total * 1.25;
  const pico = c + m * 3;
  const hayMotores = m > 0;
  const _insight = {
    title: 'Inversor que necesitás',
    text: hayMotores
      ? `Buscá un inversor de **${(nominal/1000).toFixed(1)} kW nominales** (carga + 25% de margen), pero que tolere picos de **${(pico/1000).toFixed(1)} kW**: el arranque de motores triplica el consumo por unos segundos y un inversor sin ese pico se apaga.`
      : `Con tus cargas, un inversor de **${(nominal/1000).toFixed(1)} kW nominales** alcanza (incluye 25% de margen sobre los ${(total/1000).toFixed(1)} kW de consumo). Sin motores, el pico **${(pico/1000).toFixed(1)} kW** queda holgado.`,
    tone: hayMotores ? 'warn' : 'good',
    icon: '🔋',
  };
  return { nominal: nominal.toFixed(0) + ' W', pico: pico.toFixed(0) + ' W',
    resumen: `Inversor ${(nominal/1000).toFixed(1)} kW nominal con capacidad pico ${(pico/1000).toFixed(1)} kW. ${m > 0 ? 'Importante: pico por arranque de motores.' : ''}`,
    _insight };
}
