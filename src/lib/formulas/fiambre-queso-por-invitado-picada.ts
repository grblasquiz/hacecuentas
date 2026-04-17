/**
 * Calculadora de Fiambre y Queso por Invitado - Picada.
 */
export interface FiambreQuesoPorInvitadoPicadaInputs { invitados:number; rol:string; }
export interface FiambreQuesoPorInvitadoPicadaOutputs { kgFiambre:number; kgQueso:number; kgAceitunas:number; gramosFiambrePorPersona:number; gramosQuesoPorPersona:number; }
export function fiambreQuesoPorInvitadoPicada(inputs: FiambreQuesoPorInvitadoPicadaInputs): FiambreQuesoPorInvitadoPicadaOutputs {
  const inv = Number(inputs.invitados);
  const rol = inputs.rol;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let gFiambre = 180, gQueso = 130, gAceit = 40;
  if (rol === 'previa') { gFiambre = 80; gQueso = 60; gAceit = 25; }
  else if (rol === 'aperitivo') { gFiambre = 50; gQueso = 40; gAceit = 15; }
  return {
    kgFiambre: Number((inv * gFiambre / 1000).toFixed(2)),
    kgQueso: Number((inv * gQueso / 1000).toFixed(2)),
    kgAceitunas: Number((inv * gAceit / 1000).toFixed(2)),
    gramosFiambrePorPersona: gFiambre,
    gramosQuesoPorPersona: gQueso,
  };
}
