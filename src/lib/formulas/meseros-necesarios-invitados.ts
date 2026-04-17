/**
 * Calculadora de Meseros Necesarios por Invitados.
 */
export interface MeserosNecesariosInvitadosInputs { invitados:number; tipoServicio:string; }
export interface MeserosNecesariosInvitadosOutputs { meseros:number; bartenders:number; maitre:number; costoEstimado:number; }
export function meserosNecesariosInvitados(inputs: MeserosNecesariosInvitadosInputs): MeserosNecesariosInvitadosOutputs {
  const inv = Number(inputs.invitados);
  const tipo = inputs.tipoServicio;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let ratio = 11;
  if (tipo === 'coctelPasando') ratio = 17;
  else if (tipo === 'buffet') ratio = 27;
  else if (tipo === 'barraLibre') ratio = 0;
  const meseros = ratio > 0 ? Math.ceil(inv / ratio) : 0;
  const bartenders = Math.max(1, Math.ceil(inv / 55));
  const maitre = inv >= 50 ? 1 : 0;
  const costoEstimado = meseros * 60 + bartenders * 90 + maitre * 150;
  return { meseros, bartenders, maitre, costoEstimado };
}
