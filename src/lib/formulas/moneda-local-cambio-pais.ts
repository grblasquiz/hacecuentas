/** Moneda local: cuánta plata llevar en efectivo al viaje */
export interface MonedaLocalInputs {
  gastoDiarioUSD: number;
  dias: number;
  porcentajeEfectivo?: number;
  viajeros?: number;
}
export interface MonedaLocalOutputs {
  efectivoTotalUSD: number;
  gastoTotalUSD: number;
  tarjetaUSD: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

export function monedaLocalCambioPais(inputs: MonedaLocalInputs): MonedaLocalOutputs {
  const gastoDiario = Number(inputs.gastoDiarioUSD);
  const dias = Number(inputs.dias);
  const pctEfectivo = Number(inputs.porcentajeEfectivo ?? 35);
  const viajeros = Number(inputs.viajeros) || 1;

  if (!gastoDiario || gastoDiario <= 0) throw new Error('Ingresá el gasto diario estimado');
  if (!dias || dias <= 0) throw new Error('Ingresá los días de viaje');
  if (pctEfectivo < 0 || pctEfectivo > 100) throw new Error('El porcentaje debe estar entre 0 y 100');

  const totalPorPersona = gastoDiario * dias;
  const efectivoPorPersona = Number((totalPorPersona * pctEfectivo / 100).toFixed(2));
  const tarjetaPorPersona = Number((totalPorPersona - efectivoPorPersona).toFixed(2));

  const efectivoTotal = Number((efectivoPorPersona * viajeros).toFixed(2));
  const gastoTotal = Number((totalPorPersona * viajeros).toFixed(2));
  const tarjetaTotal = Number((tarjetaPorPersona * viajeros).toFixed(2));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const chart = (efectivoTotal > 0 && tarjetaTotal > 0) ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Efectivo', value: efectivoTotal },
      { label: 'Tarjeta', value: tarjetaTotal },
    ],
    prefix: 'USD ',
    centerValue: 'USD ' + Math.round(gastoTotal).toLocaleString('es-AR'),
    centerLabel: 'Gasto total',
    ariaLabel: 'Composición del gasto del viaje: efectivo y tarjeta',
  } : undefined;

  const efectivoAlto = pctEfectivo > 50;
  const insight = {
    title: 'Cuánto efectivo llevar',
    text: `Llevá unos **USD ${fmt.format(efectivoTotal)}** en efectivo (${pctEfectivo}% del gasto) y dejá **USD ${fmt.format(tarjetaTotal)}** para tarjeta${viajeros > 1 ? `, entre ${viajeros} viajeros` : ''}.` + (efectivoAlto
      ? ` Es bastante plata en mano: repartila entre personas y la caja de seguridad del hotel.`
      : ` Buena proporción: minimizás el cash a la vista y cubrís lo que no toma plástico (propinas, transporte, mercados).`),
    tone: efectivoAlto ? 'warn' : 'good',
    icon: '💵',
  };

  return {
    efectivoTotalUSD: efectivoTotal,
    gastoTotalUSD: gastoTotal,
    tarjetaUSD: tarjetaTotal,
    _chart: chart,
    _insight: insight,
    detalle: `${dias} días × USD ${fmt.format(gastoDiario)}/día = USD ${fmt.format(totalPorPersona)}/persona. Efectivo (${pctEfectivo}%): USD ${fmt.format(efectivoPorPersona)}/persona. Tarjeta: USD ${fmt.format(tarjetaPorPersona)}/persona.${viajeros > 1 ? ` Total ${viajeros} viajeros: USD ${fmt.format(efectivoTotal)} en efectivo.` : ''}`,
  };
}
