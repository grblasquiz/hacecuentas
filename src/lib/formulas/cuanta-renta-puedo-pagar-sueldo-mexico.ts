/**
 * ¿Cuánta renta puedo pagar con mi sueldo? Regla del 30% + rangos conservador/flexible +
 * el requisito frecuente del arrendador en México de comprobar ingresos ≥ 3× la renta.
 * No usa constantes fiscales: son reglas de presupuesto sobre el ingreso del usuario.
 */
export interface Inputs {
  ingresoMensualNeto: number;      // ingreso mensual neto en mano ($)
  reglaPorcentaje: number;         // % del ingreso destinado a renta (regla), editable
  otrasDeudasMensuales: number;    // otras deudas/mensualidades ($)
}

export interface Outputs {
  rentaRecomendada: number;
  rentaConservadora: number;
  rentaMaxima: number;
  rentaSegun3x: number;
  disponibleDespuesRenta: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const ingreso = Math.max(0, Number(i.ingresoMensualNeto) || 0);
  const regla = Math.min(60, Math.max(5, Number(i.reglaPorcentaje) || 30));
  const deudas = Math.max(0, Number(i.otrasDeudasMensuales) || 0);

  const rentaRecomendada = ingreso * (regla / 100);
  const rentaConservadora = ingreso * 0.25;
  const rentaMaxima = ingreso * 0.35;
  const rentaSegun3x = ingreso / 3; // arrendador exige ingreso comprobable ≥ 3× renta
  const disponibleDespuesRenta = ingreso - rentaRecomendada - deudas;

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const money = (v: number) => '$' + Math.round(v).toLocaleString('es-MX');

  const _insight = {
    title: 'Cuánta renta podés pagar',
    text: `Con **${money(ingreso)}** de ingreso neto, la regla del **${regla}%** sugiere una renta de hasta **${money(rentaRecomendada)}** al mes. Muchos arrendadores además piden comprobar ingresos de **3×** la renta, lo que topa tu renta en **${money(rentaSegun3x)}**. Después de la renta y ${money(deudas)} de otras deudas te quedan **${money(disponibleDespuesRenta)}**.`,
    tone: disponibleDespuesRenta >= 0 ? 'good' : 'warn',
    icon: '🏘️',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Conservadora (25%)', `Recomendada (${Math.round(regla)}%)`, 'Máxima (35%)'],
    values: [Math.round(rentaConservadora), Math.round(rentaRecomendada), Math.round(rentaMaxima)],
    prefix: '$',
    ariaLabel: `Renta conservadora ${money(rentaConservadora)}, recomendada ${money(rentaRecomendada)} y máxima ${money(rentaMaxima)}.`,
  };

  return {
    rentaRecomendada: round2(rentaRecomendada),
    rentaConservadora: round2(rentaConservadora),
    rentaMaxima: round2(rentaMaxima),
    rentaSegun3x: round2(rentaSegun3x),
    disponibleDespuesRenta: round2(disponibleDespuesRenta),
    _insight,
    _chart,
  };
}
