/** Estimador de factura de gas */
export interface Inputs { consumoM3: number; zona: string; tieneSubsidio?: string; }
export interface Outputs { facturaEstimada: number; facturaMensual: number; precioM3: number; consumoCategoria: string; _insight?: any; _chart?: any; }

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

  const totalR = Math.round(facturaEstimada);
  const mensualR = Math.round(facturaEstimada / 2);
  const altoTone = categoria === 'Alto' || categoria === 'Muy alto';
  const insightText = altoTone
    ? `Consumo **${categoria.toLowerCase()}** (${m3} m³/bimestre): la factura estimada es de **$${totalR.toLocaleString('es-AR')}** (~$${mensualR.toLocaleString('es-AR')}/mes)${subsidio ? ', ya con subsidio aplicado' : ', sin subsidio'}. Bajar la calefacción o sellar pérdidas se nota fuerte acá.`
    : `Consumo **${categoria.toLowerCase()}** (${m3} m³/bimestre): la factura estimada es de **$${totalR.toLocaleString('es-AR')}** (~$${mensualR.toLocaleString('es-AR')}/mes)${subsidio ? ', con subsidio aplicado' : ', sin subsidio'}. Los impuestos pesan ~25% del total.`;

  return {
    facturaEstimada: totalR,
    facturaMensual: mensualR,
    precioM3: Math.round(facturaEstimada / m3),
    consumoCategoria: `${categoria} (${m3} m3/bimestre)`,
    _insight: {
      title: 'Tu factura de gas',
      text: insightText,
      tone: altoTone ? 'warn' : 'neutral',
      icon: '🔥',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Cargo fijo', value: Math.round(cargoFijo) },
        { label: 'Gas consumido', value: Math.round(gasConsumo) },
        { label: 'Impuestos', value: Math.round(impuestos) },
      ],
      prefix: '$',
      centerValue: `$${totalR.toLocaleString('es-AR')}`,
      centerLabel: 'Total bimestral',
      ariaLabel: `Composición de la factura de gas: cargo fijo, gas consumido e impuestos suman $${totalR.toLocaleString('es-AR')}`,
    },
  };
}
