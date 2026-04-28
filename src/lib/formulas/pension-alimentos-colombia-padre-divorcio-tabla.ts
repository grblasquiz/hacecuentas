export interface Inputs {
  ingresos_brutos_mensuales: number;
  tipo_ingreso: 'dependiente' | 'independiente' | 'mixto';
  regimen_pensional: 'contributivo' | 'subsidio' | 'ninguno';
  numero_hijos: number;
  edades_hijos?: string;
  custodia_tipo: 'exclusive' | 'compartida' | 'uno_mas';
  gastos_extraordinarios?: number;
  gastos_extraordinarios_tipo?: 'educacion' | 'salud' | 'deportes' | 'otros';
  porcentaje_base: number;
  deuda_prestamos?: number;
  tiene_otros_hijos?: boolean;
  numero_otros_hijos?: number;
}

export interface Outputs {
  ingresos_netos: number;
  base_calculable: number;
  pension_basica_minima: number;
  pension_basica_orientativa: number;
  pension_basica_maxima: number;
  pension_por_hijo: number;
  gastos_extraordinarios_aporte: number;
  total_pension_mensual: number;
  pension_anual: number;
  rango_judicial: string;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia
  const EPS_DEPENDIENTE = 0.04; // 4% afiliado
  const PENSION_APORTE = 0.04; // 4% Colpensiones/AFP
  const IRPF_ESTIMADO = i.tipo_ingreso === 'dependiente' ? 0.08 : 0; // ~8% dependiente, 0 independiente
  const SALARIO_MINIMO_2026 = 1423500; // Pesos colombianos
  const MINIMO_SUBSISTENCIA = 1300000; // Ingreso mínimo vital deudor
  const IPC_2026 = 0.045; // Reajuste estimado 4.5%

  // Descuentos obligatorios
  let descuentos = 0;
  if (i.tipo_ingreso === 'dependiente' || i.tipo_ingreso === 'mixto') {
    descuentos += i.ingresos_brutos_mensuales * EPS_DEPENDIENTE; // EPS 4%
  }
  if (i.regimen_pensional === 'contributivo') {
    descuentos += i.ingresos_brutos_mensuales * PENSION_APORTE; // Pensión 4%
  }
  if (i.tipo_ingreso === 'dependiente') {
    descuentos += i.ingresos_brutos_mensuales * IRPF_ESTIMADO; // IRPF ~8%
  }

  // Ingresos netos
  const ingresos_netos = Math.max(
    i.ingresos_brutos_mensuales - descuentos,
    SALARIO_MINIMO_2026 * 0.7 // Nunca por debajo de subsistencia mínima
  );

  // Base calculable (netos menos deudas previas)
  const deuda = i.deuda_prestamos || 0;
  const base_calculable = Math.max(ingresos_netos - deuda, MINIMO_SUBSISTENCIA);

  // Ajuste por custodia compartida
  let multiplicador_custodia = 1.0;
  if (i.custodia_tipo === 'compartida') {
    multiplicador_custodia = 0.75; // Reduce 25% en custodia compartida
  }

  // Ajuste por otros hijos con pensión (concurrencia)
  let multiplicador_concurrencia = 1.0;
  if (i.tiene_otros_hijos && i.numero_otros_hijos && i.numero_otros_hijos > 0) {
    multiplicador_concurrencia = Math.max(
      1.0 - i.numero_otros_hijos * 0.25, // Reduce 25% por cada hijo
      0.5 // Mínimo 50% de disponibilidad
    );
  }

  // Porcentaje según criterio jurisprudencial
  const porcentaje_ajustado = i.porcentaje_base * multiplicador_custodia * multiplicador_concurrencia;

  // Pensiones mínima, orientativa y máxima
  const pension_basica_minima = base_calculable * 0.30;
  const pension_basica_orientativa = base_calculable * (porcentaje_ajustado / 100);
  const pension_basica_maxima = base_calculable * 0.50 * multiplicador_custodia * multiplicador_concurrencia;

  // Pensión por hijo (referencia)
  const pension_por_hijo = pension_basica_orientativa / i.numero_hijos;

  // Gastos extraordinarios (50% del deudor)
  const gastos_extraordinarios = i.gastos_extraordinarios || 0;
  const gastos_extraordinarios_aporte = gastos_extraordinarios * 0.5;

  // Total pensión mensual
  const total_pension_mensual = pension_basica_orientativa + gastos_extraordinarios_aporte;

  // Proyección anual
  const pension_anual = total_pension_mensual * 12;

  // Rango judicial esperado
  let rango_minimo = pension_basica_minima;
  let rango_maximo = pension_basica_maxima + gastos_extraordinarios_aporte;
  const rango_judicial = `$${Math.floor(rango_minimo).toLocaleString('es-CO')} a $${Math.floor(rango_maximo).toLocaleString('es-CO')} mensuales`;

  // Recomendación
  let recomendacion = '';

  if (base_calculable < MINIMO_SUBSISTENCIA * 1.2) {
    recomendacion += `⚠️ Ingreso muy cercano a subsistencia mínima. Juzgado puede reducir pensión si se demuestra incapacidad. `;
  }

  if (i.tiene_otros_hijos && i.numero_otros_hijos) {
    recomendacion += `⚠️ Concurrencia detectada: ${i.numero_otros_hijos} hijo(s) con pensión activa reduce disponibilidad. `;
  }

  if (i.custodia_tipo === 'compartida') {
    recomendacion += `📌 Custodia compartida reduce pensión ~25%. Verifique con sentencia de custodia. `;
  }

  recomendacion += `✓ Pensión se reajusta automáticamente cada febrero por IPC (~4,5% 2026). Solicite aumento ante juzgado si ingresos suben. Dura hasta 18 años (o 25 si estudia educación superior).`;

  return {
    ingresos_netos: Math.floor(ingresos_netos),
    base_calculable: Math.floor(base_calculable),
    pension_basica_minima: Math.floor(pension_basica_minima),
    pension_basica_orientativa: Math.floor(pension_basica_orientativa),
    pension_basica_maxima: Math.floor(pension_basica_maxima),
    pension_por_hijo: Math.floor(pension_por_hijo),
    gastos_extraordinarios_aporte: Math.floor(gastos_extraordinarios_aporte),
    total_pension_mensual: Math.floor(total_pension_mensual),
    pension_anual: Math.floor(pension_anual),
    rango_judicial: rango_judicial,
    recomendacion: recomendacion
  };
}
