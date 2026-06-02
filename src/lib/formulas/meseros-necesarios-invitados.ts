/**
 * Calculadora de Meseros Necesarios por Invitados.
 */
export interface MeserosNecesariosInvitadosInputs { invitados:number; tipoServicio:string; }
export interface MeserosNecesariosInvitadosOutputs { meseros:number; bartenders:number; maitre:number; costoEstimado:number; _insight?: any; _chart?: any; }
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

  const totalPersonal = meseros + bartenders + maitre;
  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
  const _insight = {
    title: 'Tu staff de servicio',
    text: `Para **${fmt(inv)} invitados** necesitás **${totalPersonal} personas** de servicio (${meseros} mozos, ${bartenders} bartender${bartenders === 1 ? '' : 's'}${maitre ? ' y 1 maître' : ''}), con un costo estimado de **$${fmt(costoEstimado)}** por la jornada.`,
    tone: 'neutral' as const,
    icon: '🍽️',
  };

  const costoMeseros = meseros * 60;
  const costoBartenders = bartenders * 90;
  const costoMaitre = maitre * 150;
  const slices = [
    { label: 'Mozos', value: costoMeseros },
    { label: 'Bartenders', value: costoBartenders },
    { label: 'Maître', value: costoMaitre },
  ].filter(s => s.value > 0);
  const _chart = costoEstimado > 0 ? {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + fmt(costoEstimado),
    centerLabel: 'Costo personal',
    ariaLabel: 'Composición del costo de personal de servicio por rol',
  } : undefined;

  return { meseros, bartenders, maitre, costoEstimado, _insight, _chart };
}
