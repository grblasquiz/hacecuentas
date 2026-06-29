/**
 * Valor hora y jornal — PARAGUAY.
 * Convierte entre salario mensual, jornal (diario) y valor hora. Para el divisor
 * mensual se usa la convención de 26 días laborables (jornales) por mes, habitual en
 * la liquidación de jornaleros en Paraguay.
 *
 * DIAS_MES = 26
 * base=="mensual": mensual=monto; jornal=mensual/26; hora=jornal/horasDia
 * base=="jornal":  jornal=monto;  hora=jornal/horasDia; mensual=jornal×26
 * base=="hora":    hora=monto;    jornal=hora×horasDia; mensual=jornal×26
 * equivaleSMV = mensual ≥ SMV ? "cumple el mínimo" : "por debajo del SMV"
 *
 * SMV desde src/lib/data/paraguay-2026.ts (input editable, default SMVM 2026).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

const DIAS_MES = 26; // convención de 26 jornales/mes para liquidación de jornaleros

export interface HoraTrabajoJornalParaguayInputs {
  base?: string;
  monto: number | string;
  horasDia?: number | string;
  SMV?: number | string;
}

export interface HoraTrabajoJornalParaguayOutputs {
  valorHora: number;
  valorJornal: number;
  salarioMensual: number;
  equivaleSMV: string;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

export function horaTrabajoJornalParaguay(i: HoraTrabajoJornalParaguayInputs): HoraTrabajoJornalParaguayOutputs {
  const base = (i.base || 'mensual').toString();
  const monto = Math.max(0, Number(i.monto) || 0);
  if (monto <= 0) throw new Error('Ingresá el monto a convertir');
  const horasDia = Math.max(1, Number(i.horasDia ?? PARAGUAY_2026.horasDia) || PARAGUAY_2026.horasDia);
  const smv = Math.max(0, Number(i.SMV ?? PARAGUAY_2026.salarioMinimo) || PARAGUAY_2026.salarioMinimo);

  let mensual: number;
  let jornal: number;
  let hora: number;

  if (base === 'jornal') {
    jornal = monto;
    hora = jornal / horasDia;
    mensual = jornal * DIAS_MES;
  } else if (base === 'hora') {
    hora = monto;
    jornal = hora * horasDia;
    mensual = jornal * DIAS_MES;
  } else {
    // mensual
    mensual = monto;
    jornal = mensual / DIAS_MES;
    hora = jornal / horasDia;
  }

  const equivaleSMV = mensual >= smv ? 'cumple el mínimo' : 'por debajo del SMV';

  const resumen = `Hora ${fmtPYG(hora)} · Jornal ${fmtPYG(jornal)} · Mensual ${fmtPYG(mensual)} (${equivaleSMV})`;

  const formula = `Valor hora = jornal ÷ ${horasDia} h · Jornal = mensual ÷ ${DIAS_MES} días · Mensual = jornal × ${DIAS_MES}`;

  const _insight = {
    type: 'highlight' as const,
    icon: '🇵🇾',
    text: `Equivalencias: **${fmtPYG(hora)}** la hora, **${fmtPYG(jornal)}** el jornal (${horasDia} h) y **${fmtPYG(mensual)}** al mes. El salario mensual resultante **${equivaleSMV}** (SMVM ${fmtPYG(smv)}). Se usa el divisor de **${DIAS_MES} días** laborables por mes, la convención habitual para liquidar jornaleros en Paraguay.`,
  };

  const _table = {
    title: 'Equivalencias hora / jornal / mensual (Paraguay)',
    headers: ['Unidad', 'Valor'],
    rows: [
      [`Valor hora (${horasDia} h/jornada)`, fmtPYG(hora)],
      ['Valor jornal (día)', fmtPYG(jornal)],
      [`Salario mensual (${DIAS_MES} jornales)`, fmtPYG(mensual)],
      ['Comparación con el SMVM', equivaleSMV],
    ],
    note: `Divisor mensual: ${DIAS_MES} días laborables/mes (convención para jornaleros). La jornada legal ordinaria es de 8 horas diarias y 48 semanales. El SMVM 2026 es ${fmtPYG(PARAGUAY_2026.salarioMinimo)} y el jornal mínimo ${fmtPYG(PARAGUAY_2026.jornalMinimo)}.`,
  };

  return {
    valorHora: Math.round(hora),
    valorJornal: Math.round(jornal),
    salarioMensual: Math.round(mensual),
    equivaleSMV,
    resumen,
    formula,
    _insight,
    _table,
  };
}
