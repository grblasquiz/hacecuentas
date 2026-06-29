/**
 * Calculadora de sueldo neto en Venezuela (deducciones de ley, 2026).
 *
 * Deducciones obligatorias del trabajador sobre el salario:
 *   - SSO (Seguro Social Obligatorio): 4% del salario, con tope de 5 salarios mínimos.
 *   - RPE (Régimen Prestacional de Empleo / paro forzoso): 0,5% del salario.
 *   - FAOV (Fondo de Ahorro Obligatorio para la Vivienda): 1% del salario.
 *
 * Neto = salario − (SSO + RPE + FAOV).
 *
 * Datos: salario y salario mínimo son inputs (salario mínimo default Bs. 130, base
 * legal LOTTT). Los porcentajes están fijados por ley. Moneda: bolívar (VES).
 * Fuente: Ley del Seguro Social, LRPE, Ley del Régimen Prestacional de Vivienda.
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual?: number;
  salarioMinimo?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const TASA_SSO = 0.04;   // 4% Seguro Social Obligatorio
const TOPE_SSO_SM = 5;   // tope = 5 salarios mínimos
const TASA_RPE = 0.005;  // 0,5% Régimen Prestacional de Empleo
const TASA_FAOV = 0.01;  // 1% Fondo de Ahorro Obligatorio para la Vivienda

export function sueldoNetoDeduccionesVenezuela(i: Inputs): Outputs {
  const salarioMensual = Math.max(0, Number(i.salarioMensual) || 0);
  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual en bolívares.');
  const salarioMinimo = Math.max(1, Number(i.salarioMinimo) || VENEZUELA_2026.salarioMinimoVes);

  const topeSSO = TOPE_SSO_SM * salarioMinimo;
  const baseSSO = Math.min(salarioMensual, topeSSO);
  const sso = baseSSO * TASA_SSO;
  const rpe = salarioMensual * TASA_RPE;
  const faov = salarioMensual * TASA_FAOV;
  const totalDeducciones = sso + rpe + faov;
  const neto = salarioMensual - totalDeducciones;

  const pctDeduccion = salarioMensual > 0 ? (totalDeducciones / salarioMensual) * 100 : 0;
  const narrativa =
    `De un salario bruto de ${fmtVES(salarioMensual)} se descuentan ${fmtVES(totalDeducciones)} ` +
    `(SSO ${fmtVES(sso)}, RPE ${fmtVES(rpe)}, FAOV ${fmtVES(faov)}), equivalente al ${pctDeduccion.toFixed(2)}%. ` +
    `Tu sueldo neto queda en ${fmtVES(neto)}.`;

  return {
    sso,
    rpe,
    faov,
    totalDeducciones,
    neto,
    _insight: {
      type: 'highlight',
      icon: '💵',
      text: narrativa,
    },
    _table: {
      title: 'Deducciones de ley sobre el salario',
      headers: ['Concepto', 'Base', 'Tasa', 'Monto'],
      rows: [
        ['SSO (Seguro Social)', fmtVES(baseSSO), '4%', fmtVES(sso)],
        ['RPE (paro forzoso)', fmtVES(salarioMensual), '0,5%', fmtVES(rpe)],
        ['FAOV (vivienda)', fmtVES(salarioMensual), '1%', fmtVES(faov)],
        ['Total deducciones', '—', '—', fmtVES(totalDeducciones)],
        ['Sueldo neto', '—', '—', fmtVES(neto)],
      ],
      note: `El SSO (4%) se calcula con tope de 5 salarios mínimos (${fmtVES(topeSSO)} con salario mínimo de ${fmtVES(salarioMinimo)}). RPE 0,5% y FAOV 1% se calculan sobre el salario completo. Son las deducciones obligatorias del trabajador en Venezuela.`,
    },
  };
}
