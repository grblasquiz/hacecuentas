/**
 * Calculadora de Jugo por Invitado - Bautismo.
 */
export interface JugoPorInvitadoBautismoInputs { invitados:number; ninos:number; tipo:string; }
export interface JugoPorInvitadoBautismoOutputs { litrosJugo:number; unidades:number; litrosPorPersona:number; costoEstimado:number; _insight?:any; }
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
  const litrosFinal = Number(litrosJugo.toFixed(2));
  const costoFinal = Number((unidades * precioUnit).toFixed(2));
  const nombreFormato = tipo === 'polvo' ? `sobre${unidades === 1 ? '' : 's'} de polvo (rinde ~1,5 L c/u)`
    : tipo === 'caja' ? `caja${unidades === 1 ? '' : 's'} de 1 L`
    : `botella${unidades === 1 ? '' : 's'} de ~90 ml`;
  const _insight = {
    title: 'Cuánto jugo comprar',
    text: `Para **${invitados}** invitados (**${ninos}** chico${ninos === 1 ? '' : 's'} y **${adultos}** adulto${adultos === 1 ? '' : 's'}) calculá unos **${litrosFinal} L** de jugo: comprá **${unidades} ${nombreFormato}**, con un costo estimado de **$${costoFinal.toLocaleString('es-AR')}**. Incluye un 10% de margen por las dudas.`,
    tone: 'neutral' as const,
    icon: '🧃',
  };
  return {
    litrosJugo: litrosFinal,
    unidades,
    litrosPorPersona: Number((litrosJugo / invitados).toFixed(2)),
    costoEstimado: costoFinal,
    _insight,
  };
}
