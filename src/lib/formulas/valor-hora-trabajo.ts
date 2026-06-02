/** Valor real de tu hora de trabajo */
export interface Inputs { sueldoNeto: number; horasTrabajoSemana: number; horasViajeDiario?: number; gastosTransporteMes?: number; otrosGastosLaborales?: number; }
export interface Outputs { valorHoraReal: number; valorHoraSimple: number; horasTotalesMes: string; sueldoEfectivo: number; _insight?: any; _chart?: any; }

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

  const fmtAr = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const brecha = valorHoraSimple - valorHoraReal;
  const brechaPct = valorHoraSimple > 0 ? (brecha / valorHoraSimple) * 100 : 0;
  const tieneOcultos = (hsViajeMes > 0 || gastosTrans > 0 || otrosGastos > 0);

  const insight = {
    title: 'Tu hora real vs. la nominal',
    text: tieneOcultos
      ? `Tu hora "de bolsillo" vale **${fmtAr(valorHoraReal)}**, un **${brechaPct.toFixed(0)}% menos** que los ${fmtAr(valorHoraSimple)} que sugiere el sueldo dividido por las horas de oficina. Los viajes y gastos laborales se comen esa diferencia.`
      : `Sin viajes ni gastos laborales, tu hora vale **${fmtAr(valorHoraReal)}** y coincide con el cálculo simple. Cargá tiempo de viaje o gastos para ver el costo oculto de trabajar.`,
    tone: brechaPct >= 20 ? 'warn' : (brechaPct > 0 ? 'neutral' : 'good'),
    icon: '⏱️',
  };

  const gastosLaboralesTot = gastosTrans + otrosGastos;
  const chart = (sueldo > 0 && gastosLaboralesTot > 0) ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Te queda en el bolsillo', value: Math.round(sueldoEfectivo) },
      ...(gastosTrans > 0 ? [{ label: 'Transporte', value: Math.round(gastosTrans) }] : []),
      ...(otrosGastos > 0 ? [{ label: 'Otros gastos laborales', value: Math.round(otrosGastos) }] : []),
    ],
    prefix: '$',
    centerValue: fmtAr(sueldo),
    centerLabel: 'Sueldo neto',
    ariaLabel: 'Distribución del sueldo neto entre lo que queda disponible y los gastos asociados a trabajar',
  } : undefined;

  return {
    valorHoraReal: Math.round(valorHoraReal),
    valorHoraSimple: Math.round(valorHoraSimple),
    horasTotalesMes: `${Math.round(hsTotales)} horas (${Math.round(hsTrabMes)} trabajo + ${Math.round(hsViajeMes)} viaje)`,
    sueldoEfectivo: Math.round(sueldoEfectivo),
    _insight: insight,
    ...(chart ? { _chart: chart } : {}),
  };
}
