export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function visaEtaCanadaArgentinosRequisitos(i: Inputs): Outputs {
  const d=Number(i.duracionViaje)||14;
  return { costoEta:`CAD 7`, validez:`5 años o vencimiento pasaporte`, requisitos:'Pasaporte argentino vigente +6 meses, formulario online, tarjeta pago, correo electrónico, sin antecedentes penales recientes.' };
}
