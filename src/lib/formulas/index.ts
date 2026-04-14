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
import { indemnizacion } from './indemnizacion';
import { horasExtra } from './horas-extra';
import { gananciasRG830 } from './ganancias-rg830';
import { gananciasSueldo } from './ganancias-sueldo';
import { plazoFijo } from './plazo-fijo';
import { marketingCtr } from './marketing-ctr';
import { marketingCpc } from './marketing-cpc';
import { marketingCpm } from './marketing-cpm';
import { marketingRoas } from './marketing-roas';
import { marketingConversion } from './marketing-conversion';
import { marketingCac } from './marketing-cac';
import { viajeCombustible } from './viaje-combustible';
import { viajePresupuesto } from './viaje-presupuesto';
import { viajeDividir } from './viaje-dividir';
import { descensoFutbol } from './descenso-futbol';

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
  indemnizacion,
  'horas-extra': horasExtra,
  'ganancias-rg830': gananciasRG830,
  'ganancias-sueldo': gananciasSueldo,
  'plazo-fijo': plazoFijo,
  'marketing-ctr': marketingCtr,
  'marketing-cpc': marketingCpc,
  'marketing-cpm': marketingCpm,
  'marketing-roas': marketingRoas,
  'marketing-conversion': marketingConversion,
  'marketing-cac': marketingCac,
  'viaje-combustible': viajeCombustible,
  'viaje-presupuesto': viajePresupuesto,
  'viaje-dividir': viajeDividir,
  'descenso-futbol': descensoFutbol,
};

export type FormulaId = keyof typeof formulas;
