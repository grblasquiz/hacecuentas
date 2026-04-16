/** Estimador de factura de luz mensual */
export interface Inputs { consumoKwh: number; tarifa: string; precioKwhBase?: number; }
export interface Outputs { facturaEstimada: number; precioKwhEfectivo: number; cargoFijo: number; consumoCategoria: string; }

export function facturaLuzEstimada(i: Inputs): Outputs {
  const kwh = Number(i.consumoKwh);
  const tarifa = i.tarifa || 'sin-subsidio';
  if (!kwh || kwh < 0) throw new Error('Ingresá el consumo en kWh');

  const precios: Record<string, number> = { 'subsidiada': 70, 'sin-subsidio': 140, 'ingresos-altos': 185 };
  const precioKwh = Number(i.precioKwhBase) || precios[tarifa] || 140;
  const cargoFijo = tarifa === 'subsidiada' ? 3000 : tarifa === 'ingresos-altos' ? 8000 : 5000;
  const energiaBruta = kwh * precioKwh;
  const subtotal = cargoFijo + energiaBruta;
  const impuestos = subtotal * 0.27; // IVA 21% + municipal + otros
  const facturaEstimada = subtotal + impuestos;

  let categoria = 'Bajo';
  if (kwh > 500) categoria = 'Muy alto';
  else if (kwh > 350) categoria = 'Alto';
  else if (kwh > 200) categoria = 'Medio';

  return {
    facturaEstimada: Math.round(facturaEstimada),
    precioKwhEfectivo: Math.round(facturaEstimada / kwh),
    cargoFijo: Math.round(cargoFijo),
    consumoCategoria: `${categoria} (${kwh} kWh/mes)`,
  };
}
