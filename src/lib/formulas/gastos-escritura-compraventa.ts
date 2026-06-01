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
  const iti = !esComprador ? Math.round(valor * 0.015) : 0; // 1.5% ITI vendedor
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
  const ladoTxt = esComprador ? 'comprador' : 'vendedor';
  const insightText = mayor
    ? `Como **${ladoTxt}** vas a desembolsar **$${gastoTotal.toLocaleString('es-AR')}** en gastos de escritura, un **${pctSobreOperacion.toFixed(1)}%** del valor de la operación. El rubro más pesado es **${mayor.label.toLowerCase()}** (${mayorPct}% del total): presupuestalo aparte del precio.`
    : `Como **${ladoTxt}** vas a desembolsar **$${gastoTotal.toLocaleString('es-AR')}** en gastos de escritura, un **${pctSobreOperacion.toFixed(1)}%** del valor de la operación. Presupuestalo aparte del precio.`;
  const insight = {
    title: 'Cuánto suman los gastos',
    text: insightText,
    tone: 'warn' as const,
    icon: '🏠',
  };

  return { gastoTotal, honorarios, sellos, iti, otros, _chart: chart, _insight: insight };
}
