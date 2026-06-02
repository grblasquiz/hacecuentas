/**
 * Calculadora de Aniversario de Bodas - Presupuesto.
 */
export interface PresupuestoAniversarioBodasInputs {
  invitados: number;
  nivel: string;
}
export interface PresupuestoAniversarioBodasOutputs {
  costoTotal: number;
  costoPorInvitado: number;
  costoCenaCatering:number;
  costoDecoracionFlores:number;
  costoRenovacionVotos:number;
  costoFotoVideoAnos:number;
  costoRegaloEspecial:number;
  costoOtros:number;
  _insight?: any;
  _chart?: any;
}
export function presupuestoAniversarioBodas(inputs: PresupuestoAniversarioBodasInputs): PresupuestoAniversarioBodasOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let costoPorInvitado = 50;
  if (nivel === 'basico') costoPorInvitado = 20;
  else if (nivel === 'premium') costoPorInvitado = 120;
  const costoTotal = inv * costoPorInvitado;
  const cena = Math.round(costoTotal * 0.45);
  const deco = Math.round(costoTotal * 0.2);
  const votos = Math.round(costoTotal * 0.1);
  const foto = Math.round(costoTotal * 0.1);
  const regalo = Math.round(costoTotal * 0.1);
  const otros = Math.round(costoTotal * 0.05);
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const nivelTxt = nivel === 'basico' ? 'básico' : nivel === 'premium' ? 'premium' : 'estándar';
  const _insight = {
    title: 'Presupuesto del aniversario',
    text: `Para **${inv} invitados** con nivel ${nivelTxt} (${fmt(costoPorInvitado)} por persona) calculá unos **${fmt(costoTotal)}** en total. La cena y catering se llevan la mayor parte: **${fmt(cena)}** (45%).`,
    tone: 'neutral',
    icon: '🥂',
  };
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cena y catering', value: cena },
      { label: 'Decoración y flores', value: deco },
      { label: 'Renovación de votos', value: votos },
      { label: 'Foto y video', value: foto },
      { label: 'Regalo especial', value: regalo },
      { label: 'Otros', value: otros },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmt(cena + deco + votos + foto + regalo + otros),
    centerLabel: 'Costo total',
    ariaLabel: 'Distribución del presupuesto del aniversario por rubro: cena, decoración, votos, foto/video, regalo y otros.',
  };
  return {
    costoTotal,
    costoPorInvitado,
    costoCenaCatering: cena,
    costoDecoracionFlores: deco,
    costoRenovacionVotos: votos,
    costoFotoVideoAnos: foto,
    costoRegaloEspecial: regalo,
    costoOtros: otros,
    _insight,
    _chart,
  };
}
