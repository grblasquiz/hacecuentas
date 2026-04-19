export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function alquilerConOpcionACompraLeasingInmueble(i: Inputs): Outputs {
  const a=Number(i.alquilerMensual)||0; const m=Number(i.mesesPago)||0; const v=Number(i.valorInmueble)||0; const p=(Number(i.pctDescontable)||30)/100;
  const totAlq=a*m;
  const acum=totAlq*p;
  const falta=v-acum;
  return { totalAlquilado:'$'+totAlq.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), acumuladoCompra:'$'+acum.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), faltante:'$'+falta.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${m} meses × $${a}: total alquilado $${totAlq.toFixed(0)}, acumulado compra $${acum.toFixed(0)}.` };
}
