export interface Inputs {
  totalVariable: number;     // total ganado por remuneración variable en el período (CLP)
  diasTrabajados: number;    // días efectivamente trabajados en el período
  domingosFestivos: number;  // domingos y festivos del período a pagar
}

export interface Outputs {
  promedioDiario: number;
  semanaCorrida: number;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const totalVariable = i.totalVariable > 0 ? i.totalVariable : 0;
  const diasTrabajados = i.diasTrabajados > 0 ? i.diasTrabajados : 0;
  const domingosFestivos = i.domingosFestivos >= 0 ? i.domingosFestivos : 0;

  // Semana corrida — Art. 45 del Código del Trabajo:
  // El trabajador con remuneración exclusivamente variable tiene derecho a remuneración
  // por los días domingo y festivos, equivalente al promedio diario de lo devengado.
  //   promedioDiario = total variable del período ÷ días efectivamente trabajados
  //   semana corrida = promedio diario × (domingos + festivos del período)
  const promedioDiario = diasTrabajados > 0 ? totalVariable / diasTrabajados : 0;
  const semanaCorrida = Math.round(promedioDiario * domingosFestivos);

  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  const insightText = diasTrabajados > 0
    ? `Tu promedio diario de remuneración variable es **${fmtCLP(promedioDiario)}** (${fmtCLP(totalVariable)} ÷ ${diasTrabajados} días trabajados). Por **${domingosFestivos}** domingo(s) y festivo(s) del período, la semana corrida que te corresponde es de **${fmtCLP(semanaCorrida)}**, que debe sumarse a tu liquidación.`
    : `Ingresá los días efectivamente trabajados para calcular el promedio diario y la semana corrida.`;

  return {
    promedioDiario: Math.round(promedioDiario),
    semanaCorrida,
    _insight: {
      title: 'Cuánto te toca de semana corrida',
      text: insightText,
      tone: 'neutral',
      icon: '🗓️',
    },
  };
}
