/**
 * Calculadora de precio por hora de servicio de impresión 3D
 */

export interface Inputs {
  precioImpresora: number; amortizacionMeses: number; horasMes: number; watts: number; kwh: number; tiempoHumano: number; tarifaHumana: number;
}

export interface Outputs {
  precioHora: string; amortizacion: string; electricidad: string; desgaste: string; manoObra: string;
  _insight?: any; _chart?: any;
}

export function precioHoraServicio3d(inputs: Inputs): Outputs {
  const pi = Number(inputs.precioImpresora);
  const am = Number(inputs.amortizacionMeses);
  const hm = Number(inputs.horasMes);
  const w = Number(inputs.watts);
  const kwh = Number(inputs.kwh);
  const th = Number(inputs.tiempoHumano);
  const tah = Number(inputs.tarifaHumana);
  if (!pi || !am || !hm || !w || !kwh || !tah) throw new Error('Completá los campos');
  const amHora = (pi / am) / hm;
  const elHora = (w / 1000) * kwh;
  const desgaste = (amHora + elHora) * 0.10;
  const manoObra = (th / 60) * tah;
  const total = amHora + elHora + desgaste + manoObra;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const partes: Array<{ label: string; value: number }> = [
    { label: 'Amortización', value: amHora },
    { label: 'Electricidad', value: elHora },
    { label: 'Desgaste', value: desgaste },
    { label: 'Mano de obra', value: manoObra },
  ];
  const mayor = partes.reduce((a, b) => (b.value > a.value ? b : a));
  const pctMayor = total > 0 ? (mayor.value / total) * 100 : 0;

  const _insight = {
    title: 'Este es tu costo real por hora',
    text: `Cobrar menos de **${fmt(total)}/hora** es trabajar a pérdida. El componente más pesado es **${mayor.label.toLowerCase()}** (**${pctMayor.toFixed(0)}%** del total): si querés bajar el precio, ahí está la palanca.`,
    tone: 'neutral' as const,
    icon: '🖨️',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: partes.map((p) => ({ label: p.label, value: Math.round(p.value) })),
    prefix: '$',
    centerValue: fmt(total),
    centerLabel: 'Costo/hora',
    ariaLabel: 'Composición del costo por hora de impresión 3D: amortización, electricidad, desgaste y mano de obra',
  };

  return {
    precioHora: `$${total.toFixed(0)}/hora`,
    amortizacion: `$${amHora.toFixed(0)}`,
    electricidad: `$${elHora.toFixed(0)}`,
    desgaste: `$${desgaste.toFixed(0)}`,
    manoObra: `$${manoObra.toFixed(0)}`,
    _insight,
    _chart,
  };
}
