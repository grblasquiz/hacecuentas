/**
 * Calculadora de Pizza por Invitado.
 */
export interface PizzaPorInvitadoPorcionesInputs { invitados:number; hambre:string; tamano:string; }
export interface PizzaPorInvitadoPorcionesOutputs { pizzas:number; porcionesTotales:number; porcionesPorPersona:number; costoEstimado:number; _insight?: any; }
export function pizzaPorInvitadoPorciones(inputs: PizzaPorInvitadoPorcionesInputs): PizzaPorInvitadoPorcionesOutputs {
  const inv = Number(inputs.invitados);
  const hambre = inputs.hambre;
  const tam = inputs.tamano;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let porcPersona = 2.5;
  if (hambre === 'bajo') porcPersona = 1.5;
  else if (hambre === 'alto') porcPersona = 4;
  const porcPorPizza = tam === 'chica' ? 4 : 8;
  const porcionesTotales = Math.ceil(inv * porcPersona);
  const pizzas = Math.ceil(porcionesTotales / porcPorPizza);
  const precioUnit = tam === 'chica' ? 6 : 11;
  const porcionesCompradas = pizzas * porcPorPizza;
  const sobrantes = porcionesCompradas - porcionesTotales;
  const tamTxt = tam === 'chica' ? 'chicas (4 porciones)' : 'grandes (8 porciones)';
  const _insight = {
    title: 'Cuántas pizzas pedir',
    text: `Para **${inv} invitados** con hambre ${hambre} pedí **${pizzas} pizza${pizzas === 1 ? '' : 's'} ${tamTxt}** = ${porcionesCompradas} porciones, ${sobrantes > 0 ? `con **${sobrantes} de sobra** (margen de seguridad)` : 'justas para todos'}. Costo estimado: **$${pizzas * precioUnit}**.`,
    tone: 'neutral',
    icon: '🍕',
  };
  return {
    pizzas,
    porcionesTotales,
    porcionesPorPersona: Number(porcPersona.toFixed(1)),
    costoEstimado: pizzas * precioUnit,
    _insight,
  };
}
