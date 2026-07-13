/** Gastos de escritura en compraventa inmobiliaria */
export interface Inputs {
  valorOperacion: number;
  esComprador: string;
  selloPct?: number;
  honorariosPct?: number;
}
export interface Outputs {
  gastoTotal: number;
  honorarios: number;
  sellos: number;
  iti: number;
  otros: number;
  _chart?: any;
  _insight?: any;
}

/**
 * Toma un porcentaje opcional y aplica un default si viene vacío/ausente/inválido.
 * Number(undefined)=NaN y Number('')=0, así que ni `?? def` ni `Number.isFinite`
 * solos alcanzan: el form manda '' para campos en blanco y la API omite la clave.
 * Un 0 explícito (jurisdicción exenta, field min:0) SÍ se respeta.
 */
function pctOrDefault(v: unknown, def: number): number {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function gastosEscrituraCompraventa(i: Inputs): Outputs {
  const valor = Number(i.valorOperacion);
  const esComprador = i.esComprador === 'comprador';
  const selloPct = pctOrDefault(i.selloPct, 3.6);
  const honPct = pctOrDefault(i.honorariosPct, 2);

  if (!valor || valor <= 0) throw new Error('Ingresá el valor de la operación');

  const honorariosBruto = valor * (honPct / 100);
  const honorarios = esComprador ? Math.round(honorariosBruto * 1.21) : 0; // +IVA 21%
  const sellos = esComprador ? Math.round(valor * (selloPct / 100)) : 0;
  const iti = 0; // ITI DEROGADO por Ley 27.743 (vigente 15/7/2024). El vendedor ya no paga 1,5% ITI.
  const otros = esComprador ? Math.round(valor * 0.004) : 0; // ~0.4% certificados etc

  const gastoTotal = honorarios + sellos + iti + otros;

  const partes = [
    { label: 'Honorarios escribano', value: honorarios },
    { label: 'Sellos', value: sellos },
    { label: 'ITI', value: iti },
    { label: 'Otros (certificados)', value: otros },
  ].filter((p) => p.value > 0);

  const chart = partes.length >= 2 ? {
    type: 'doughnut' as const,
    slices: partes,
    prefix: '$',
    centerValue: '$' + Math.round(gastoTotal).toLocaleString('es-AR'),
    centerLabel: 'Gasto total',
    ariaLabel: 'Composición de los gastos de escritura: honorarios, sellos, ITI y otros',
  } : undefined;

  const pctSobreOperacion = valor > 0 ? (gastoTotal / valor) * 100 : 0;
  const mayor = partes.length ? partes.reduce((a, b) => (b.value > a.value ? b : a)) : null;
  const mayorPct = mayor && gastoTotal > 0 ? Math.round((mayor.value / gastoTotal) * 100) : 0;
  const insightText = !esComprador
    ? `Como **vendedor** ya no tenés gastos de escrituración obligatorios: el **ITI del 1,5% fue derogado en 2024** (Ley 27.743). Aparte vas a afrontar la **comisión inmobiliaria** (~3% + IVA) y, si compraste el inmueble desde el 1/1/2018, el **impuesto a las ganancias cedular** (15% sobre la ganancia, no sobre el valor total).`
    : mayor
    ? `Como **comprador** vas a desembolsar **$${gastoTotal.toLocaleString('es-AR')}** en gastos de escritura, un **${pctSobreOperacion.toFixed(1)}%** del valor de la operación. El rubro más pesado es **${mayor.label.toLowerCase()}** (${mayorPct}% del total): presupuestalo aparte del precio.`
    : `Como **comprador** vas a desembolsar **$${gastoTotal.toLocaleString('es-AR')}** en gastos de escritura, un **${pctSobreOperacion.toFixed(1)}%** del valor de la operación. Presupuestalo aparte del precio.`;
  const insight = {
    title: esComprador ? 'Cuánto suman los gastos' : 'El vendedor ya no paga ITI',
    text: insightText,
    tone: (esComprador ? 'warn' : 'info') as const,
    icon: '🏠',
  };

  return { gastoTotal, honorarios, sellos, iti, otros, _chart: chart, _insight: insight };
}
