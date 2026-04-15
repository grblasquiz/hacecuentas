/** Costo de estacionamiento en aeropuerto por días */
export interface EstacionamientoInputs {
  dias: number;
  tipoParking?: string;
  costoDia?: number;
}
export interface EstacionamientoOutputs {
  costoTotal: number;
  costoPorDia: number;
  detalle: string;
}

const COSTO_DIA_REF: Record<string, { nombre: string; costo: number }> = {
  cubierto: { nombre: 'Cubierto (terminal)', costo: 10000 },
  descubierto: { nombre: 'Descubierto (terminal)', costo: 8000 },
  lowcost: { nombre: 'Low-cost (cercano)', costo: 6000 },
};

export function costoEstacionamientoAeropuertoDias(inputs: EstacionamientoInputs): EstacionamientoOutputs {
  const dias = Number(inputs.dias);
  const tipo = String(inputs.tipoParking || 'cubierto');
  const costoManual = Number(inputs.costoDia) || 0;

  if (!dias || dias <= 0) throw new Error('Ingresá la cantidad de días');
  if (!COSTO_DIA_REF[tipo]) throw new Error('Tipo de estacionamiento no válido');

  const costoDia = costoManual > 0 ? costoManual : COSTO_DIA_REF[tipo].costo;
  const costoTotal = Math.round(dias * costoDia);

  const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  return {
    costoTotal,
    costoPorDia: costoDia,
    detalle: `${dias} días en parking ${COSTO_DIA_REF[tipo].nombre}: ${fmt.format(costoDia)}/día × ${dias} = ${fmt.format(costoTotal)} total. Compará con remis ida+vuelta (~${fmt.format(35000)}-${fmt.format(50000)}) para viajes largos.`,
  };
}
