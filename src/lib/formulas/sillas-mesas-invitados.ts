/**
 * Calculadora de Sillas y Mesas por Invitados.
 */
export interface SillasMesasInvitadosInputs { invitados:number; tipoMesa:string; }
export interface SillasMesasInvitadosOutputs { mesas:number; sillas:number; costoAlquiler:number; notas:string; _insight?:any; _chart?:any; }
export function sillasMesasInvitados(inputs: SillasMesasInvitadosInputs): SillasMesasInvitadosOutputs {
  const inv = Number(inputs.invitados);
  const tipo = inputs.tipoMesa;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let personasPorMesa = 8, precioMesa = 20;
  let notas = '';
  if (tipo === 'redonda10') { personasPorMesa = 10; precioMesa = 25; notas = 'Más espacio entre comensales'; }
  else if (tipo === 'rectangular') { personasPorMesa = 11; precioMesa = 40; notas = 'Estilo banquete moderno'; }
  else if (tipo === 'coctail') { personasPorMesa = 4; precioMesa = 12; notas = 'Mesa alta de pie, sin sillas tradicionales'; }
  else notas = 'Formato clásico argentino de casamientos';
  const mesas = Math.ceil(inv / personasPorMesa);
  const sillas = tipo === 'coctail' ? 0 : Math.ceil(inv * 1.05);
  const costoMesas = mesas * precioMesa;
  const costoSillas = sillas * 3;
  const costoAlquiler = costoMesas + costoSillas;

  const sillasTxt = sillas > 0 ? ` y **${sillas}** sillas (con 5% de margen para imprevistos)` : ' (formato de pie, sin sillas)';
  const _insight = {
    title: 'Tu armado para el evento',
    text: `Para **${inv}** invitados necesitás **${mesas}** mesas${sillasTxt}. El alquiler ronda los **$${costoAlquiler.toLocaleString('es-AR')}**. Sumá un par de mesas extra para buffet, regalos y torta.`,
    tone: 'neutral',
    icon: '🪑',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Mesas', value: costoMesas },
      { label: 'Sillas', value: costoSillas },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: `$${costoAlquiler.toLocaleString('es-AR')}`,
    centerLabel: 'Alquiler',
    ariaLabel: `Costo de alquiler: mesas $${costoMesas}, sillas $${costoSillas}`,
  };

  return {
    mesas,
    sillas,
    costoAlquiler,
    notas,
    _insight,
    _chart,
  };
}
