export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mesadaPorEdadHijoSemanalMensual(i: Inputs): Outputs {
  const a=Number(i.edad)||0; const f=Number(i.factor)||1;
  const sem=a*f;
  return { semanal:`$${sem.toFixed(2)}`, mensual:`$${(sem*4).toFixed(2)}`, resumen:`Edad ${a}: $${sem}/semana ≈ $${(sem*4)}/mes.` };
}
