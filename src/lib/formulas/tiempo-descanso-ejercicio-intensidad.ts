export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoDescansoEjercicioIntensidad(i: Inputs): Outputs {
  const obj = String(i.objetivo);
  const desc: Record<string, string> = { fuerza: '3-5 min', hipertrofia: '60-90 seg', resistencia: '15-60 seg' };
  return { descanso: desc[obj] || '2 min', resumen: `Descanso: ${desc[obj]} para objetivo ${obj}.` };
}
