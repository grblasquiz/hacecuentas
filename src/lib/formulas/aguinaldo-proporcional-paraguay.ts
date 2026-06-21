/**
 * Aguinaldo proporcional — PARAGUAY.
 * Caso de quien NO trabajó el año calendario completo (ingreso a mitad de año,
 * renuncia, despido, fin de contrato). El aguinaldo se prorratea por el tiempo
 * efectivamente trabajado:
 *
 *   aguinaldo = salarioMensual × (meses + díasSueltos/30) / 12
 *
 * Código del Trabajo (Ley 213/93), art. 243. Datos desde paraguay-2026.ts.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface AguinaldoProporcionalParaguayInputs {
  salarioMensual: number | string;
  mesesTrabajados: number | string;
  diasSueltos?: number | string;
}

export interface AguinaldoProporcionalParaguayOutputs {
  aguinaldoProporcional: number;
  mesesEquivalentes: number;
  aguinaldoCompletoReferencia: number;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

export function aguinaldoProporcionalParaguay(i: AguinaldoProporcionalParaguayInputs): AguinaldoProporcionalParaguayOutputs {
  const salario = Math.max(0, Number(i.salarioMensual) || 0);
  if (salario <= 0) throw new Error('Ingresá tu salario mensual');

  let meses = Number(i.mesesTrabajados);
  if (!Number.isFinite(meses) || meses < 0) meses = 0;
  meses = Math.min(12, meses);

  const diasMes = PARAGUAY_2026.diasMes; // 30
  let dias = Number(i.diasSueltos);
  if (!Number.isFinite(dias) || dias < 0) dias = 0;
  dias = Math.min(diasMes, dias);

  const divisor = PARAGUAY_2026.laboral.aguinaldoDivisor; // 12

  // Fracción del año trabajada, en meses equivalentes (con prorrateo diario).
  const mesesEquivalentes = meses + dias / diasMes;
  const fraccionTrabajada = Math.min(12, mesesEquivalentes);

  const aguinaldoProporcional = (salario * fraccionTrabajada) / divisor;
  const aguinaldoCompletoReferencia = (salario * 12) / divisor; // = salario

  const detalleDias = dias > 0 ? ` y ${dias} ${dias === 1 ? 'día' : 'días'}` : '';
  const resumen = `${fmtPYG(salario)}/mes × ${meses} ${meses === 1 ? 'mes' : 'meses'}${detalleDias} ÷ 12 = ${fmtPYG(aguinaldoProporcional)}`;

  const formula = `Aguinaldo proporcional = salario × (meses + días/30) ÷ 12 = ${fmtPYG(salario)} × ${fraccionTrabajada.toFixed(2)} ÷ 12 = ${fmtPYG(aguinaldoProporcional)}`;

  const _insight = {
    type: 'highlight' as const,
    icon: '🧮',
    text: `Por trabajar **${meses} ${meses === 1 ? 'mes' : 'meses'}${detalleDias}** del año, te corresponde un aguinaldo proporcional de **${fmtPYG(aguinaldoProporcional)}** — la parte del aguinaldo completo (${fmtPYG(aguinaldoCompletoReferencia)}) que ganaste hasta tu salida. Te lo deben pagar junto a la liquidación final.`,
  };

  const _table = {
    title: 'Aguinaldo proporcional vs. año completo',
    headers: ['Escenario', 'Tiempo trabajado', 'Aguinaldo'],
    rows: [
      ['Tu caso (proporcional)', `${meses} m${detalleDias}`, fmtPYG(aguinaldoProporcional)],
      ['Año completo (referencia)', '12 meses', fmtPYG(aguinaldoCompletoReferencia)],
    ],
    note: 'El aguinaldo proporcional se paga cuando termina la relación laboral antes de fin de año (renuncia, despido, fin de contrato) o cuando ingresaste durante el año. Cada mes (o fracción mayor a la mitad) suma su parte. No se le descuenta IPS.',
  };

  return {
    aguinaldoProporcional: Math.round(aguinaldoProporcional),
    mesesEquivalentes: Number(fraccionTrabajada.toFixed(2)),
    aguinaldoCompletoReferencia: Math.round(aguinaldoCompletoReferencia),
    resumen,
    formula,
    _insight,
    _table,
  };
}
