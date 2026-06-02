/**
 * Calculadora de Sushi por Invitado - Cena.
 */
export interface SushiPorInvitadoCenaInputs { invitados:number; rol:string; }
export interface SushiPorInvitadoCenaOutputs { piezasTotales:number; combos:number; piezasPorPersona:number; costoEstimado:number; _insight?:any; }
export function sushiPorInvitadoCena(inputs: SushiPorInvitadoCenaInputs): SushiPorInvitadoCenaOutputs {
  const inv = Number(inputs.invitados);
  const rol = inputs.rol;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let porPersona = 14;
  if (rol === 'entrada') porPersona = 9;
  else if (rol === 'pica') porPersona = 6;
  const piezasTotales = Math.ceil(inv * porPersona * 1.1);
  const combos = Math.ceil(piezasTotales / 30);
  const costoEstimado = combos * 32;
  const insight = {
    title: 'Tu pedido de sushi',
    text: `Para una cena de **${inv} ${inv === 1 ? 'invitado' : 'invitados'}** calculá **${piezasTotales} piezas** (${porPersona} por persona + 10% de colchón), unos **${combos} combo${combos !== 1 ? 's' : ''}** de 30. Costo orientativo: **$${costoEstimado.toLocaleString('es-AR')}**.`,
    tone: 'neutral',
    icon: '🍣',
  };
  return {
    piezasTotales,
    combos,
    piezasPorPersona: Number(porPersona.toFixed(1)),
    costoEstimado,
    _insight: insight,
  };
}
