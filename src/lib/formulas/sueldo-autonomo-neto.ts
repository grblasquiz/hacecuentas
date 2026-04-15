/** Sueldo neto real de un autónomo/monotributista */

export interface Inputs {
  facturacionMensual: number;
  categoriaMonotributo: string;
  porcentajeIIBB: number;
}

export interface Outputs {
  netoEstimado: number;
  monotributo: number;
  iibb: number;
  otrosGastos: number;
  detalle: string;
}

// Pagos mensuales estimados monotributo 2026 (actualización enero 2026)
const MONOTRIBUTO_MENSUAL: Record<string, number> = {
  A: 32000,
  B: 37000,
  C: 42000,
  D: 55000,
  E: 65000,
  F: 78000,
  G: 90000,
  H: 250000,
  I: 280000,
  J: 320000,
  K: 365000,
};

export function sueldoAutonomoNeto(i: Inputs): Outputs {
  const facturacion = Number(i.facturacionMensual);
  const categoria = String(i.categoriaMonotributo).toUpperCase();
  const porcentajeIIBB = Number(i.porcentajeIIBB);

  if (isNaN(facturacion) || facturacion <= 0) throw new Error('Ingresá tu facturación mensual');
  if (!MONOTRIBUTO_MENSUAL[categoria]) throw new Error('Seleccioná una categoría válida (A-K)');
  if (isNaN(porcentajeIIBB) || porcentajeIIBB < 0) throw new Error('El porcentaje de IIBB no puede ser negativo');

  const monotributo = MONOTRIBUTO_MENSUAL[categoria];
  const iibb = facturacion * (porcentajeIIBB / 100);
  const otrosGastos = 15000; // estimado: contador, banco, etc.

  const netoEstimado = facturacion - monotributo - iibb - otrosGastos;
  const porcentajeNeto = (netoEstimado / facturacion) * 100;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Facturás $${fmt.format(facturacion)}, pagás $${fmt.format(monotributo)} de monotributo (cat. ${categoria}), ` +
    `$${fmt.format(iibb)} de IIBB (${porcentajeIIBB}%) y ~$${fmt.format(otrosGastos)} de otros gastos. ` +
    `Te queda un neto de $${fmt.format(netoEstimado)} (${porcentajeNeto.toFixed(1)}% de tu facturación).`;

  return {
    netoEstimado: Math.round(Math.max(0, netoEstimado)),
    monotributo,
    iibb: Math.round(iibb),
    otrosGastos,
    detalle,
  };
}
