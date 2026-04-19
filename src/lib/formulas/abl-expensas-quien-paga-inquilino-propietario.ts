export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ablExpensasQuienPagaInquilinoPropietario(i: Inputs): Outputs {
  const c=String(i.concepto||'expOrd');
  const quien: Record<string,[string,string]> = {
    abl:['Propietario','Impuesto, no servicio'],
    expOrd:['Inquilino','Gastos regulares'],
    expExt:['Propietario','Obras mayores del edificio'],
    serv:['Inquilino','A su nombre']
  };
  const [q,com]=quien[c]||quien.expOrd;
  return { quienPaga:q, comentario:com, resumen:`${c}: paga ${q}.` };
}
