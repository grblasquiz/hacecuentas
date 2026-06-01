/** Comisión agencia sobre derechos de imagen de futbolista */
export interface Inputs {
  ingresosImagenAnual: number; // USD anual
  tipoAgencia: string; // 'big' | 'boutique' | 'familiar'
  anosContrato: number;
  incluyeSponsors: boolean;
  gastosProduccion: number; // USD gastos deducibles
}

export interface Outputs {
  comisionPct: number;
  comisionAnual: number;
  comisionTotal: number;
  netoJugadorAnual: number;
  netoJugadorTotal: number;
  moneda: string;
  resumen: string;
  _chart?: any;
}

// Rangos de comisión vigentes (FIFA Football Agents 2023 + práctica de mercado)
const AGENCIA_PCT: Record<string, { pct: number; nombre: string }> = {
  big: { pct: 0.22, nombre: 'Agencia global top (CAA, Wasserman, Gestifute)' },
  boutique: { pct: 0.18, nombre: 'Agencia boutique' },
  familiar: { pct: 0.12, nombre: 'Representante familiar / entorno' },
};

export function derechosImagenComision(i: Inputs): Outputs {
  const ing = Math.max(0, Number(i.ingresosImagenAnual) || 0);
  const tipo = String(i.tipoAgencia || 'big');
  const anos = Math.max(1, Number(i.anosContrato) || 1);
  const incSpons = Boolean(i.incluyeSponsors);
  const gastos = Math.max(0, Number(i.gastosProduccion) || 0);

  const info = AGENCIA_PCT[tipo] || AGENCIA_PCT.big;
  let pct = info.pct;
  if (incSpons) pct += 0.03; // overhead cuando se cierran sponsors nuevos
  pct = Math.min(0.30, pct);

  const baseComision = Math.max(0, ing - gastos);
  const comisionAnual = baseComision * pct;
  const comisionTotal = comisionAnual * anos;
  const netoAnual = ing - gastos - comisionAnual;
  const netoTotal = netoAnual * anos;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto jugador', value: Math.round(netoAnual) },
      { label: 'Comisión agencia', value: Math.round(comisionAnual) },
      { label: 'Gastos producción', value: Math.round(gastos) },
    ],
    prefix: 'US$',
    centerValue: 'US$' + Math.round(ing).toLocaleString('en'),
    centerLabel: 'Ingreso/año',
    ariaLabel: 'Composición del ingreso anual por derechos de imagen: neto, comisión y gastos',
  };

  return {
    comisionPct: Number((pct * 100).toFixed(1)),
    comisionAnual: Math.round(comisionAnual),
    comisionTotal: Math.round(comisionTotal),
    netoJugadorAnual: Math.round(netoAnual),
    netoJugadorTotal: Math.round(netoTotal),
    moneda: 'USD',
    resumen: `Sobre US$ ${ing.toLocaleString('en')} anuales de imagen, ${info.nombre} cobra **${(pct * 100).toFixed(1)}% = US$ ${Math.round(comisionAnual).toLocaleString('en')}/año**. Neto jugador: **US$ ${Math.round(netoAnual).toLocaleString('en')}/año**.`,
    _chart: chart,
  };
}
