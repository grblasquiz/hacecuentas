/**
 * Calculadora de Cotillón por Personas - Cumple.
 */
export interface CotillonCumplePersonasInputs { invitados:number; tipoEvento:string; }
export interface CotillonCumplePersonasOutputs { itemsTotales:number; itemsPorPersona:number; costoEstimado:number; sugerencias:string; }
export function cotillonCumplePersonas(inputs: CotillonCumplePersonasInputs): CotillonCumplePersonasOutputs {
  const inv = Number(inputs.invitados);
  const tipo = inputs.tipoEvento;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let itemsPorPersona = 3;
  let precioUnit = 0.8;
  let sugerencias = '';
  if (tipo === 'cumpleInfantil') { itemsPorPersona = 2.5; precioUnit = 0.5; sugerencias = 'Gorros, máscaras, silbatos, serpentinas'; }
  else if (tipo === 'cumpleAdulto') { itemsPorPersona = 3.5; precioUnit = 1; sugerencias = 'Collares fluor, pelucas, anteojos, varitas'; }
  else if (tipo === 'cumple15Casamiento') { itemsPorPersona = 4.5; precioUnit = 1.2; sugerencias = 'Collares LED, pelucas de colores, anteojos fluor, corazones inflables'; }
  else { itemsPorPersona = 6; precioUnit = 0.8; sugerencias = 'Gorritos 2026, cornetas, serpentinas, papel picado, matracas'; }
  const itemsTotales = Math.ceil(inv * itemsPorPersona);
  return {
    itemsTotales,
    itemsPorPersona: Number(itemsPorPersona.toFixed(1)),
    costoEstimado: Number((itemsTotales * precioUnit).toFixed(0)),
    sugerencias,
  };
}
