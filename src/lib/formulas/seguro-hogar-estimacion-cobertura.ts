/** Estimación de prima de seguro de hogar */
export interface Inputs {
  metrosCuadrados: number;
  valorM2: number;
  valorContenido: number;
  zona?: string;
  tipoCobertura?: string;
}
export interface Outputs {
  primaMensual: number;
  primaAnual: number;
  sumaAseguradaTotal: number;
  detalle: string;
}

export function seguroHogarEstimacionCobertura(i: Inputs): Outputs {
  const m2 = Number(i.metrosCuadrados);
  const valorM2 = Number(i.valorM2);
  const contenido = Number(i.valorContenido);
  const zona = i.zona || 'media';
  const cobertura = i.tipoCobertura || 'intermedia';

  if (!m2 || m2 <= 0) throw new Error('Ingresá los metros cuadrados');
  if (!valorM2 || valorM2 <= 0) throw new Error('Ingresá el valor de reconstrucción por m²');
  if (contenido < 0) throw new Error('El valor del contenido no puede ser negativo');

  const valorEdificio = m2 * valorM2;
  const sumaTotal = valorEdificio + contenido;

  // Tasa base según cobertura
  const tasaCobertura: Record<string, number> = {
    basica: 0.004,
    intermedia: 0.008,
    completa: 0.012,
  };
  let tasa = tasaCobertura[cobertura] || 0.008;

  // Ajuste por zona
  const factorZona: Record<string, number> = {
    baja: 0.80,
    media: 1.0,
    alta: 1.30,
  };
  tasa *= factorZona[zona] || 1.0;

  const primaAnual = sumaTotal * tasa;
  const primaMensual = primaAnual / 12;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    primaMensual: Math.round(primaMensual),
    primaAnual: Math.round(primaAnual),
    sumaAseguradaTotal: Math.round(sumaTotal),
    detalle: `Edificio: ${m2} m² × $${fmt.format(valorM2)} = $${fmt.format(valorEdificio)}. Contenido: $${fmt.format(contenido)}. Suma asegurada: $${fmt.format(sumaTotal)}. Tasa ${(tasa * 100).toFixed(2)}% anual (${cobertura}, zona ${zona}). Prima: $${fmt.format(primaAnual)}/año = $${fmt.format(primaMensual)}/mes.`,
  };
}
