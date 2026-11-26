import { PERU_2026 } from '../data/peru-2026.ts';
import { BONIF_GRATI_EPS } from '../hubs/pe/liquidacion-y-beneficios.ts';

type GratificacionInput = {
  sueldo: number;
  asignacion: boolean;
  eps: boolean;
  meses: number;
  faltas: number;
  variables: number[];
};

const cents = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;

export function gratificacionSemestral({ sueldo, asignacion, eps, meses, faltas, variables }: GratificacionInput) {
  const variablesRegulares = variables.filter(value => value > 0).length >= 3;
  const complemento = variablesRegulares ? variables.reduce((total, value) => total + value, 0) / 6 : 0;
  const base = sueldo + (asignacion ? PERU_2026.asignacionFamiliar : 0) + complemento;
  const gratificacion = cents(base * (meses - faltas / 30) / 6);
  const tasa = eps ? BONIF_GRATI_EPS : PERU_2026.gratificacion.bonificacionExtraordinaria;
  const bonificacion = cents(gratificacion * tasa);
  return { base, complemento, gratificacion, bonificacion, total: cents(gratificacion + bonificacion), tasa };
}
