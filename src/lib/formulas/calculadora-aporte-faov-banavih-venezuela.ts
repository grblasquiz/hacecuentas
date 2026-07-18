/**
 * Aporte FAOV / BANAVIH — Fondo de Ahorro Obligatorio para la Vivienda.
 * Decreto con Rango, Valor y Fuerza de Ley del Régimen Prestacional de Vivienda
 * y Hábitat (Reforma Decreto Nº 9.048), Art. 30.
 *
 *   - Trabajador: 1% del salario integral mensual (retención).
 *   - Patrono:    2% del salario integral mensual (aporte).
 *   - Total:      3% del salario integral, que entera el patrono ante BANAVIH
 *                 los primeros 5 días de cada mes.
 *
 * Fuente: BANAVIH; Decreto Nº 9.048 (Asamblea Nacional).
 */
import { FAOV_BANAVIH, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioIntegralMensual?: number; // salario integral mensual en Bs.
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const salario = Math.max(0, Number(i.salarioIntegralMensual) || 0);
  if (!salario) throw new Error('Ingresá el salario integral mensual (Bs.)');

  const aporteTrabajador = salario * FAOV_BANAVIH.trabajador; // 1%
  const aportePatrono = salario * FAOV_BANAVIH.patrono;       // 2%
  const aporteTotal = salario * FAOV_BANAVIH.total;           // 3%
  const aporteAnual = aporteTotal * 12;

  const _insight = {
    type: 'highlight',
    icon: '🏠',
    text: `Sobre un salario integral de **${fmtVES(salario)}**, el aporte mensual al FAOV es **${fmtVES(aporteTotal)}** (3%): ` +
      `**${fmtVES(aporteTrabajador)}** que se le retienen al trabajador (1%) y **${fmtVES(aportePatrono)}** que pone el patrono (2%). ` +
      `En un año se acumulan **${fmtVES(aporteAnual)}** en tu cuenta de ahorro habitacional en BANAVIH.`,
  };

  const _table = {
    title: 'Desglose del aporte FAOV (3% del salario integral)',
    headers: ['Concepto', 'Tasa', 'Monto mensual'],
    rows: [
      ['Retención al trabajador', '1%', fmtVES(aporteTrabajador)],
      ['Aporte del patrono', '2%', fmtVES(aportePatrono)],
      ['Total mensual al FAOV', '3%', fmtVES(aporteTotal)],
      ['Acumulado en un año', '—', fmtVES(aporteAnual)],
    ],
    note: 'La base es el SALARIO INTEGRAL (no solo el básico). El patrono entera el 3% ante BANAVIH los primeros 5 días de cada mes. Fuente: Ley del Régimen Prestacional de Vivienda y Hábitat, Art. 30.',
  };

  return {
    aporteTotal: Number(aporteTotal.toFixed(2)),
    aporteTrabajador: Number(aporteTrabajador.toFixed(2)),
    aportePatrono: Number(aportePatrono.toFixed(2)),
    aporteAnual: Number(aporteAnual.toFixed(2)),
    detalle: `Trabajador 1% ${fmtVES(aporteTrabajador)} + patrono 2% ${fmtVES(aportePatrono)} = ${fmtVES(aporteTotal)}/mes`,
    _insight,
    _table,
  };
}
