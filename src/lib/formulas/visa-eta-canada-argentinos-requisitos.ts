export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function visaEtaCanadaArgentinosRequisitos(i: Inputs): Outputs {
  const d=Number(i.duracionViaje)||14;
  const _insight = {
    title: "eTA Canadá para argentinos",
    text: `Buenas noticias: con pasaporte argentino solo necesitás la **eTA** (autorización electrónica), no visa con entrevista. Cuesta apenas **CAD 7**, se tramita 100% online y vale **5 años** (o hasta que venza tu pasaporte). Tu viaje de **${d} días** entra sin problema.`,
    tone: "good" as const,
    icon: "🇨🇦",
  };
  return { costoEta:`CAD 7`, validez:`5 años o vencimiento pasaporte`, requisitos:'Pasaporte argentino vigente +6 meses, formulario online, tarjeta pago, correo electrónico, sin antecedentes penales recientes.', _insight };
}
