export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function alquilerConOpcionACompraLeasingInmueble(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const a=Number(i.alquilerMensual)||0; const m=Number(i.mesesPago)||0; const v=Number(i.valorInmueble)||0; const p=(Number(i.pctDescontable)||30)/100;
  const totAlq=a*m;
  const acum=totAlq*p;
  const falta=v-acum;
  const resumen = __lang === 'en'
    ? `${m} months × $${a}: total paid $${totAlq.toFixed(0)}, accumulated toward purchase $${acum.toFixed(0)}.`
    : __lang === 'pt'
    ? `${m} meses × $${a}: total pago $${totAlq.toFixed(0)}, acumulado para compra $${acum.toFixed(0)}.`
    : `${m} meses × $${a}: total alquilado $${totAlq.toFixed(0)}, acumulado compra $${acum.toFixed(0)}.`;
  return { totalAlquilado:'$'+totAlq.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), acumuladoCompra:'$'+acum.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), faltante:'$'+falta.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen };
}
