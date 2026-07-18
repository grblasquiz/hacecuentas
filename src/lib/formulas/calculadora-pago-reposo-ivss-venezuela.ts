/**
 * Pago del reposo médico (incapacidad temporal) — IVSS, Venezuela.
 * Ley del Seguro Social, Art. 9 y Reglamento.
 *
 *   - Días 1 a 3: los paga el PATRONO al 100% del salario.
 *   - Desde el día 4 y hasta 52 semanas: el IVSS paga la indemnización diaria =
 *     2/3 (66,66%) del salario normal. El patrono suele completar el 33,34%
 *     restante según contrato/convención (opcional en el cálculo).
 *
 * Fuente: Ley del Seguro Social (Justia VE); IVSS — Base Legal Indemnizaciones.
 */
import { IVSS_REPOSO, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual?: number;   // salario normal mensual en Bs.
  diasReposo?: number;       // días totales de reposo
  patronoCompleta?: string;  // "si" | "no" — ¿el patrono completa el 33,34%?
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const salarioMensual = Math.max(0, Number(i.salarioMensual) || 0);
  if (!salarioMensual) throw new Error('Ingresá tu salario normal mensual (Bs.)');

  const diasReposo = Math.max(1, Math.floor(Number(i.diasReposo) || 0));
  if (!diasReposo) throw new Error('Ingresá los días de reposo');

  const patronoCompleta = String(i.patronoCompleta ?? 'si') === 'si';

  const salarioDiario = salarioMensual / 30;

  // Días 1-3: patrono al 100%.
  const diasPatrono100 = Math.min(diasReposo, IVSS_REPOSO.diasEmpleador100);
  // Desde el día 4, con tope de 52 semanas (361 días subsidiables).
  const maxDiasSubsidio = IVSS_REPOSO.maxSemanas * 7 - IVSS_REPOSO.diasEmpleador100; // 361
  const diasSubsidio = Math.min(Math.max(0, diasReposo - IVSS_REPOSO.diasEmpleador100), maxDiasSubsidio);

  const pagoPatrono100 = diasPatrono100 * salarioDiario;
  const subsidioIvss = diasSubsidio * salarioDiario * IVSS_REPOSO.porcentajeIvss;
  const complementoPatrono = patronoCompleta
    ? diasSubsidio * salarioDiario * IVSS_REPOSO.porcentajePatronoComplemento
    : 0;
  const totalPercibido = pagoPatrono100 + subsidioIvss + complementoPatrono;
  const salarioSinReposo = diasReposo * salarioDiario; // lo que ganaría trabajando
  const perdida = Math.max(0, salarioSinReposo - totalPercibido);

  const _insight = {
    type: 'highlight',
    icon: '🩺',
    text: `Con un salario de **${fmtVES(salarioMensual)}** (${fmtVES(salarioDiario)}/día) y **${diasReposo} días** de reposo: ` +
      `el patrono te paga los primeros ${diasPatrono100} día(s) al 100% (**${fmtVES(pagoPatrono100)}**) y desde el día 4 el IVSS te cubre el 66,66% ` +
      `(**${fmtVES(subsidioIvss)}** por ${diasSubsidio} día(s)). ` +
      (patronoCompleta
        ? `Si el patrono completa el 33,34% (**${fmtVES(complementoPatrono)}**), cobrás **${fmtVES(totalPercibido)}**, casi tu salario completo.`
        : `Sin complemento del patrono cobrás **${fmtVES(totalPercibido)}** y dejás de percibir **${fmtVES(perdida)}** frente a un mes trabajado.`),
  };

  const _table = {
    title: 'Cómo se paga tu reposo IVSS',
    headers: ['Concepto', 'Días', 'Base', 'Monto'],
    rows: [
      ['Patrono (días 1-3, 100%)', String(diasPatrono100), '100% salario', fmtVES(pagoPatrono100)],
      ['IVSS (desde día 4, 66,66%)', String(diasSubsidio), '66,66% salario', fmtVES(subsidioIvss)],
      ['Complemento patrono (33,34%)', patronoCompleta ? String(diasSubsidio) : '0', patronoCompleta ? '33,34% salario' : 'No aplica', fmtVES(complementoPatrono)],
      ['Total que percibís', String(diasReposo), '—', fmtVES(totalPercibido)],
    ],
    note: 'El IVSS paga 2/3 (66,66%) del salario desde el día 4 y hasta 52 semanas por un mismo caso. El complemento del 33,34% no es obligatorio por ley: depende del contrato o convención colectiva. Validá el reposo ante el IVSS dentro de las 72 horas.',
  };

  return {
    subsidioIvss: Number(subsidioIvss.toFixed(2)),
    pagoPatrono100: Number(pagoPatrono100.toFixed(2)),
    complementoPatrono: Number(complementoPatrono.toFixed(2)),
    totalPercibido: Number(totalPercibido.toFixed(2)),
    detalle: `Patrono 3 días ${fmtVES(pagoPatrono100)} + IVSS 66,66% ${fmtVES(subsidioIvss)}${patronoCompleta ? ` + complemento ${fmtVES(complementoPatrono)}` : ''} = ${fmtVES(totalPercibido)}`,
    _insight,
    _table,
  };
}
