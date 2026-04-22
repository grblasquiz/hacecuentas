/** Envío Flex vs Colecta MercadoLibre — comparación costo para vendedor y comprador */
export interface Inputs { precioProducto: number; categoria: string; pesoKg: number; }
export interface Outputs { flexCostoVendedor: number; colectaCostoComprador: number; flexNetoVendedor: number; colectaNetoVendedor: number; recomendacion: string; diferencia: number; }

export function envioFlexVsColectaMercadolibre(i: Inputs): Outputs {
  const precio = Number(i.precioProducto);
  const cat = String(i.categoria || 'general');
  const peso = Number(i.pesoKg) || 1;
  if (!precio || precio <= 0) throw new Error('Ingresá precio válido');
  // Flex: vendedor entrega personalmente, cobra bonificación por cada envío (~800-1500 ARS según zona/peso 2026)
  const flexBonificacion = peso <= 1 ? 850 : peso <= 3 ? 1100 : peso <= 5 ? 1400 : 1800;
  // Si precio > umbral envío gratis (~40k ARS), vendedor absorbe envío en Flex = 0 cobro pero menor costo vs Colecta
  const umbralEnvioGratis = 40000;
  const flexCostoVendedor = precio >= umbralEnvioGratis ? flexBonificacion * 0.5 : 0; // bonificación parcial si gratis
  const flexNetoVendedor = precio - flexCostoVendedor; // flex le ahorra al vendedor vs colecta normal
  // Colecta: correo privado (Andreani/OCA), cost depende peso y distancia
  const colectaTarifaBase = peso <= 1 ? 2800 : peso <= 3 ? 3500 : peso <= 5 ? 4200 : 5500;
  const colectaAjusteCategoria = cat === 'electronica' ? 1.15 : cat === 'hogar' ? 1.08 : 1.0;
  const colectaCostoComprador = Math.round(colectaTarifaBase * colectaAjusteCategoria);
  // En Colecta con envío gratis el vendedor absorbe el costo
  const colectaNetoVendedor = precio >= umbralEnvioGratis ? precio - colectaCostoComprador : precio;
  const diferencia = flexNetoVendedor - colectaNetoVendedor;
  const recomendacion = diferencia > 0
    ? `Flex conviene: ${Math.round(diferencia)} ARS más de ganancia y entrega más rápida.`
    : `Colecta conviene: ${Math.round(-diferencia)} ARS más de ganancia (no dedicás tiempo a entregar).`;
  return {
    flexCostoVendedor: Math.round(flexCostoVendedor),
    colectaCostoComprador: Math.round(colectaCostoComprador),
    flexNetoVendedor: Math.round(flexNetoVendedor),
    colectaNetoVendedor: Math.round(colectaNetoVendedor),
    recomendacion,
    diferencia: Math.round(diferencia),
  };
}
