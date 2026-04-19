export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function bajaAutoDesarmeChatarraFinVida(i: Inputs): Outputs {
  const m=String(i.motivo||'dest');
  const c: Record<string,number> = { dest:60000, expo:85000, chat:45000 };
  return { costo:'$'+(c[m]||60000).toLocaleString('es-AR'), beneficio:'Cese patente + responsabilidad civil', resumen:`Baja ${m}: $${(c[m]||60000).toLocaleString('es-AR')}.` };
}
