/**
 * Retroactivo por aumento de sueldo Venezuela.
 *
 * Cuando un aumento salarial entra en vigencia con efecto retroactivo, el trabajador
 * cobra la diferencia entre el sueldo nuevo y el anterior por cada mes transcurrido
 * desde la fecha de vigencia del aumento.
 *
 *   diferenciaMensual = sueldoNuevo − sueldoAnterior
 *   totalRetroactivo  = diferenciaMensual × meses
 *
 * Aritmética simple; aplica a aumentos del salario mínimo, paquetes salariales o
 * homologaciones de convención colectiva con efecto retroactivo.
 */
import { fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  sueldoAnterior: number;  // sueldo previo al aumento (Bs.)
  sueldoNuevo: number;     // sueldo nuevo tras el aumento (Bs.)
  meses: number;           // meses con efecto retroactivo
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function retroactivoAumentoSueldoVenezuela(i: Inputs): Outputs {
  const sueldoAnterior = Math.max(0, Number(i.sueldoAnterior) || 0);
  const sueldoNuevo = Math.max(0, Number(i.sueldoNuevo) || 0);
  const meses = Math.max(0, Number(i.meses) || 0);

  if (sueldoNuevo <= 0) throw new Error('Ingresá el sueldo nuevo');
  if (meses <= 0) throw new Error('Ingresá los meses con efecto retroactivo');

  const diferenciaMensual = sueldoNuevo - sueldoAnterior;
  const totalRetroactivo = diferenciaMensual * meses;

  const signo = diferenciaMensual >= 0 ? 'a tu favor' : 'en contra (el sueldo nuevo es menor)';

  const _insight = {
    type: 'highlight',
    icon: '📈',
    text: `La diferencia entre el sueldo nuevo (**${fmtVES(sueldoNuevo)}**) y el anterior (**${fmtVES(sueldoAnterior)}**) es **${fmtVES(diferenciaMensual)}** por mes. ` +
      `Por **${meses}** mes(es) de retroactivo, te corresponden **${fmtVES(totalRetroactivo)}** ${signo}.`,
  };

  const _table = {
    title: 'Cálculo del retroactivo',
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Sueldo anterior', fmtVES(sueldoAnterior)],
      ['Sueldo nuevo', fmtVES(sueldoNuevo)],
      ['Diferencia mensual', fmtVES(diferenciaMensual)],
      [`Meses con retroactivo`, String(meses)],
      ['Total retroactivo', fmtVES(totalRetroactivo)],
    ],
    note: 'El retroactivo es la diferencia mensual multiplicada por los meses transcurridos desde la fecha de vigencia del aumento. No incluye incidencias en prestaciones, vacaciones ni utilidades, que se recalculan aparte.',
  };

  return {
    diferenciaMensual: Number(diferenciaMensual.toFixed(2)),
    totalRetroactivo: Number(totalRetroactivo.toFixed(2)),
    detalle: `${fmtVES(diferenciaMensual)} × ${meses} mes(es) = ${fmtVES(totalRetroactivo)}`,
    _insight,
    _table,
  };
}
