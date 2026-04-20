export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ripteActualizacionJubilatoriaSueldo(i: Inputs): Outputs {
  const s=Number(i.sueldoViejo)||0; const rv=Number(i.ripteViejo)||1; const ra=Number(i.ripteActual)||0;
  const factor=ra/rv; const act=s*factor;
  return { sueldoActualizado:`$${Math.round(act).toLocaleString('es-AR')}`, factorMultiplicador:`${factor.toFixed(2)}x`, interpretacion:`Multiplicá el sueldo histórico por ${factor.toFixed(2)} para tenerlo a valor actual.` };
}
