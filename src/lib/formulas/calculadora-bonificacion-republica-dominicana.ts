/**
 * Bonificación / participación en los beneficios — República Dominicana
 * (Art. 223 y siguientes, Código de Trabajo Ley 16-92).
 *
 * La empresa que obtiene beneficios reparte el 10% de sus utilidades netas anuales
 * entre los trabajadores. El reparto tiene un TOPE por trabajador:
 *   - 45 días de salario ordinario si el trabajador tiene menos de 3 años de servicio.
 *   - 60 días de salario ordinario si tiene 3 años o más.
 * El día de salario sale del divisor universal (mensual ÷ 23,83). Se paga entre 90
 * y 120 días después del cierre del ejercicio. Están exentas, entre otras, las
 * empresas de zonas francas y las agrícolas/industriales en sus primeros 3 años.
 *
 * Como el reparto real depende de la utilidad de la empresa y de toda la nómina,
 * esta calculadora devuelve el TOPE legal que te corresponde (lo que cobra la
 * mayoría) y, si cargás la utilidad neta, el 10% del pool repartible a título
 * informativo.
 *
 * Datos y helpers desde la tabla maestra única.
 */
import {
  REPUBLICA_DOMINICANA_2026 as DO,
  salarioDiario,
  fmtDOP,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual: number;
  aniosAntiguedad: number;
  /** Utilidad neta anual de la empresa (opcional, RD$). */
  utilidadNetaAnual?: number;
}

export interface Outputs {
  topeDias: number;
  salarioDiario: number;
  topeBonificacion: number;
  poolRepartible: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
  _steps?: any;
}

export function calculadoraBonificacionRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const anios = Math.max(0, Math.floor(Number(i.aniosAntiguedad) || 0));
  const utilidad = Math.max(0, Number(i.utilidadNetaAnual) || 0);

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual en RD$');

  const bono = DO.laboral.bonificacion;
  const diario = salarioDiario(salario);
  const topeDias = anios >= 3 ? bono.topeDias3anios : bono.topeDiasMenos3anios;
  const tope = diario * topeDias;
  const pool = utilidad > 0 ? utilidad * bono.porcentajeUtilidades : 0;

  const formula = `Tope = salario diario × ${topeDias} días = RD$${diario.toFixed(2)} × ${topeDias} = ${fmtDOP(tope)}`;

  const explicacion = `Con ${anios} año${anios === 1 ? '' : 's'} de antigüedad tu bonificación tiene un tope de ${topeDias} días de salario (Art. 223). Salario diario RD$${diario.toFixed(2)} (mensual ÷ 23,83) × ${topeDias} días = ${fmtDOP(tope)}. La empresa reparte el 10% de su utilidad neta anual entre todo el personal; si ese 10% repartido te asigna más que el tope, igual cobrás el tope.${utilidad > 0 ? ` Con una utilidad neta de ${fmtDOP(utilidad)}, el pool total a repartir (10%) es ${fmtDOP(pool)}.` : ''}`;

  const cobras = pool > 0 ? Math.min(tope, pool) : tope;

  const _steps = [
    { label: 'Salario diario (mensual ÷ 23,83)', value: fmtDOP(diario) },
    { label: `Tope legal (${topeDias} días)`, value: fmtDOP(tope) },
    ...(utilidad > 0 ? [{ label: 'Pool repartible (10% de la utilidad)', value: fmtDOP(pool) }] : []),
  ];

  const _insight = {
    title: `Tu bonificación máxima es ${fmtDOP(tope)}`,
    text: `Por tener ${anios >= 3 ? '3 años o más' : 'menos de 3 años'} de antigüedad, el tope de tu participación en los beneficios es **${topeDias} días** de salario: **${fmtDOP(tope)}**.${utilidad > 0 ? ` La empresa reparte **${fmtDOP(pool)}** (10% de su utilidad) entre todo el personal.` : ' La empresa debe repartir el 10% de su utilidad neta; cobrás lo que te toque de ese reparto, con este tope.'}`,
    tone: 'good' as const,
    icon: '💰',
  };

  const _table = {
    title: 'Tope de bonificación por antigüedad (Art. 223)',
    headers: ['Antigüedad', 'Tope (días de salario)', 'Tu tope con este salario'],
    rows: [
      ['Menos de 3 años', `${bono.topeDiasMenos3anios} días`, fmtDOP(diario * bono.topeDiasMenos3anios)],
      ['3 años o más', `${bono.topeDias3anios} días`, fmtDOP(diario * bono.topeDias3anios)],
    ],
    note: 'La participación es el 10% de la utilidad neta anual repartido entre el personal, con este tope por trabajador. Exentas: zonas francas y empresas agrícolas/industriales en sus primeros 3 años.',
  };

  return {
    topeDias,
    salarioDiario: Math.round(diario * 100) / 100,
    topeBonificacion: Math.round(tope * 100) / 100,
    poolRepartible: Math.round(pool * 100) / 100,
    formula,
    explicacion,
    _insight,
    _table,
    _steps,
  };
}
