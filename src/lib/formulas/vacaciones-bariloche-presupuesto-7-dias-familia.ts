/** Presupuesto 7 días Bariloche familia tipo (4 personas) */
export interface Inputs { temporada: 'alta' | 'media' | 'baja'; categoriaHotel: '3estrellas' | '4estrellas' | '5estrellas' | 'cabana'; personas: number; dias: number; vueloPorPersonaArs: number; gastosExtraDiariosArs: number; }
export interface Outputs { hospedajeArs: number; comidasArs: number; vuelosArs: number; excursionesArs: number; totalArs: number; totalPorPersonaArs: number; explicacion: string; }
export function vacacionesBarilochePresupuesto7DiasFamilia(i: Inputs): Outputs {
  const personas = Number(i.personas) || 4;
  const dias = Number(i.dias) || 7;
  const vuelo = Number(i.vueloPorPersonaArs) || 0;
  const extra = Number(i.gastosExtraDiariosArs) || 0;
  if (personas <= 0 || dias <= 0) throw new Error('Personas y días deben ser > 0');
  const hotelesNoche: Record<string, Record<string, number>> = {
    alta:  { '3estrellas': 120000, '4estrellas': 220000, '5estrellas': 450000, cabana: 180000 },
    media: { '3estrellas': 85000, '4estrellas': 150000, '5estrellas': 320000, cabana: 130000 },
    baja:  { '3estrellas': 60000, '4estrellas': 110000, '5estrellas': 230000, cabana: 95000 },
  };
  const tarifa = hotelesNoche[i.temporada]?.[i.categoriaHotel];
  if (!tarifa) throw new Error('Temporada o categoría inválida');
  const hospedaje = tarifa * dias;
  const comidaPorPersonaDia = i.temporada === 'alta' ? 28000 : i.temporada === 'media' ? 22000 : 18000;
  const comidas = comidaPorPersonaDia * personas * dias;
  const vuelos = vuelo * personas;
  const excursiones = 45000 * personas + extra * dias;
  const total = hospedaje + comidas + vuelos + excursiones;
  return {
    hospedajeArs: Number(hospedaje.toFixed(2)),
    comidasArs: Number(comidas.toFixed(2)),
    vuelosArs: Number(vuelos.toFixed(2)),
    excursionesArs: Number(excursiones.toFixed(2)),
    totalArs: Number(total.toFixed(2)),
    totalPorPersonaArs: Number((total / personas).toFixed(2)),
    explicacion: `${personas} personas, ${dias} días, ${i.temporada}, ${i.categoriaHotel}: hospedaje $${hospedaje.toLocaleString('es-AR')} + comidas $${comidas.toLocaleString('es-AR')} + vuelos $${vuelos.toLocaleString('es-AR')} + excursiones $${excursiones.toLocaleString('es-AR')} = $${total.toLocaleString('es-AR')}.`,
  };
}
