/**
 * Aumento de renta permitido por año en México, tomando como tope la inflación anual (INPC),
 * criterio habitual en contratos y en la Ley de Vivienda de la CDMX. El INPC anual se ingresa
 * como dato editable (cambia cada mes): la calculadora no hardcodea inflación.
 */
export interface Inputs {
  rentaActual: number;             // renta mensual actual ($)
  inpcAnualPorcentaje: number;     // inflación anual (INPC) del último año (%), editable
  incrementoPropuesto: number;     // aumento que te proponen (%), para comparar
}

export interface Outputs {
  aumentoPermitido: number;
  rentaMaximaPermitida: number;
  rentaConPropuesto: number;
  excedeLimite: string;
  diferenciaMensual: number;
  diferenciaAnual: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const renta = Math.max(0, Number(i.rentaActual) || 0);
  const inpc = Math.max(0, Number(i.inpcAnualPorcentaje) || 0);
  const propuesto = Math.max(0, Number(i.incrementoPropuesto) || 0);

  const aumentoPermitido = renta * (inpc / 100);
  const rentaMaximaPermitida = renta + aumentoPermitido;
  const rentaConPropuesto = renta * (1 + propuesto / 100);

  const excede = propuesto > inpc + 1e-9;
  const diferenciaMensual = rentaConPropuesto - rentaMaximaPermitida; // + si el propuesto excede el INPC
  const diferenciaAnual = diferenciaMensual * 12;

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const money = (v: number) => '$' + Math.round(v).toLocaleString('es-MX');

  const excedeLimite = excede
    ? `Sí: el ${propuesto}% supera el INPC (${inpc}%)`
    : `No: el ${propuesto}% está dentro del INPC (${inpc}%)`;

  const _insight = {
    title: excede ? 'El aumento propuesto excede el INPC' : 'El aumento propuesto es válido',
    text: excede
      ? `Con un INPC del **${inpc}%**, tu renta de **${money(renta)}** solo debería subir hasta **${money(rentaMaximaPermitida)}**. El **${propuesto}%** propuesto la lleva a **${money(rentaConPropuesto)}**: **${money(diferenciaMensual)}** de más al mes (**${money(diferenciaAnual)}** al año). Podés negociarlo apoyándote en el INPC.`
      : `El aumento del **${propuesto}%** deja la renta en **${money(rentaConPropuesto)}**, dentro del tope del INPC (**${money(rentaMaximaPermitida)}** con **${inpc}%**). Es un ajuste razonable frente a la inflación.`,
    tone: excede ? 'warn' : 'good',
    icon: '📈',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Renta actual', 'Máx. por INPC', 'Aumento propuesto'],
    values: [Math.round(renta), Math.round(rentaMaximaPermitida), Math.round(rentaConPropuesto)],
    prefix: '$',
    ariaLabel: `Renta actual ${money(renta)}, máxima por INPC ${money(rentaMaximaPermitida)} y con el aumento propuesto ${money(rentaConPropuesto)}.`,
  };

  return {
    aumentoPermitido: round2(aumentoPermitido),
    rentaMaximaPermitida: round2(rentaMaximaPermitida),
    rentaConPropuesto: round2(rentaConPropuesto),
    excedeLimite,
    diferenciaMensual: round2(diferenciaMensual),
    diferenciaAnual: round2(diferenciaAnual),
    _insight,
    _chart,
  };
}
