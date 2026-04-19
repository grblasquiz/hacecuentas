export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rentabilidadAlquilerInmuebleCabaNetoBruto(i: Inputs): Outputs {
  const v=Number(i.valorInmueble)||0; const a=Number(i.alquilerMensual)||0; const g=Number(i.gastosMensuales)||0;
  const bruta=(a*12/v)*100;
  const neta=((a-g)*12/v)*100;
  const pay=a>0?(v/(a*12)):0;
  return { rentBruta:bruta.toFixed(2)+'%', rentNeta:neta.toFixed(2)+'%', paybackAños:pay.toFixed(1), resumen:`Inmueble $${v.toLocaleString('es-AR')}: bruta ${bruta.toFixed(1)}%, neta ${neta.toFixed(1)}%, payback ${pay.toFixed(1)} años.` };
}
