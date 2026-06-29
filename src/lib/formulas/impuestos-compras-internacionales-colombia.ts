export interface Inputs {
  valor_usd: number;
  trm: number;
  pais_con_tlc: string; // "si" | "no"
  categoria_arancel: number; // porcentaje, ej. 0, 10, 15
}

export interface Outputs {
  valor_cop: number;
  iva: number;
  arancel: number;
  total_impuestos: number;
  costo_final: number;
  _insight?: any;
  _table?: any;
}

const IVA = 0.19; // IVA general Colombia (verificado)

// Núcleo de cálculo: misma lógica para el resultado y cada fila de la tabla.
function calcularImpuestos(valorUSD: number, trm: number, conTLC: boolean, arancelPct: number) {
  const usd = Math.max(0, valorUSD || 0);
  const tasa = Math.max(0, trm || 0);
  const umbral = conTLC ? 200 : 50; // de minimis: USD 200 con TLC (rige en la práctica), USD 50 sin TLC
  const valorCOP = usd * tasa;

  let arancel = 0;
  let iva = 0;
  if (usd > umbral) {
    arancel = valorCOP * (Math.max(0, arancelPct || 0) / 100);
    iva = (valorCOP + arancel) * IVA;
  }
  const totalImpuestos = iva + arancel;
  const costoFinal = valorCOP + totalImpuestos;

  return { usd, umbral, valorCOP, arancel, iva, totalImpuestos, costoFinal, exento: usd <= umbral };
}

export function compute(i: Inputs): Outputs {
  const conTLC = String(i.pais_con_tlc) !== 'no'; // por defecto sí (EE.UU., TLC vigente)
  const r = calcularImpuestos(i.valor_usd || 0, i.trm || 4000, conTLC, i.categoria_arancel || 0);

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const _insight = r.exento
    ? {
        title: 'Compra exenta de impuestos',
        text: `Tu compra de **USD ${r.usd.toLocaleString('es-CO')}** está dentro del de minimis de **USD ${r.umbral}**, así que no paga IVA ni arancel. Solo pagás el valor del producto: **${fmtCOP(r.valorCOP)}** (más el flete que cobre el courier).`,
        tone: 'good' as const,
        icon: '📦',
      }
    : {
        title: 'Tu compra paga impuestos',
        text: `Al superar el de minimis de **USD ${r.umbral}**, tu compra paga **${fmtCOP(r.iva)}** de IVA${r.arancel > 0 ? ` y **${fmtCOP(r.arancel)}** de arancel` : ''}. El costo final sube a **${fmtCOP(r.costoFinal)}** (sin contar el flete).`,
        tone: 'warn' as const,
        icon: '📦',
      };

  // Tabla: cómo escala el costo final según el valor en USD, con la MISMA lógica.
  const valoresUSD = [50, 150, 200, 250, 400];
  const filas = new Map<number, boolean>();
  for (const v of valoresUSD) filas.set(v, false);
  if (r.usd > 0) filas.set(r.usd, true);
  const ordenadas = Array.from(filas.entries()).sort((a, b) => a[0] - b[0]).slice(0, 7);
  const rows = ordenadas.map(([v, tuCaso]) => {
    const c = calcularImpuestos(v, i.trm || 4000, conTLC, i.categoria_arancel || 0);
    return [
      `USD ${v.toLocaleString('es-CO')}${tuCaso ? ' (tu caso)' : ''}`,
      fmtCOP(c.valorCOP),
      c.exento ? 'Exento' : fmtCOP(c.totalImpuestos),
      fmtCOP(c.costoFinal),
    ];
  });
  const _table = {
    title: `Costo final por valor de compra (TRM ${fmtCOP(i.trm || 4000)}, de minimis USD ${r.umbral})`,
    headers: ['Valor en USD', 'Valor en pesos', 'Impuestos', 'Costo final'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows,
    note: 'Por debajo del de minimis no hay IVA ni arancel. Al superarlo, IVA 19% sobre (valor + arancel). No incluye el flete ni la comisión del courier.',
  };

  return {
    valor_cop: Math.round(r.valorCOP),
    iva: Math.round(r.iva),
    arancel: Math.round(r.arancel),
    total_impuestos: Math.round(r.totalImpuestos),
    costo_final: Math.round(r.costoFinal),
    _insight,
    _table,
  };
}
