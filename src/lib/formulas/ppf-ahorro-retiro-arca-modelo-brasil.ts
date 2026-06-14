export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ppfAhorroRetiroArcaModeloBrasil(i: Inputs): Outputs {
  // Anualidad de ahorro (modelo PPF / aportes periódicos para el retiro).
  // Valor futuro = aporte × (((1+i)^n − 1) / i) con i y n MENSUALES (aporte mensual).
  const aporte = Number(i.aporte) || 0;
  const anios = Number(i.anios) || 0;
  const tasaAnual = (Number(i.tasa) || 0) / 100;
  const im = tasaAnual / 12;       // tasa mensual
  const n = Math.round(anios * 12); // cantidad de aportes mensuales

  const totalAportado = aporte * n;
  // VF de una anualidad ordinaria (aporte al final de cada mes).
  const capital = im === 0 ? totalAportado : aporte * ((Math.pow(1 + im, n) - 1) / im);
  const interes = Math.max(0, capital - totalAportado);
  const pctInteres = capital > 0 ? (interes / capital) * 100 : 0;

  const fmt = (x: number) => '$' + Math.round(x).toLocaleString('es-AR');

  const tone = pctInteres >= 40 ? 'good' : pctInteres > 0 ? 'neutral' : 'warn';
  const insight = {
    title: 'Cuánto trabaja el interés compuesto',
    text: interes > 0
      ? `Aportando **${fmt(aporte)}/mes** durante **${anios} años** (**${n} aportes**) ponés de tu bolsillo **${fmt(totalAportado)}**, pero acumulás **${fmt(capital)}**. El interés compuesto suma **${fmt(interes)}** extra — un **${pctInteres.toFixed(0)}%** del capital final lo generó el rendimiento, no tu aporte.`
      : `Sin rendimiento (tasa 0%), tu capital final es exactamente lo que aportaste: **${fmt(totalAportado)}** en **${n} aportes** de **${fmt(aporte)}**. Subí la tasa para ver cuánto trabaja el interés compuesto.`,
    tone,
    icon: '📈',
  };

  const out: Outputs = {
    capital: fmt(capital),
    totalAportado: fmt(totalAportado),
    interes: fmt(interes),
    resumen: `Aportás ${fmt(aporte)}/mes por ${anios} años → acumulás ${fmt(capital)} (${fmt(totalAportado)} aportados + ${fmt(interes)} de interés).`,
    _insight: insight,
  };

  if (interes > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Lo que aportaste', value: Math.round(totalAportado) },
        { label: 'Interés ganado', value: Math.round(interes) },
      ],
      prefix: '$',
      centerValue: fmt(capital),
      centerLabel: 'Capital final',
      ariaLabel: `Del capital final de ${fmt(capital)}, ${fmt(totalAportado)} son tus aportes y ${fmt(interes)} es interés ganado.`,
    };
  }

  return out;
}
