/** Presupuesto 3 días Cataratas Iguazú 2 personas */
export interface Inputs { personas: number; dias: number; vueloPorPersonaArs: number; hotelPorNocheArs: number; entradaParqueArs: number; ladoBrasil: boolean; comidaDiariaArs: number; trasladosArs: number; }
export interface Outputs { vuelosArs: number; hospedajeArs: number; entradasArs: number; comidasArs: number; trasladosTotalArs: number; totalArs: number; totalPorPersonaArs: number; explicacion: string; }
export function iguazu3DiasPresupuestoCataratas2Personas(i: Inputs): Outputs {
  const personas = Number(i.personas) || 2;
  const dias = Number(i.dias) || 3;
  const vuelo = Number(i.vueloPorPersonaArs) || 0;
  const hotelNoche = Number(i.hotelPorNocheArs) || 0;
  const entrada = Number(i.entradaParqueArs) || 0;
  const comida = Number(i.comidaDiariaArs) || 0;
  const traslados = Number(i.trasladosArs) || 0;
  if (personas <= 0 || dias <= 0) throw new Error('Personas y días deben ser > 0');
  const vuelos = vuelo * personas;
  const hospedaje = hotelNoche * (dias - 1);
  const entradas = entrada * personas * (i.ladoBrasil ? 2 : 1);
  const comidas = comida * personas * dias;
  const total = vuelos + hospedaje + entradas + comidas + traslados;
  return {
    vuelosArs: Number(vuelos.toFixed(2)),
    hospedajeArs: Number(hospedaje.toFixed(2)),
    entradasArs: Number(entradas.toFixed(2)),
    comidasArs: Number(comidas.toFixed(2)),
    trasladosTotalArs: Number(traslados.toFixed(2)),
    totalArs: Number(total.toFixed(2)),
    totalPorPersonaArs: Number((total / personas).toFixed(2)),
    explicacion: `${personas} personas, ${dias} días: vuelos $${vuelos.toLocaleString('es-AR')} + hotel $${hospedaje.toLocaleString('es-AR')} + entradas $${entradas.toLocaleString('es-AR')} + comidas $${comidas.toLocaleString('es-AR')} + traslados $${traslados.toLocaleString('es-AR')} = $${total.toLocaleString('es-AR')}${i.ladoBrasil ? ' (incluye lado brasileño)' : ''}.`,
  };
}
