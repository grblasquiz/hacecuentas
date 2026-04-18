export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function podarRosalCuandoFecha(i: Inputs): Outputs {
  const plan: Record<string, string> = { frio: 'Agosto-septiembre (fin invierno)', templado: 'Junio-julio (invierno)', calido: 'Mayo-junio (transición)' };
  const z = String(i.zona);
  return { mejorEpoca: plan[z] || 'Invierno', resumen: `Mejor época poda rosales en zona ${z}: ${plan[z]}.` };
}
