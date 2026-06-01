export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ablExpensasQuienPagaInquilinoPropietario(i: Inputs): Outputs {
  const c=String(i.concepto||'expOrd');
  const quien: Record<string,[string,string]> = {
    abl:['Propietario','Impuesto, no servicio'],
    expOrd:['Inquilino','Gastos regulares'],
    expExt:['Propietario','Obras mayores del edificio'],
    serv:['Inquilino','A su nombre']
  };
  const etiqueta: Record<string,string> = {
    abl:'el ABL', expOrd:'las expensas ordinarias', expExt:'las expensas extraordinarias', serv:'los servicios'
  };
  const detalle: Record<string,string> = {
    abl:'es un impuesto que grava al inmueble, no un servicio de uso, así que queda del lado de quien es dueño.',
    expOrd:'cubren los gastos corrientes de uso y mantenimiento del edificio, que recaen sobre quien lo habita.',
    expExt:'financian obras mayores y mejoras que valorizan el inmueble, así que son carga del dueño.',
    serv:'van a nombre de quien usa el inmueble, que es el responsable de pagarlos.'
  };
  const [q,com]=quien[c]||quien.expOrd;
  const et=etiqueta[c]||etiqueta.expOrd;
  const det=detalle[c]||detalle.expOrd;
  const _insight={
    title:'¿Quién paga?',
    text:`Por defecto, **${et}** las paga el **${q.toLowerCase()}**: ${det}`,
    tone:'neutral',
    icon:'🔑'
  };
  return { quienPaga:q, comentario:com, resumen:`${c}: paga ${q}.`, _insight };
}
