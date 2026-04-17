/**
 * Calculadora de Pizza por Invitado.
 */
export interface PizzaPorInvitadoPorcionesInputs { invitados:number; hambre:string; tamano:string; }
export interface PizzaPorInvitadoPorcionesOutputs { pizzas:number; porcionesTotales:number; porcionesPorPersona:number; costoEstimado:number; }
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
  return {
    pizzas,
    porcionesTotales,
    porcionesPorPersona: Number(porcPersona.toFixed(1)),
    costoEstimado: pizzas * precioUnit,
  };
}
