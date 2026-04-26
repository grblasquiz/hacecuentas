/** Honorarios doula AR según paquete (preparto + parto + posparto) */
export interface Inputs { paquetePreparto: number; paqueteParto: number; paquetePosparto: number; visitasAdicionales: number; precioVisitaAdicional: number; viaticosPct: number; }
export interface Outputs { subtotalPaquete: number; costoVisitasExtra: number; viaticosEstimados: number; honorariosTotales: number; explicacion: string; }
export function doulaPartoAcompanamientoHonorarios(i: Inputs): Outputs {
  const pre = Number(i.paquetePreparto) || 0;
  const parto = Number(i.paqueteParto) || 0;
  const pos = Number(i.paquetePosparto) || 0;
  const visitas = Number(i.visitasAdicionales) || 0;
  const precioVis = Number(i.precioVisitaAdicional) || 0;
  const viaPct = (Number(i.viaticosPct) || 0) / 100;
  if (pre + parto + pos <= 0) throw new Error('Cargá al menos un paquete');
  const subtotal = pre + parto + pos;
  const extras = visitas * precioVis;
  const viaticos = (subtotal + extras) * viaPct;
  const total = subtotal + extras + viaticos;
  return {
    subtotalPaquete: Number(subtotal.toFixed(2)),
    costoVisitasExtra: Number(extras.toFixed(2)),
    viaticosEstimados: Number(viaticos.toFixed(2)),
    honorariosTotales: Number(total.toFixed(2)),
    explicacion: `Honorarios doula: ${subtotal.toFixed(0)} (paquete) + ${extras.toFixed(0)} (visitas extra) + ${viaticos.toFixed(0)} (viáticos ${(viaPct*100).toFixed(0)}%) = ${total.toFixed(0)} total.`,
  };
}
