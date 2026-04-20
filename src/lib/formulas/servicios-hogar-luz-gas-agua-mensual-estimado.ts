export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function serviciosHogarLuzGasAguaMensualEstimado(i: Inputs): Outputs {
  const k=Number(i.kwhMes)||0; const g=Number(i.m3GasMes)||0; const a=Number(i.m3AguaMes)||0;
  const tk=Number(i.tarifaKwh)||0; const tg=Number(i.tarifaGas)||0; const ta=Number(i.tarifaAgua)||0;
  const luz=k*tk*1.21; const gas=g*tg*1.21; const agua=a*ta*1.21;
  const tot=luz+gas+agua;
  return { totalServicios:`$${Math.round(tot).toLocaleString('es-AR')}`, luz:`$${Math.round(luz).toLocaleString('es-AR')}`, gas:`$${Math.round(gas).toLocaleString('es-AR')}`, agua:`$${Math.round(agua).toLocaleString('es-AR')}` };
}
