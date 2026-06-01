/** Precio tonelada CO2 por mercado y proyecto (2026) */
export interface Inputs { mercado: 'eu_ets' | 'verra_vcs' | 'gold_standard' | 'voluntary'; tipoProyecto: 'forestacion' | 'biochar' | 'dac' | 'cocinas' | 'renovables'; toneladas: number; feeBrokerPct: number; }
export interface Outputs { precioPorToneladaUsd: number; subtotalUsd: number; feeUsd: number; totalUsd: number; explicacion: string; _chart?: any; _insight?: any; }
export function carbonCreditToneladaPrecioMercado2026(i: Inputs): Outputs {
  const ton = Number(i.toneladas);
  const fee = Number(i.feeBrokerPct) / 100;
  if (!ton || ton <= 0) throw new Error('Ingresá la cantidad de toneladas');
  const tabla: Record<string, Record<string, number>> = {
    eu_ets:        { forestacion: 85, biochar: 95, dac: 110, cocinas: 80, renovables: 78 },
    verra_vcs:     { forestacion: 12, biochar: 180, dac: 450, cocinas: 6, renovables: 4 },
    gold_standard: { forestacion: 18, biochar: 200, dac: 480, cocinas: 14, renovables: 7 },
    voluntary:     { forestacion: 8, biochar: 150, dac: 380, cocinas: 5, renovables: 3 },
  };
  const precio = tabla[i.mercado]?.[i.tipoProyecto];
  if (!precio) throw new Error('Mercado o proyecto inválido');
  const subtotal = precio * ton;
  const feeUsd = subtotal * fee;
  const total = subtotal + feeUsd;
  const chart = feeUsd > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Créditos', value: Number(subtotal.toFixed(2)) },
      { label: 'Fee broker', value: Number(feeUsd.toFixed(2)) },
    ],
    prefix: 'USD ',
    centerValue: 'USD ' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición del costo: créditos de carbono más fee del broker.',
  } : undefined;
  const feePctTotal = total > 0 ? (feeUsd / total) * 100 : 0;
  const preciosMercado = Object.values(tabla[i.mercado]);
  const precioMin = Math.min(...preciosMercado);
  const proyectoMasBarato = Object.keys(tabla[i.mercado]).find(k => tabla[i.mercado][k] === precioMin) || '';
  const esMasCaro = precio > precioMin;
  const compara = esMasCaro
    ? ` Es de los proyectos más caros del mercado: el más barato (**${proyectoMasBarato}**) cuesta **USD ${precioMin}/t**.`
    : ` Ya estás en el proyecto más barato de ese mercado (USD ${precioMin}/t).`;
  const insight = {
    title: 'De dónde sale el precio',
    text: `**${i.tipoProyecto}** en **${i.mercado.replace('_', ' ').toUpperCase()}** cotiza **USD ${precio}/t**; el fee del broker (**${(fee * 100).toFixed(1)}%**) suma **USD ${feeUsd.toFixed(2)}**, un **${feePctTotal.toFixed(0)}%** del total.` + compara,
    tone: 'neutral' as const,
    icon: '🌱',
  };

  return {
    precioPorToneladaUsd: precio,
    subtotalUsd: Number(subtotal.toFixed(2)),
    feeUsd: Number(feeUsd.toFixed(2)),
    totalUsd: Number(total.toFixed(2)),
    explicacion: `${ton} t CO2 en ${i.mercado} (${i.tipoProyecto}) a USD ${precio}/t = USD ${subtotal.toLocaleString('es-AR')} + fee broker ${(fee * 100).toFixed(1)}% (USD ${feeUsd.toFixed(2)}) = USD ${total.toLocaleString('es-AR')}.`,
    _chart: chart,
    _insight: insight,
  };
}
