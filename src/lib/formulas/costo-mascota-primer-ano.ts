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
  _insight?: any;
  _chart?: any;
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

  // Gastos del primer año que NO se repiten igual el segundo (setup inicial)
  const setupInicial = castracion + vacunas + accesorios;
  const pctSetup = total > 0 ? Math.round((setupInicial / total) * 100) : 0;
  const pctAlimento = total > 0 ? Math.round((alimentoAnual / total) * 100) : 0;

  const slices = [
    { label: 'Alimento (12 meses)', value: alimentoAnual },
    { label: 'Vacunas', value: vacunas },
    { label: 'Accesorios', value: accesorios },
    { label: 'Veterinario extra', value: vetExtra },
  ];
  if (castracion > 0) slices.push({ label: 'Castración', value: castracion });

  return {
    totalPrimerAno: Math.round(total),
    gastoMensualPromedio: Math.round(mensual),
    detalle: `Primer año de un ${tipo} ${tam}: alimento $${fmt.format(alimentoAnual)} + vacunas $${fmt.format(vacunas)} + accesorios $${fmt.format(accesorios)} + veterinario $${fmt.format(vetExtra)}${castracion > 0 ? ` + castración $${fmt.format(castracion)}` : ''} = $${fmt.format(total)} total ($${fmt.format(mensual)}/mes promedio).`,
    _insight: {
      title: 'El primer año es el más caro',
      text: `El primer año de tu ${tipo} sale **$${fmt.format(total)}** (~**$${fmt.format(mensual)}/mes**). De ese total, **$${fmt.format(setupInicial)}** (**${pctSetup}%**) son gastos de arranque que casi no se repiten —vacunas, accesorios${castracion > 0 ? ' y castración' : ''}—, mientras el alimento se lleva el **${pctAlimento}%**. A partir del segundo año, el gasto mensual baja bastante.`,
      tone: pctSetup >= 40 ? 'warn' : 'neutral',
      icon: tipo === 'gato' ? '🐱' : '🐶',
    },
    _chart: {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: '$' + fmt.format(total),
      centerLabel: 'Total año 1',
      ariaLabel: `Desglose del costo del primer año de un ${tipo}: alimento ${fmt.format(alimentoAnual)}, vacunas ${fmt.format(vacunas)}, accesorios ${fmt.format(accesorios)}, veterinario ${fmt.format(vetExtra)}${castracion > 0 ? `, castración ${fmt.format(castracion)}` : ''}.`,
    },
  };
}
