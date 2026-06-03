/**
 * Costo total estimado de una visa de turismo.
 * Suma los componentes obligatorios: tasa consular + cargo del centro de visas
 * (VFS/BLS/CVASC) + seguro de viaje (costo diario × días) + extras (fotos,
 * copias, courier). Todo en USD. Calc real, es-only.
 */
export interface Inputs {
  tasaConsular: number | string;       // USD
  cargoCentro?: number | string;       // USD — VFS/BLS/CVASC
  diasEstadia?: number | string;       // días de viaje (para el seguro)
  costoSeguroDia?: number | string;    // USD por día de seguro médico
  extras?: number | string;            // USD — fotos, copias, courier, traducción
  [k: string]: number | string | undefined;
}
export interface Outputs {
  costoTotal: number;
  seguroTotal: number;
  desglose: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
  [k: string]: string | number | any;
}

const usd = (n: number) => `USD ${n.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

export function visaTurismoPaisesCostoTiempo(i: Inputs): Outputs {
  if (i.tasaConsular === '' || i.tasaConsular == null) {
    throw new Error('Ingresá la tasa consular en USD.');
  }
  const tasa = Number(i.tasaConsular);
  if (!Number.isFinite(tasa) || tasa < 0) {
    throw new Error('Ingresá una tasa consular válida en USD (0 o más).');
  }
  const cargo = Math.max(0, Number(i.cargoCentro) || 0);
  const dias = Math.max(0, Number(i.diasEstadia) || 0);
  const seguroDia = i.costoSeguroDia === '' || i.costoSeguroDia == null
    ? 2 // default razonable: ~USD 2/día de seguro de viaje
    : Math.max(0, Number(i.costoSeguroDia) || 0);
  const extras = Math.max(0, Number(i.extras) || 0);

  const seguroTotal = Math.round(dias * seguroDia);
  const total = Math.round(tasa + cargo + seguroTotal + extras);

  // Componentes para desglose y gráfico (sólo los > 0).
  const comps: { nombre: string; valor: number }[] = [
    { nombre: 'Tasa consular', valor: Math.round(tasa) },
    { nombre: 'Centro de visas', valor: Math.round(cargo) },
    { nombre: 'Seguro de viaje', valor: seguroTotal },
    { nombre: 'Fotos / copias / courier', valor: Math.round(extras) },
  ].filter((c) => c.valor > 0);

  const desglose = comps.map((c) => `${c.nombre}: ${usd(c.valor)}`).join(' · ');

  const chart = {
    type: 'bar' as const,
    indexAxis: 'y' as const,
    ariaLabel: `Desglose del costo de la visa: ${comps.map((c) => `${c.nombre} ${usd(c.valor)}`).join(', ')}. Total ${usd(total)}.`,
    data: {
      labels: comps.map((c) => c.nombre),
      datasets: [{ label: 'Costo (USD)', data: comps.map((c) => c.valor), suffix: ' USD' }],
    },
  };

  // Componente más caro para el insight.
  const mayor = comps.slice().sort((a, b) => b.valor - a.valor)[0];
  const insightText = mayor
    ? `El costo total estimado es **${usd(total)}**. El componente más pesado es **${mayor.nombre.toLowerCase()}** (${usd(mayor.valor)}). Recordá que la tasa consular **no se reembolsa** ante un rechazo y que las tasas se cobran en la divisa del país emisor: convertí al tipo de cambio del día de pago.`
    : `El costo total estimado es **${usd(total)}**.`;

  return {
    costoTotal: total,
    seguroTotal,
    desglose,
    resumen: `Costo total estimado: ${usd(total)} (${desglose || 'sin componentes cargados'}).`,
    _chart: chart,
    _insight: {
      title: 'Cuánto te va a costar la visa',
      text: insightText,
      tone: 'neutral',
      icon: '🛂',
    },
  };
}
