import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  salario_mensual: number;
  dias_trabajados: number;
  auxilio_transporte: boolean;
  meses_trabajados?: number;
}

export interface Outputs {
  base_prima: number;
  prima_junio: number;
  prima_diciembre: number;
  prima_total_ano: number;
  prima_proporcional: number;
  dias_por_liquidar: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).auxilio_transporte = (i as any).auxilio_transporte === true || (i as any).auxilio_transporte === 'true';
  // Constantes 2026 Colombia
  const AUXILIO_TRANSPORTE_2026 = COLOMBIA_2026.auxilioTransporte; // $249.095 (Decreto 1470/2025) — fuente única
  const DIAS_ANNO = 360; // Días laborales año colombiano
  const DIAS_PRIMA = 30; // Días prima legal anual

  // Validar inputs
  const salario = Math.max(i.salario_mensual || 0, 0);
  const diasTrabajados = Math.min(Math.max(i.dias_trabajados || 360, 1), 360);
  const incluirAuxilio = i.auxilio_transporte ?? true;

  // Calcular base prima
  const basePrima = salario + (incluirAuxilio ? AUXILIO_TRANSPORTE_2026 : 0);

  // Prima anual sin proporcionalidad
  const primaAnualCompleta = basePrima;

  // Calcular días por liquidar (proporcionalidad)
  const diasPorLiquidar = (diasTrabajados / DIAS_ANNO) * DIAS_PRIMA;

  // Prima proporcional según días trabajados
  const primaProporcional = basePrima * (diasTrabajados / DIAS_ANNO);

  // Determinar si aplicar proporcionalidad
  const esAnnoCompleto = diasTrabajados >= DIAS_ANNO;
  const primaTotalAnio = esAnnoCompleto ? primaAnualCompleta : primaProporcional;

  // Dividir prima en junio y diciembre
  const primaJunio = Math.round(primaTotalAnio / 2);
  const primaDiciembre = Math.round(primaTotalAnio / 2);

  const totalAnio = Math.round(primaTotalAnio);
  const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const _insight = {
    title: 'Tu prima legal de servicios',
    text: esAnnoCompleto
      ? `Trabajando el **año completo** te corresponde **${cop(totalAnio)}** de prima, equivalente a un mes de salario base. Se paga en dos cuotas: **${cop(primaJunio)}** en junio y **${cop(primaDiciembre)}** en diciembre.`
      : `Por **${diasTrabajados} días** trabajados (de 360) la prima es proporcional: **${cop(totalAnio)}** en total, repartidos en **${cop(primaJunio)}** en junio y **${cop(primaDiciembre)}** en diciembre. ${incluirAuxilio ? `La base incluye el auxilio de transporte (${cop(AUXILIO_TRANSPORTE_2026)}).` : ''}`,
    tone: 'good' as const,
    icon: '🇨🇴',
  };

  const _chart = totalAnio > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cuota de junio', value: primaJunio },
      { label: 'Cuota de diciembre', value: primaDiciembre },
    ],
    prefix: '$',
    centerValue: cop(totalAnio),
    centerLabel: 'Prima del año',
    ariaLabel: 'Reparto de la prima legal anual entre la cuota de junio y la de diciembre',
  } : undefined;

  return {
    base_prima: Math.round(basePrima),
    prima_junio: primaJunio,
    prima_diciembre: primaDiciembre,
    prima_total_ano: Math.round(primaTotalAnio),
    prima_proporcional: Math.round(primaProporcional),
    dias_por_liquidar: Math.round(diasPorLiquidar * 10) / 10,
    _insight,
    _chart
  };
}
