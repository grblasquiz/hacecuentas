/**
 * Calculadora de Empanadas por Invitado - Juntada.
 */
export interface EmpanadasPorInvitadoJuntadaInputs { invitados:number; rol:string; ninos:number; }
export interface EmpanadasPorInvitadoJuntadaOutputs { empanadasTotales:number; docenas:number; empanadasPorPersona:number; costoEstimado:number; _insight?:any; }
export function empanadasPorInvitadoJuntada(inputs: EmpanadasPorInvitadoJuntadaInputs): EmpanadasPorInvitadoJuntadaOutputs {
  const inv = Number(inputs.invitados);
  const ninos = Number(inputs.ninos);
  const rol = inputs.rol;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  if (ninos < 0 || ninos > inv) throw new Error('Niños inválidos');
  const adultos = inv - ninos;
  let porAdulto = 4;
  if (rol === 'pica') porAdulto = 2.5;
  else if (rol === 'acompanamiento') porAdulto = 1.5;
  const porNino = porAdulto * 0.5;
  const empanadasTotales = Math.ceil((adultos * porAdulto + ninos * porNino) * 1.1);
  const docenas = Math.ceil(empanadasTotales / 12);
  const rolTxt = rol === 'pica' ? 'para picar' : rol === 'acompanamiento' ? 'como acompañamiento' : 'como plato fuerte';
  const _insight = {
    title: 'Cuántas comprar',
    text: `Para **${inv} personas** ${rolTxt}, pedí **${docenas} docenas** (${docenas * 12} empanadas). Ya está el **10% de colchón** para repetición incluido.`,
    tone: 'neutral' as const,
    icon: '🥟',
  };
  return {
    empanadasTotales,
    docenas,
    empanadasPorPersona: Number((empanadasTotales / inv).toFixed(1)),
    costoEstimado: docenas * 12,
    _insight,
  };
}
