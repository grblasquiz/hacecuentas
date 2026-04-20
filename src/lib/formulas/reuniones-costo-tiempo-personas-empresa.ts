export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function reunionesCostoTiempoPersonasEmpresa(i: Inputs): Outputs {
  const p=Number(i.personas)||0; const d=Number(i.duracionMin)||0; const s=Number(i.sueldoPromedioMes)||0;
  const sHora=s/176;
  const horas=d/60;
  const costo=p*horas*sHora;
  return { costoReunion:`$${Math.round(costo).toLocaleString('es-AR')}`, porHora:`$${Math.round(sHora).toLocaleString('es-AR')}/persona/h`, observacion:costo>50000?'Caro — evalúa si async puede reemplazar.':'Razonable' };
}
