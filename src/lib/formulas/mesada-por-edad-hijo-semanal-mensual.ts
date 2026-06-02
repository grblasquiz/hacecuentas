export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function mesadaPorEdadHijoSemanalMensual(i: Inputs): Outputs {
  const a=Number(i.edad)||0; const f=Number(i.factor)||1;
  const sem=a*f;
  const mes=sem*4;
  const _insight = {
    title: 'Mesada sugerida',
    text: `Con la regla **edad × factor (${f})**, a los **${a} años** corresponde una mesada de **$${sem.toFixed(2)}/semana** (≈ **$${mes.toFixed(2)}/mes**). Es un punto de partida: ajustalo a tu presupuesto y enseñale a separar una parte para ahorro.`,
    tone: 'neutral',
    icon: '🐷',
  };
  return { semanal:`$${sem.toFixed(2)}`, mensual:`$${(sem*4).toFixed(2)}`, resumen:`Edad ${a}: $${sem}/semana ≈ $${(sem*4)}/mes.`, _insight };
}
