export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cuartaCategoriaEmpleadoEmpresaArgentina(i: Inputs): Outputs {
  const b=Number(i.brutoAnual)||0;
  const base=b*0.85;
  const mni=21000000;
  const imponible=Math.max(0,base-mni);
  const imp=imponible*0.25;
  return { base:'$'+base.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), impuesto:'$'+imp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), alicuotaProm:(b>0?(imp/b*100).toFixed(1):'0')+'%', resumen:`Bruto anual $${b.toLocaleString('es-AR')}: impuesto ~$${imp.toFixed(0)}.` };
}
