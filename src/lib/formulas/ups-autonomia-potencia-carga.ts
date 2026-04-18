export interface UpsAutonomiaPotenciaCargaInputs { vaUps: number; cargaW: number; ahBateria: number; vBateria: number; eficiencia?: number; }
export interface UpsAutonomiaPotenciaCargaOutputs { minutos: string; porcentajeCarga: string; resumen: string; }
export function upsAutonomiaPotenciaCarga(i: UpsAutonomiaPotenciaCargaInputs): UpsAutonomiaPotenciaCargaOutputs {
  const va = Number(i.vaUps); const w = Number(i.cargaW); const ah = Number(i.ahBateria);
  const v = Number(i.vBateria); const eff = Number(i.eficiencia ?? 85) / 100;
  if (!va || !w || !ah || !v) throw new Error('Completá todos los campos');
  const energia = ah * v * eff;
  const minutos = (energia * 60) / w;
  const pct = (w / (va * 0.6)) * 100;
  return { minutos: minutos.toFixed(1) + ' min', porcentajeCarga: pct.toFixed(0) + '%',
    resumen: `Autonomía ~${minutos.toFixed(0)} min con carga ${w}W (${pct.toFixed(0)}% del UPS). ${pct > 80 ? 'Carga alta — autonomía real puede ser menor.' : 'Carga moderada.'}` };
}
