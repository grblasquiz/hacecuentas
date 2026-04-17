/**
 * Calculadora de Cupcakes por Invitado - Cumple.
 */
export interface CupcakesPorInvitadoCumpleInputs { invitados:number; ninos:number; rol:string; }
export interface CupcakesPorInvitadoCumpleOutputs { cupcakes:number; docenas:number; cupcakesPorPersona:number; costoEstimado:number; }
export function cupcakesPorInvitadoCumple(inputs: CupcakesPorInvitadoCumpleInputs): CupcakesPorInvitadoCumpleOutputs {
  const inv = Number(inputs.invitados);
  const ninos = Number(inputs.ninos);
  const rol = inputs.rol;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  if (ninos < 0 || ninos > inv) throw new Error('Niños inválidos');
  const adultos = inv - ninos;
  let adultoFactor = 2;
  if (rol === 'mesaDulce') adultoFactor = 1.5;
  else if (rol === 'souvenir') adultoFactor = 1;
  const ninoFactor = Math.max(1, adultoFactor * 0.6);
  const cupcakes = Math.ceil((adultos * adultoFactor + ninos * ninoFactor) * 1.1);
  const docenas = Math.ceil(cupcakes / 12);
  return {
    cupcakes,
    docenas,
    cupcakesPorPersona: Number(((adultos * adultoFactor + ninos * ninoFactor) / inv).toFixed(1)),
    costoEstimado: Number((cupcakes * 2.5).toFixed(0)),
  };
}
