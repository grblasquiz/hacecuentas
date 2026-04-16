/** Estimador de factura de gas */
export interface Inputs { consumoM3: number; zona: string; tieneSubsidio?: string; }
export interface Outputs { facturaEstimada: number; facturaMensual: number; precioM3: number; consumoCategoria: string; }

export function facturaGasEstimada(i: Inputs): Outputs {
  const m3 = Number(i.consumoM3);
  const zona = i.zona || 'templada';
  const subsidio = i.tieneSubsidio === 'si';
  if (!m3 || m3 < 0) throw new Error('Ingresá el consumo en m3');

  const baseM3: Record<string, number> = { 'templada': 280, 'fria': 230, 'calida': 300 };
  let precioM3 = baseM3[zona] || 280;
  if (subsidio) precioM3 *= 0.45;

  const cargoFijo = subsidio ? 2500 : 5000;
  const gasConsumo = m3 * precioM3;
  const subtotal = cargoFijo + gasConsumo;
  const impuestos = subtotal * 0.25;
  const facturaEstimada = subtotal + impuestos;

  let categoria = 'Bajo';
  if (m3 > 120) categoria = 'Muy alto';
  else if (m3 > 80) categoria = 'Alto';
  else if (m3 > 40) categoria = 'Medio';

  return {
    facturaEstimada: Math.round(facturaEstimada),
    facturaMensual: Math.round(facturaEstimada / 2),
    precioM3: Math.round(facturaEstimada / m3),
    consumoCategoria: `${categoria} (${m3} m3/bimestre)`,
  };
}
