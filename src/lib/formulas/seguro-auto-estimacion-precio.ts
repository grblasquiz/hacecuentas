/** Estimación orientativa del precio del seguro automotor */
export interface Inputs {
  valorAuto: number;
  tipoCobertura: number;
  zonaRiesgo: number;
}
export interface Outputs {
  cuotaMensual: number;
  costoAnual: number;
  porcentajeAnual: number;
  detalle: string;
}

export function seguroAutoEstimacionPrecio(i: Inputs): Outputs {
  const valor = Number(i.valorAuto);
  const tipo = Number(i.tipoCobertura);
  const zona = Number(i.zonaRiesgo);

  if (!valor || valor <= 0) throw new Error('Ingresá el valor de mercado del auto');
  if (tipo < 1 || tipo > 3) throw new Error('El tipo de cobertura debe ser 1 (Terceros), 2 (Terceros Completo) o 3 (Todo Riesgo)');
  if (zona < 1 || zona > 3) throw new Error('La zona debe ser 1 (Interior), 2 (Ciudad grande) o 3 (CABA/GBA)');

  // Tasas base por tipo de cobertura
  const tasasBase: Record<number, number> = { 1: 2.0, 2: 4.0, 3: 6.5 };
  const nombresCobertura: Record<number, string> = { 1: 'Responsabilidad civil', 2: 'Terceros completo', 3: 'Todo riesgo' };

  // Factor de zona
  const factoresZona: Record<number, number> = { 1: 0.8, 2: 1.0, 3: 1.25 };
  const nombresZona: Record<number, string> = { 1: 'Interior', 2: 'Ciudad grande', 3: 'CABA/GBA' };

  const tasaFinal = tasasBase[tipo] * factoresZona[zona];
  const costoAnual = valor * tasaFinal / 100;
  const cuotaMensual = costoAnual / 12;

  return {
    cuotaMensual: Math.round(cuotaMensual),
    costoAnual: Math.round(costoAnual),
    porcentajeAnual: Number(tasaFinal.toFixed(1)),
    detalle: `Seguro ${nombresCobertura[tipo]} en zona ${nombresZona[zona]}: ~$${Math.round(cuotaMensual).toLocaleString('es-AR')}/mes ($${Math.round(costoAnual).toLocaleString('es-AR')}/año). Tasa estimada: ${tasaFinal.toFixed(1)}% anual.`,
  };
}
