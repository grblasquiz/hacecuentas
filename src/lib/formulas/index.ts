import { sueldoAR } from './sueldo-ar';
import { embarazo } from './embarazo';
import { diasEntreFechas } from './dias-entre-fechas';
import { imc } from './imc';
import { dolarAR } from './dolar-ar';

export const formulas = {
  'sueldo-ar': sueldoAR,
  embarazo,
  'dias-entre-fechas': diasEntreFechas,
  imc,
  'dolar-ar': dolarAR,
};

export type FormulaId = keyof typeof formulas;
