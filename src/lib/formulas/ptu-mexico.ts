/**
 * Calculadora de PTU (Participación de Trabajadores en las Utilidades) México
 * Ley Federal del Trabajo art. 117-131
 * 10% de la utilidad fiscal: 50% se reparte por días trabajados, 50% por salario.
 * Tope reforma 2021: el mayor entre 3 meses de salario o promedio PTU últimos 3 años.
 */

export interface Inputs {
  utilidadesEmpresa: number;
  salarioDiario: number;
  diasTrabajados?: number;
  totalDiasTodos: number;
  totalSalariosTodos: number;
  // retro-compat
  sueldoAnualBruto?: number;
  utilidadRepartible?: number;
  totalEmpleados?: number;
  totalSueldosEmpresa?: number;
  diasTrabajadosAnio?: number;
}

export interface Outputs {
  ptuTotal: number;
  ptuPorDias: number;
  ptuPorSalario: number;
  topeAplicado: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function ptuMexico(i: Inputs): Outputs {
  // Fuente de inputs: primero el layout nuevo (JSON MX) y fallback al viejo
  const salarioDiario = Number(i.salarioDiario ?? 0);
  const dias = Number(i.diasTrabajados ?? i.diasTrabajadosAnio ?? 365);
  const totalDiasTodos = Number(i.totalDiasTodos ?? 0);
  const totalSalariosTodos = Number(i.totalSalariosTodos ?? i.totalSueldosEmpresa ?? 0);
  const utilidadRepartir = i.utilidadRepartible !== undefined
    ? Number(i.utilidadRepartible)
    : (Number(i.utilidadesEmpresa ?? 0) * 0.10);
  const sueldoAnual = i.sueldoAnualBruto !== undefined
    ? Number(i.sueldoAnualBruto)
    : salarioDiario * dias;

  if (!salarioDiario && !i.sueldoAnualBruto) throw new Error('Ingresá tu salario diario');
  if (!utilidadRepartir || utilidadRepartir <= 0) throw new Error('Ingresá las utilidades de la empresa');
  if (!totalDiasTodos || totalDiasTodos <= 0) throw new Error('Ingresá el total de días trabajados de todos');
  if (!totalSalariosTodos || totalSalariosTodos <= 0) throw new Error('Ingresá el total de salarios anuales de todos');

  const mitad = utilidadRepartir / 2;
  const ptuPorDias = (dias / totalDiasTodos) * mitad;
  const ptuPorSalario = (sueldoAnual / totalSalariosTodos) * mitad;

  const ptuBrutaSinTope = ptuPorDias + ptuPorSalario;
  const topeTresMeses = (salarioDiario * 90) || (sueldoAnual / 12) * 3;
  const aplicaTope = ptuBrutaSinTope > topeTresMeses;
  const ptuTotal = aplicaTope ? topeTresMeses : ptuBrutaSinTope;

  const fmtMx = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });
  const _insight = aplicaTope
    ? {
        title: 'Tu PTU con tope aplicado',
        text: `Te corresponderían **$${fmtMx.format(Math.round(ptuBrutaSinTope))}**, pero la reforma 2021 limita la PTU a 3 meses de salario: cobrás **$${fmtMx.format(Math.round(ptuTotal))}**. El tope te recorta $${fmtMx.format(Math.round(ptuBrutaSinTope - ptuTotal))}.`,
        tone: 'warn',
        icon: '💰',
      }
    : {
        title: 'Tu reparto de utilidades',
        text: `Te corresponde una PTU de **$${fmtMx.format(Math.round(ptuTotal))}**: $${fmtMx.format(Math.round(ptuPorDias))} por días trabajados y $${fmtMx.format(Math.round(ptuPorSalario))} por tu salario. Quedás **por debajo del tope** de 3 meses ($${fmtMx.format(Math.round(topeTresMeses))}), así que cobrás el monto completo.`,
        tone: 'good',
        icon: '💰',
      };

  const out: Outputs = {
    ptuTotal: Number(ptuTotal.toFixed(2)),
    ptuPorDias: Number(ptuPorDias.toFixed(2)),
    ptuPorSalario: Number(ptuPorSalario.toFixed(2)),
    topeAplicado: Number(topeTresMeses.toFixed(2)),
    mensaje: aplicaTope
      ? `Tu PTU sería $${ptuBrutaSinTope.toFixed(2)} pero se aplica tope de 3 meses de sueldo: $${ptuTotal.toFixed(2)}.`
      : `Te corresponde una PTU de $${ptuTotal.toFixed(2)} (días: $${ptuPorDias.toFixed(2)} + salario: $${ptuPorSalario.toFixed(2)}).`,
    _insight,
  };

  // Donut sólo cuando NO se aplica el tope: las partes (días + salario) suman exactamente el total.
  if (!aplicaTope) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Por días trabajados', value: Number(ptuPorDias.toFixed(2)) },
        { label: 'Por salario', value: Number(ptuPorSalario.toFixed(2)) },
      ],
      prefix: '$',
      centerValue: `$${fmtMx.format(Math.round(ptuTotal))}`,
      centerLabel: 'PTU total',
      ariaLabel: `PTU de $${fmtMx.format(Math.round(ptuTotal))} repartida en mitad por días trabajados y mitad por salario`,
    };
  }

  return out;
}
