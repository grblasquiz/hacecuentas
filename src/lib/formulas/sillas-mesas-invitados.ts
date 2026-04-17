/**
 * Calculadora de Sillas y Mesas por Invitados.
 */
export interface SillasMesasInvitadosInputs { invitados:number; tipoMesa:string; }
export interface SillasMesasInvitadosOutputs { mesas:number; sillas:number; costoAlquiler:number; notas:string; }
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
  return {
    mesas,
    sillas,
    costoAlquiler: costoMesas + costoSillas,
    notas,
  };
}
