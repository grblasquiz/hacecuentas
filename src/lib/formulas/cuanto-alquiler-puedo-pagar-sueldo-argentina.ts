import { fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * ¿Cuánto alquiler podés pagar con tu sueldo? Regla del 30% sobre el ingreso neto,
 * contando alquiler + expensas como costo total de vivienda, con rangos 25% (conservador)
 * y 35% (límite). Mercado libre post-derogación de la ley de alquileres: sin tope legal,
 * el tope es tu presupuesto.
 */
export function compute(i: Inputs): Outputs {
  const ingreso = Math.max(0, Number(i.ingresoNeto) || 0);
  const regla = Math.min(60, Math.max(10, Number(i.reglaPorcentaje) || 30));
  const expensas = Math.max(0, Number(i.expensas) || 0);
  const otrasDeudas = Math.max(0, Number(i.otrasDeudas) || 0);

  const presupuestoVivienda = ingreso * (regla / 100);
  const alquilerMax = Math.max(0, presupuestoVivienda - expensas);
  const conservador = Math.max(0, ingreso * 0.25 - expensas);
  const limite = Math.max(0, ingreso * 0.35 - expensas);
  const disponible = ingreso - presupuestoVivienda - otrasDeudas;
  const ingresoNecesarioPorCada100k = 100000 / (regla / 100);

  const out: Outputs = {
    alquilerRecomendado: fmtARS(alquilerMax),
    rangoConservador: fmtARS(conservador),
    rangoLimite: fmtARS(limite),
    disponibleDespues: fmtARS(disponible),
    reglaAplicada: `${regla}% del ingreso para alquiler + expensas`,
  };

  out._insight = {
    title: `Podés pagar hasta ${fmtARS(alquilerMax)} de alquiler`,
    text:
      `Con **${fmtARS(ingreso)}** netos por mes, la regla del **${regla}%** deja **${fmtARS(presupuestoVivienda)}** para vivienda. ` +
      (expensas > 0
        ? `Descontando **${fmtARS(expensas)}** de expensas, el alquiler puro puede llegar a **${fmtARS(alquilerMax)}**. `
        : `Si el departamento tiene expensas, restalas de ese número: acá asumimos $0. `) +
      `Rango sano: entre **${fmtARS(conservador)}** (25%) y **${fmtARS(limite)}** (35%). Después de vivienda${otrasDeudas > 0 ? ` y ${fmtARS(otrasDeudas)} de otras deudas` : ''} te quedan **${fmtARS(disponible)}** para vivir. ` +
      `Regla rápida: por cada $100.000 de alquiler necesitás ~**${fmtARS(ingresoNecesarioPorCada100k)}** de ingreso neto. Muchas inmobiliarias piden demostrar ingresos por 3 veces el alquiler, entre titular y garantes.`,
    tone: disponible >= 0 && ingreso > 0 ? 'good' : ingreso === 0 ? 'neutral' : 'warn',
    icon: '🏠',
  };
  return out;
}
