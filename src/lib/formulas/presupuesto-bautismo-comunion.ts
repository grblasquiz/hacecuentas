/**
 * Calculadora de Bautismo / Comunión - Presupuesto.
 */
export interface PresupuestoBautismoComunionInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoBautismoComunionOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoSalonCatering:number;
  costoIglesiaCeremonia:number;
  costoVestuario:number;
  costoFotoVideo:number;
  costoTortaMesaDulce:number;
  costoDecoracionOtros:number;
  _insight?: any;
  _chart?: any;
}
export function presupuestoBautismoComunion(inputs: PresupuestoBautismoComunionInputs): PresupuestoBautismoComunionOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 55;
  if (nivel === 'basico') costoPorInvitado = 25;
  else if (nivel === 'premium') costoPorInvitado = 130;
  const costoTotal = inv * costoPorInvitado;
  const salon = Math.round(costoTotal * 0.45);
  const iglesia = Math.round(costoTotal * 0.1);
  const vestuario = Math.round(costoTotal * 0.12);
  const foto = Math.round(costoTotal * 0.12);
  const torta = Math.round(costoTotal * 0.1);
  const decoOtros = Math.round(costoTotal * 0.11);
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const nivelTxt = nivel === 'basico' ? 'básico' : nivel === 'premium' ? 'premium' : 'estándar';
  const _insight = {
    title: 'Presupuesto de la celebración',
    text: `Para **${inv} invitados** con nivel ${nivelTxt} (${fmt(costoPorInvitado)} por persona) calculá unos **${fmt(costoTotal)}** en total. El salón y catering concentran el grueso: **${fmt(salon)}** (45%).`,
    tone: 'neutral',
    icon: '⛪',
  };
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Salón y catering', value: salon },
      { label: 'Iglesia y ceremonia', value: iglesia },
      { label: 'Vestuario', value: vestuario },
      { label: 'Foto y video', value: foto },
      { label: 'Torta y mesa dulce', value: torta },
      { label: 'Decoración y otros', value: decoOtros },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmt(salon + iglesia + vestuario + foto + torta + decoOtros),
    centerLabel: 'Costo total',
    ariaLabel: 'Distribución del presupuesto de bautismo o comunión por rubro: salón, iglesia, vestuario, foto/video, torta y decoración.',
  };
  return {
    costoTotal,
    costoPorInvitado,
    costoSalonCatering: salon,
    costoIglesiaCeremonia: iglesia,
    costoVestuario: vestuario,
    costoFotoVideo: foto,
    costoTortaMesaDulce: torta,
    costoDecoracionOtros: decoOtros,
    _insight,
    _chart,
  };
}
