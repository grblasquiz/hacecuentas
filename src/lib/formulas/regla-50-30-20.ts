/** Presupuesto personal con la regla 50/30/20 */

export interface Inputs {
  ingresoMensual: number;
}

export interface Outputs {
  necesidades: number;
  deseos: number;
  ahorro: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function regla503020(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoMensual);
  if (isNaN(ingreso) || ingreso <= 0) throw new Error('Ingresá tu ingreso mensual neto');

  const necesidades = ingreso * 0.50;
  const deseos = ingreso * 0.30;
  const ahorro = ingreso * 0.20;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Necesidades (50%): $${fmt.format(necesidades)} — alquiler, servicios, comida, transporte, salud. ` +
    `Deseos (30%): $${fmt.format(deseos)} — salidas, suscripciones, hobbies, ropa. ` +
    `Ahorro (20%): $${fmt.format(ahorro)} — fondo de emergencia, inversiones, metas.`;

  const fmtTotal = `$${fmt.format(Math.round(ingreso))}`;

  const _insight = {
    title: 'Tu reparto del mes',
    text: `De $${fmt.format(Math.round(ingreso))} mensuales, **$${fmt.format(Math.round(necesidades))}** van a necesidades, **$${fmt.format(Math.round(deseos))}** a deseos y **$${fmt.format(Math.round(ahorro))}** al ahorro. Si tus gastos fijos superan ese 50% de necesidades, recortá deseos antes de tocar el ahorro.`,
    tone: 'neutral',
    icon: '💰',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Necesidades (50%)', value: Math.round(necesidades) },
      { label: 'Deseos (30%)', value: Math.round(deseos) },
      { label: 'Ahorro (20%)', value: Math.round(ahorro) },
    ],
    prefix: '$',
    centerValue: fmtTotal,
    centerLabel: 'Ingreso mensual',
    ariaLabel: `Reparto del ingreso de ${fmtTotal}: necesidades $${fmt.format(Math.round(necesidades))}, deseos $${fmt.format(Math.round(deseos))} y ahorro $${fmt.format(Math.round(ahorro))}.`,
  };

  return {
    necesidades: Math.round(necesidades),
    deseos: Math.round(deseos),
    ahorro: Math.round(ahorro),
    detalle,
    _insight,
    _chart,
  };
}
