/**
 * Calculadora de Regalos / Souvenirs por Invitado.
 */
export interface RegalosInvitadoSouvenirInputs { invitados:number; tipoEvento:string; presupuestoPorSouvenir:number; }
export interface RegalosInvitadoSouvenirOutputs { souvenirsTotales:number; costoTotal:number; sugerencias:string; }
export function regalosInvitadoSouvenir(inputs: RegalosInvitadoSouvenirInputs): RegalosInvitadoSouvenirOutputs {
  const inv = Number(inputs.invitados);
  const tipo = inputs.tipoEvento;
  const preso = Number(inputs.presupuestoPorSouvenir);
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  if (!preso || preso <= 0) throw new Error('Ingresá presupuesto');
  const factor = tipo === 'cumpleInfantil' ? 1 : 1.1;
  const souvenirsTotales = Math.ceil(inv * factor);
  const costoTotal = Number((souvenirsTotales * preso).toFixed(0));
  let sugerencias = '';
  if (preso < 2) sugerencias = 'Imanes, llaveros, caramelos decorados, stickers personalizados';
  else if (preso < 4) sugerencias = 'Velitas personalizadas, jabones artesanales, frasquitos de mermelada';
  else if (preso < 8) sugerencias = 'Velas de soya en frasco, productos gourmet, chocolates artesanales';
  else sugerencias = 'Kit gourmet premium, mini vinos personalizados, productos de spa';
  return { souvenirsTotales, costoTotal, sugerencias };
}
