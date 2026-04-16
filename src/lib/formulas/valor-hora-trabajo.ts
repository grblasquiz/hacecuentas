/** Valor real de tu hora de trabajo */
export interface Inputs { sueldoNeto: number; horasTrabajoSemana: number; horasViajeDiario?: number; gastosTransporteMes?: number; otrosGastosLaborales?: number; }
export interface Outputs { valorHoraReal: number; valorHoraSimple: number; horasTotalesMes: string; sueldoEfectivo: number; }

export function valorHoraTrabajo(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoNeto);
  const hsSemana = Number(i.horasTrabajoSemana);
  const hsViaje = Number(i.horasViajeDiario) || 0;
  const gastosTrans = Number(i.gastosTransporteMes) || 0;
  const otrosGastos = Number(i.otrosGastosLaborales) || 0;
  if (!sueldo || sueldo <= 0) throw new Error('Ingresá tu sueldo neto');
  if (!hsSemana || hsSemana <= 0) throw new Error('Ingresá las horas de trabajo semanales');

  const diasMes = 22;
  const hsTrabMes = hsSemana * 4.33;
  const hsViajeMes = hsViaje * diasMes;
  const hsTotales = hsTrabMes + hsViajeMes;
  const sueldoEfectivo = sueldo - gastosTrans - otrosGastos;
  const valorHoraReal = sueldoEfectivo / hsTotales;
  const valorHoraSimple = sueldo / hsTrabMes;

  return {
    valorHoraReal: Math.round(valorHoraReal),
    valorHoraSimple: Math.round(valorHoraSimple),
    horasTotalesMes: `${Math.round(hsTotales)} horas (${Math.round(hsTrabMes)} trabajo + ${Math.round(hsViajeMes)} viaje)`,
    sueldoEfectivo: Math.round(sueldoEfectivo),
  };
}
