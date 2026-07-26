// Feriado irrenunciable 18-19 de septiembre en Chile (Ley 19.973, trabajadores del comercio).
// Si un trabajador exceptuado (o uno del comercio al que igual lo hicieron trabajar) presta
// servicios en el festivo, esas horas exceden la jornada ordinaria y se pagan como horas
// extraordinarias con recargo mínimo del 50% (Art. 32 CT, doctrina DT).
// Multa al empleador por infringir el feriado irrenunciable: 5 UTM por trabajador (hasta 49
// trabajadores), 10 UTM (50-199) y 20 UTM (200 o más). UTM julio 2026: $71.649 (SII).
export interface Inputs {
  sueldoBase: number;
  horasSemana: number;
  horasTrabajadas: number;
  tamanoEmpresa: string; // "hasta49" | "50a199" | "200mas"
}

export interface Outputs {
  valorHoraOrdinaria: number;
  valorHoraFestivo: number;
  totalPagoFestivo: number;
  multaPorTrabajador: number;
  _insight?: any;
  _chart?: any;
}

const UTM = 71_649; // valor UTM julio 2026 (SII)
const MULTAS_UTM: Record<string, number> = { hasta49: 5, '50a199': 10, '200mas': 20 };

export function compute(i: Inputs): Outputs {
  const sueldo = Math.max(0, i.sueldoBase || 0);
  const horasSemana = i.horasSemana && i.horasSemana > 0 ? i.horasSemana : 42;
  const horas = Math.max(0, i.horasTrabajadas || 0);
  const multaUtm = MULTAS_UTM[i.tamanoEmpresa] ?? 5;

  const horasOrdinariasMes = (horasSemana / 7) * 30;
  const valorHoraOrdinaria = horasOrdinariasMes > 0 ? Math.round(sueldo / horasOrdinariasMes) : 0;
  const valorHoraFestivo = Math.round(valorHoraOrdinaria * 1.5);
  const totalPagoFestivo = Math.round(valorHoraFestivo * horas);
  const multaPorTrabajador = multaUtm * UTM;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  const _insight = {
    title: `Pago por el festivo trabajado: ${fmt(totalPagoFestivo)}`,
    text: `Tu hora ordinaria vale **${fmt(valorHoraOrdinaria)}**; trabajada en el feriado irrenunciable se paga como extraordinaria a **${fmt(valorHoraFestivo)}** (recargo 50%). Por **${horas}** hora${horas !== 1 ? 's' : ''} te corresponden **${fmt(totalPagoFestivo)}**. Ojo: si sos dependiente del comercio no exceptuado, el empleador además arriesga una multa de **${multaUtm} UTM (${fmt(multaPorTrabajador)})** por cada trabajador afectado.`,
    tone: 'warn' as const,
    icon: '🇨🇱',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Hora ordinaria', value: valorHoraOrdinaria, color: '#64748b', colorDark: '#94a3b8' },
      { label: 'Hora en festivo (+50%)', value: valorHoraFestivo, color: '#dc2626', colorDark: '#ef4444' },
    ],
    valueFormat: 'currency',
    ariaLabel: `Hora ordinaria ${fmt(valorHoraOrdinaria)} vs hora trabajada en feriado irrenunciable ${fmt(valorHoraFestivo)} con recargo del 50%.`,
  };

  return { valorHoraOrdinaria, valorHoraFestivo, totalPagoFestivo, multaPorTrabajador, _insight, _chart };
}
