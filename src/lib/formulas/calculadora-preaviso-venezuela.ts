/**
 * Calculadora de preaviso laboral en Venezuela (LOTTT, Art. 81).
 *
 * Cuando el patrono despide sin causa justificada (o cuando el trabajador renuncia),
 * debe darse un preaviso cuya duración depende de la antigüedad. Si no se concede,
 * se paga en dinero: días de preaviso × salario diario. La tabla referencial de
 * días por antigüedad se lee de src/lib/data/venezuela-2026.ts (lottt.preaviso),
 * NO se hardcodea.
 *
 *   Antigüedad           Preaviso (referencial)
 *   < 1 mes              no aplica
 *   1 a 6 meses          1 semana (7 días)
 *   6 meses a 1 año      2 semanas (15 días)
 *   más de 1 año         1 mes (30 días)
 *
 * Fuente: LOTTT (INCES), Art. 81.
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual?: number; // Bs./mes
  aniosAntiguedad?: number; // años (puede ser fraccionario)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

/** Días de preaviso por antigüedad (en meses) según la tabla LOTTT del data file. */
function diasPreavisoLottt(meses: number): { dias: number; descripcion: string } {
  const tabla = VENEZUELA_2026.lottt.preaviso;
  const tramo = tabla.find((t) => meses <= t.hastaMeses)!;
  // Descripción legible del tramo.
  let descripcion: string;
  if (tramo.dias === 0) descripcion = 'menos de 1 mes — no aplica preaviso';
  else if (tramo.dias === 7) descripcion = '1 a 6 meses — 1 semana';
  else if (tramo.dias === 15) descripcion = '6 meses a 1 año — 2 semanas';
  else descripcion = 'más de 1 año — 1 mes';
  return { dias: tramo.dias, descripcion };
}

export function calculadoraPreavisoVenezuela(i: Inputs): Outputs {
  const salarioMensual = Math.max(0, Number(i.salarioMensual) || 0);
  if (!salarioMensual) throw new Error('Ingresá tu salario mensual en bolívares');

  const aniosAntiguedad = Math.max(0, Number(i.aniosAntiguedad) || 0);
  const meses = aniosAntiguedad * 12;

  const salarioDiario = salarioMensual / 30;
  const { dias, descripcion } = diasPreavisoLottt(meses);
  const montoPreaviso = dias * salarioDiario;

  const narrativa = dias === 0
    ? `Con menos de 1 mes de antigüedad, la LOTTT no exige preaviso. ` +
      `Tu salario diario es ${fmtVES(salarioDiario)}.`
    : `Con ${aniosAntiguedad.toLocaleString('de-DE', { maximumFractionDigits: 1 })} años de antigüedad ` +
      `(${descripcion}), el preaviso es de ${dias} días. A un salario diario de ${fmtVES(salarioDiario)}, ` +
      `eso equivale a ${fmtVES(montoPreaviso)} si se paga en dinero en vez de concederse el tiempo.`;

  // Tabla completa de tramos (referencial) construida desde el data file.
  const tablaRows = [
    ['Menos de 1 mes', 'No aplica', '—'],
    ['1 a 6 meses', '7 días (1 semana)', fmtVES(7 * salarioDiario)],
    ['6 meses a 1 año', '15 días (2 semanas)', fmtVES(15 * salarioDiario)],
    ['Más de 1 año', '30 días (1 mes)', fmtVES(30 * salarioDiario)],
  ];

  return {
    // Titular: monto del preaviso en Bs. (o "no aplica").
    montoPreaviso: dias === 0
      ? 'No aplica (menos de 1 mes)'
      : `${fmtVES(montoPreaviso)} (${dias} días)`,
    diasPreaviso: dias,
    salarioDiario: `${fmtVES(salarioDiario)} por día`,
    tramoAplicado: descripcion,
    montoBolivares: Number(montoPreaviso.toFixed(2)),
    _insight: {
      type: 'highlight',
      icon: '📄',
      text: narrativa,
    },
    _table: {
      title: 'Preaviso por antigüedad (LOTTT Art. 81) — tu salario',
      headers: ['Antigüedad', 'Días de preaviso', 'Equivale a (con tu salario)'],
      rows: tablaRows,
      note: 'Tabla referencial del Art. 81 de la LOTTT. El preaviso puede otorgarse como tiempo de trabajo o pagarse en dinero (días × salario diario). En despidos injustificados, además del preaviso corresponden la indemnización del Art. 92 (igual a las prestaciones) y la liquidación completa. El salario diario se calcula como salario mensual ÷ 30.',
    },
  };
}
