export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tarjetaAlimentarMontoHijos2026(i: Inputs): Outputs {
  const h=Number(i.hijos)||0;
  const montos=[0,52000,81000,108000];
  const m=h>=3?montos[3]:montos[h]||0;
  return { monto:'$'+m.toLocaleString('es-AR'), resumen:`${h} hijos menores 14: Tarjeta Alimentar $${m.toLocaleString('es-AR')}/mes.` };
}
