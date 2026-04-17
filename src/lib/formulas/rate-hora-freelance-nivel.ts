/** Rate por hora freelance según nivel */
export interface Inputs {
  nivel: string;
  ingresoAnualObjetivo: number;
  horasSemana: number;
  semanasAno: number;
  overheadPct: number;
}
export interface Outputs {
  rateHora: number;
  rateMinimo: number;
  rateMaximo: number;
  horasAnuales: number;
  ingresoBrutoNecesario: number;
}
export function rateHoraFreelanceNivel(i: Inputs): Outputs {
  const obj = Number(i.ingresoAnualObjetivo);
  const hs = Number(i.horasSemana);
  const sem = Number(i.semanasAno);
  const over = Number(i.overheadPct) / 100;
  const nivel = String(i.nivel || 'semi');
  if (!obj || obj <= 0) throw new Error('Ingresá el ingreso objetivo');
  if (!hs || hs <= 0) throw new Error('Ingresá horas por semana');
  if (!sem || sem <= 0) throw new Error('Ingresá semanas al año');
  if (over >= 1) throw new Error('Overhead debe ser menor al 100%');
  const multMap: Record<string, number> = { junior: 0.6, semi: 1.0, senior: 1.6, experto: 2.5 };
  const mult = multMap[nivel] || 1.0;
  const horasAnuales = hs * sem;
  const ingresoBruto = obj / (1 - over);
  const rateBase = ingresoBruto / horasAnuales;
  const rate = rateBase * mult;
  return {
    rateHora: Math.round(rate),
    rateMinimo: Math.round(rate * 0.8),
    rateMaximo: Math.round(rate * 1.2),
    horasAnuales: Math.round(horasAnuales),
    ingresoBrutoNecesario: Math.round(ingresoBruto)
  };
}
