// Horas extras en Chile — Art. 32 Código del Trabajo. Recargo mínimo legal del 50%.
// La jornada ordinaria máxima baja a 42 horas semanales en 2026 (Ley 21.561).
// El valor de la hora ordinaria se obtiene dividiendo el sueldo entre las horas
// ordinarias del mes (jornada semanal proyectada a 30 días).
export interface Inputs {
  sueldoBase: number;
  horasSemana: number;
  cantHoras: number;
  recargoPct: number;
}

export interface Outputs {
  valorHoraOrdinaria: number;
  valorHoraExtra: number;
  totalPagar: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const sueldo = Math.max(0, i.sueldoBase || 0);
  const horasSemana = i.horasSemana && i.horasSemana > 0 ? i.horasSemana : 42;
  const cantHoras = Math.max(0, i.cantHoras || 0);
  const recargoPct = i.recargoPct != null && i.recargoPct >= 0 ? i.recargoPct : 50;

  const horasOrdinariasMes = (horasSemana / 7) * 30;
  const valorHoraOrdinaria = horasOrdinariasMes > 0 ? Math.round(sueldo / horasOrdinariasMes) : 0;
  const valorHoraExtra = Math.round(valorHoraOrdinaria * (1 + recargoPct / 100));
  const totalPagar = Math.round(valorHoraExtra * cantHoras);

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  const _insight = {
    title: `Horas extras: ${fmt(totalPagar)}`,
    text: `Tu hora ordinaria vale **${fmt(valorHoraOrdinaria)}**. Con el recargo del **${recargoPct}%**, cada hora extra se paga a **${fmt(valorHoraExtra)}**. Por **${cantHoras}** hora${cantHoras !== 1 ? 's' : ''} extra te corresponden **${fmt(totalPagar)}**.`,
    tone: 'good' as const,
    icon: '⏱️',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Hora ordinaria', value: valorHoraOrdinaria, color: '#64748b', colorDark: '#94a3b8' },
      { label: 'Hora extra', value: valorHoraExtra, color: '#2563eb', colorDark: '#3b82f6' },
    ],
    valueFormat: 'currency',
    ariaLabel: `Hora ordinaria ${fmt(valorHoraOrdinaria)} vs hora extra ${fmt(valorHoraExtra)} con recargo del ${recargoPct}%.`,
  };

  return { valorHoraOrdinaria, valorHoraExtra, totalPagar, _insight, _chart };
}
