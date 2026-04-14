import { sueldoAR } from './sueldo-ar';
import { embarazo } from './embarazo';
import { diasEntreFechas } from './dias-entre-fechas';
import { imc } from './imc';
import { dolarAR } from './dolar-ar';
import { aguinaldo } from './aguinaldo';
import { prestamoCuota } from './prestamo-cuota';
import { vacaciones } from './vacaciones';
import { monotributo } from './monotributo';
import { ovulacion } from './ovulacion';
import { caloriasTDEE } from './calorias-tdee';
import { propina } from './propina';
import { porcentaje } from './porcentaje';
import { edad } from './edad';
import { interesCompuesto } from './interes-compuesto';

export const formulas = {
  'sueldo-ar': sueldoAR,
  embarazo,
  'dias-entre-fechas': diasEntreFechas,
  imc,
  'dolar-ar': dolarAR,
  aguinaldo,
  'prestamo-cuota': prestamoCuota,
  vacaciones,
  monotributo,
  ovulacion,
  'calorias-tdee': caloriasTDEE,
  propina,
  porcentaje,
  edad,
  'interes-compuesto': interesCompuesto,
};

export type FormulaId = keyof typeof formulas;
