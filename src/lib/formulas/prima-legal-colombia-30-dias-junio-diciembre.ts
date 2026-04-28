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
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia
  const AUXILIO_TRANSPORTE_2026 = 163286; // DIAN 2026
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

  return {
    base_prima: Math.round(basePrima),
    prima_junio: primaJunio,
    prima_diciembre: primaDiciembre,
    prima_total_ano: Math.round(primaTotalAnio),
    prima_proporcional: Math.round(primaProporcional),
    dias_por_liquidar: Math.round(diasPorLiquidar * 10) / 10
  };
}
