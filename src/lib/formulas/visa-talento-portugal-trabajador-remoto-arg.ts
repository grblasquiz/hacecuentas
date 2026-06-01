/** Costo total visa D7/D8 Portugal para trabajador remoto AR */
export interface Inputs { tasaConsularUsd: number; traduccionesUsd: number; apostillasUsd: number; seguroSaludUsd: number; pasajeUsd: number; comprobanteFondosUsd: number; }
export interface Outputs { costoTotalUsd: number; costoFijoUsd: number; fondosBloqueadosUsd: number; explicacion: string; _chart?: any; }
export function visaTalentoPortugalTrabajadorRemotoArg(i: Inputs): Outputs {
  const tasa = Number(i.tasaConsularUsd) || 0;
  const trad = Number(i.traduccionesUsd) || 0;
  const apost = Number(i.apostillasUsd) || 0;
  const seguro = Number(i.seguroSaludUsd) || 0;
  const pasaje = Number(i.pasajeUsd) || 0;
  const fondos = Number(i.comprobanteFondosUsd) || 0;
  if (tasa <= 0) throw new Error('Ingresá la tasa consular');
  const fijo = tasa + trad + apost + seguro + pasaje;
  const total = fijo + fondos;
  const slices = [
    { label: 'Tasa consular', value: tasa },
    { label: 'Traducciones', value: trad },
    { label: 'Apostillas', value: apost },
    { label: 'Seguro salud', value: seguro },
    { label: 'Pasaje', value: pasaje },
    { label: 'Fondos a acreditar', value: fondos },
  ].filter((s) => s.value > 0);
  const chart = slices.length >= 2 ? {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total USD',
    ariaLabel: 'Composición del costo de la visa: tasa, traducciones, apostillas, seguro, pasaje y fondos a acreditar',
  } : undefined;
  return {
    costoTotalUsd: Number(total.toFixed(2)),
    costoFijoUsd: Number(fijo.toFixed(2)),
    fondosBloqueadosUsd: Number(fondos.toFixed(2)),
    explicacion: `Visa Portugal: gasto fijo USD ${fijo.toFixed(2)} (tasa ${tasa} + traducciones ${trad} + apostillas ${apost} + seguro ${seguro} + pasaje ${pasaje}). Fondos a acreditar USD ${fondos.toFixed(2)}.`,
    _chart: chart,
  };
}
