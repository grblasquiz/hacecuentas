export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function emigrarEspanaPresupuestoInicial6meses(i: Inputs): Outputs {
  const c=String(i.ciudad||'madrid');
  const alquiler={'madrid':1400,'barcelona':1500,'valencia':900,'sevilla':800,'otras':750}[c];
  const comida=400; const transporte=60;
  const mensual=alquiler+comida+transporte+300;
  const sixMonths=mensual*6+2500; // buffer
  return { costoInicial:`EUR ${Math.round(sixMonths).toLocaleString('en-US')}`, alquilerMes:`EUR ${alquiler}/mes (1 bedroom)`, observaciones:`Gastos mensuales ~EUR ${mensual}. Buffer 6 meses.` };
}
