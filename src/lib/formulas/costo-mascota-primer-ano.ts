/** Gasto estimado del primer año de una mascota (perro o gato) */
export interface Inputs {
  tipoMascota: string;
  tamano: string;
  costoAlimentoMensual: number;
  incluyeCastracion: string;
  costoCastracion: number;
  costoVacunas: number;
  costoAccesorios: number;
  visitasVetExtra: number;
}
export interface Outputs {
  totalPrimerAno: number;
  gastoMensualPromedio: number;
  detalle: string;
}

export function costoMascotaPrimerAno(i: Inputs): Outputs {
  const alimento = Number(i.costoAlimentoMensual) || 0;
  const castracion = i.incluyeCastracion === 'si' ? (Number(i.costoCastracion) || 0) : 0;
  const vacunas = Number(i.costoVacunas) || 0;
  const accesorios = Number(i.costoAccesorios) || 0;
  const vetExtra = Number(i.visitasVetExtra) || 0;

  if (alimento <= 0) throw new Error('Ingresá el gasto mensual en alimento');

  const alimentoAnual = alimento * 12;
  const total = alimentoAnual + castracion + vacunas + accesorios + vetExtra;
  const mensual = total / 12;

  const tipo = i.tipoMascota === 'gato' ? 'gato' : 'perro';
  const tam = i.tamano || 'mediano';
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    totalPrimerAno: Math.round(total),
    gastoMensualPromedio: Math.round(mensual),
    detalle: `Primer año de un ${tipo} ${tam}: alimento $${fmt.format(alimentoAnual)} + vacunas $${fmt.format(vacunas)} + accesorios $${fmt.format(accesorios)} + veterinario $${fmt.format(vetExtra)}${castracion > 0 ? ` + castración $${fmt.format(castracion)}` : ''} = $${fmt.format(total)} total ($${fmt.format(mensual)}/mes promedio).`,
  };
}
