/** Costo total vitrificación de óvulos en Argentina (estimulación + extracción + storage) */
export interface Inputs { costoEstimulacion: number; costoMedicacionHormonal: number; costoExtraccionVitrificacion: number; storageAnual: number; aniosStorage: number; }
export interface Outputs { costoCicloUnico: number; costoStorageTotal: number; costoTotal: number; costoMensualizadoPrimerAnio: number; explicacion: string; }
export function ovulosCongeladosVitrificacionPrecioClinica(i: Inputs): Outputs {
  const est = Number(i.costoEstimulacion) || 0;
  const med = Number(i.costoMedicacionHormonal) || 0;
  const extr = Number(i.costoExtraccionVitrificacion) || 0;
  const stor = Number(i.storageAnual) || 0;
  const anios = Number(i.aniosStorage) || 1;
  if (est <= 0 && med <= 0 && extr <= 0) throw new Error('Cargá al menos un costo del procedimiento');
  const ciclo = est + med + extr;
  const storageTotal = stor * anios;
  const total = ciclo + storageTotal;
  const primerAnio = ciclo + stor;
  const mensual = primerAnio / 12;
  return {
    costoCicloUnico: Number(ciclo.toFixed(2)),
    costoStorageTotal: Number(storageTotal.toFixed(2)),
    costoTotal: Number(total.toFixed(2)),
    costoMensualizadoPrimerAnio: Number(mensual.toFixed(2)),
    explicacion: `Vitrificación: ${ciclo.toFixed(0)} (ciclo + medicación + extracción) + ${storageTotal.toFixed(0)} de storage por ${anios} año(s) = total ${total.toFixed(0)}. Mensualizado en el primer año: ${mensual.toFixed(0)}.`,
  };
}
