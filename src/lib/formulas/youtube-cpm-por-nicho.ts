/** YT CPM por nicho */
export interface YoutubeCpmPorNichoInputs { nicho: string; vistasMensuales: number; fillRate: number; }
export interface YoutubeCpmPorNichoOutputs { cpmEstimado: number; rpmEstimado: number; ingresoMensual: number; ingresoAnual: number; }
const CPM: Record<string, number> = { finanzas:25, tech:20, salud:10, educacion:8, viajes:7, lifestyle:6, cocina:5, gaming:4, musica:2.5, entretenimiento:3.5, infantil:1.2 };
export function youtubeCpmPorNicho(inputs: YoutubeCpmPorNichoInputs): YoutubeCpmPorNichoOutputs {
  const v=Number(inputs.vistasMensuales), f=Number(inputs.fillRate);
  if (!inputs.nicho || !CPM[inputs.nicho]) throw new Error('Selecciona un nicho valido');
  if (!v || v<=0) throw new Error('Vistas invalidas');
  if (f<0 || f>100) throw new Error('Fill rate 0-100');
  const cpm=CPM[inputs.nicho], rpm=cpm*0.55*(f/100), m=(v/1000)*rpm;
  return { cpmEstimado:+cpm.toFixed(2), rpmEstimado:+rpm.toFixed(2), ingresoMensual:+m.toFixed(2), ingresoAnual:+(m*12).toFixed(2) };
}
