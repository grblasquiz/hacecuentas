/** Rentabilidad de alquilar vs. vender una propiedad */
export interface Inputs {
  valorPropiedad: number;
  alquilerMensual: number;
  gastosMensuales: number;
  expensasPropietario?: number;
  tasaAlternativa: number;
}
export interface Outputs {
  rentabilidadBrutaAnual: number;
  rentabilidadNetaAnual: number;
  capRate: number;
  comparacionTasa: number;
  ingresoNetoAnual: number;
  conviene: string;
}

export function rentabilidadAlquiler(i: Inputs): Outputs {
  const valor = Number(i.valorPropiedad);
  const alquiler = Number(i.alquilerMensual);
  const gastos = Number(i.gastosMensuales) || 0;
  const expensas = Number(i.expensasPropietario) || 0;
  const tasaAlt = Number(i.tasaAlternativa);
  if (!valor || valor <= 0) throw new Error('Ingresá el valor de la propiedad');
  if (!alquiler || alquiler <= 0) throw new Error('Ingresá el alquiler mensual');

  const bruta = (alquiler * 12 / valor) * 100;
  const ingresoNeto = (alquiler - gastos - expensas) * 12;
  const neta = (ingresoNeto / valor) * 100;
  const cap = neta; // cap rate = rentabilidad neta anual
  const diferencia = neta - tasaAlt;
  const conviene = diferencia > 0
    ? `Alquilar rinde ${diferencia.toFixed(2)} pp más que la tasa alternativa — conviene mantener.`
    : `Alquilar rinde ${Math.abs(diferencia).toFixed(2)} pp menos que la tasa alternativa — podría convenir vender e invertir.`;

  return {
    rentabilidadBrutaAnual: Number(bruta.toFixed(2)),
    rentabilidadNetaAnual: Number(neta.toFixed(2)),
    capRate: Number(cap.toFixed(2)),
    comparacionTasa: Number(diferencia.toFixed(2)),
    ingresoNetoAnual: Math.round(ingresoNeto),
    conviene,
  };
}
