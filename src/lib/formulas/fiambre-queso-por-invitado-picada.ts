/**
 * Calculadora de Fiambre y Queso por Invitado - Picada.
 */
export interface FiambreQuesoPorInvitadoPicadaInputs { invitados:number; rol:string; }
export interface FiambreQuesoPorInvitadoPicadaOutputs { kgFiambre:number; kgQueso:number; kgAceitunas:number; gramosFiambrePorPersona:number; gramosQuesoPorPersona:number; _insight?:any; _chart?:any; }
export function fiambreQuesoPorInvitadoPicada(inputs: FiambreQuesoPorInvitadoPicadaInputs): FiambreQuesoPorInvitadoPicadaOutputs {
  const inv = Number(inputs.invitados);
  const rol = inputs.rol;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let gFiambre = 180, gQueso = 130, gAceit = 40;
  if (rol === 'previa') { gFiambre = 80; gQueso = 60; gAceit = 25; }
  else if (rol === 'aperitivo') { gFiambre = 50; gQueso = 40; gAceit = 15; }

  const kgFiambre = Number((inv * gFiambre / 1000).toFixed(2));
  const kgQueso = Number((inv * gQueso / 1000).toFixed(2));
  const kgAceitunas = Number((inv * gAceit / 1000).toFixed(2));
  const totalKg = Number((kgFiambre + kgQueso + kgAceitunas).toFixed(2));
  const fmtKg = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' kg';

  const _insight = {
    title: 'Lo que tenés que comprar',
    text: `Para **${inv}** invitados necesitás **${fmtKg(totalKg)}** de picada en total: ${fmtKg(kgFiambre)} de fiambre, ${fmtKg(kgQueso)} de queso y ${fmtKg(kgAceitunas)} de aceitunas. Son **${gFiambre + gQueso}g por persona** entre fiambre y queso, así que pedí en la fiambrería con margen.`,
    tone: 'neutral',
    icon: '🧀',
  };

  const gTotalPorPersona = gFiambre + gQueso + gAceit;
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Fiambre', value: gFiambre },
      { label: 'Queso', value: gQueso },
      { label: 'Aceitunas', value: gAceit },
    ],
    suffix: ' g',
    centerValue: gTotalPorPersona + ' g',
    centerLabel: 'Por persona',
    ariaLabel: `Por persona: ${gFiambre}g de fiambre, ${gQueso}g de queso y ${gAceit}g de aceitunas.`,
  };

  return {
    kgFiambre,
    kgQueso,
    kgAceitunas,
    gramosFiambrePorPersona: gFiambre,
    gramosQuesoPorPersona: gQueso,
    _insight,
    _chart,
  };
}
