/**
 * Calculadora de Jugo por Invitado - Bautismo.
 */
export interface JugoPorInvitadoBautismoInputs { invitados:number; ninos:number; tipo:string; }
export interface JugoPorInvitadoBautismoOutputs { litrosJugo:number; unidades:number; litrosPorPersona:number; costoEstimado:number; }
export function jugoPorInvitadoBautismo(inputs: JugoPorInvitadoBautismoInputs): JugoPorInvitadoBautismoOutputs {
  const invitados = Number(inputs.invitados);
  const ninos = Number(inputs.ninos);
  const tipo = inputs.tipo;
  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (ninos < 0 || ninos > invitados) throw new Error('Cantidad de niños inválida');
  const adultos = invitados - ninos;
  const litrosNinos = ninos * 0.4;
  const adultosConJugo = adultos * 0.3;
  const litrosAdultos = adultosConJugo * 0.2;
  const litrosJugo = (litrosNinos + litrosAdultos) * 1.1;
  let unidades = 0; let precioUnit = 0;
  if (tipo === 'polvo') { unidades = Math.ceil(litrosJugo / 1.5); precioUnit = 1.5; }
  else if (tipo === 'caja') { unidades = Math.ceil(litrosJugo); precioUnit = 1.8; }
  else { unidades = Math.ceil(litrosJugo * 11); precioUnit = 0.3; }
  return {
    litrosJugo: Number(litrosJugo.toFixed(2)),
    unidades,
    litrosPorPersona: Number((litrosJugo / invitados).toFixed(2)),
    costoEstimado: Number((unidades * precioUnit).toFixed(2)),
  };
}
