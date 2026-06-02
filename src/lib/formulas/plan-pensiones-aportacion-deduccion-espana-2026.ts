export interface Inputs {
  aportacion_anual: number;           // € aportación anual individual
  aportacion_empresa: number;         // € aportación anual de la empresa
  rendimientos_netos_trabajo: number; // € rendimientos netos del trabajo
  tipo_marginal: number;              // % tipo marginal IRPF (19,24,30,37,45,47)
  edad_actual: number;                // años edad actual
  capital_actual_plan: number;        // € capital ya acumulado
  rentabilidad_anual: number;         // % rentabilidad anual estimada (2,4,6,8)
}

export interface Outputs {
  limite_deducible: number;                  // € límite máximo deducible
  aportacion_deducible: number;              // € importe efectivamente deducible
  deduccion_irpf: number;                    // € ahorro fiscal este año
  coste_neto_aportacion: number;             // € coste neto real de la aportación
  porcentaje_ahorro: number;                 // % ahorro fiscal sobre aportación total
  anos_hasta_jubilacion: number;             // años enteros hasta los 67
  capital_proyectado: number;                // € capital estimado a la jubilación
  total_aportado: number;                    // € total aportado (individual + empresa) hasta jubilación
  ganancia_por_rentabilidad: number;         // € ganancia por interés compuesto
  ahorro_fiscal_total_acumulado: number;     // € ahorro fiscal acumulado hasta jubilación
  aviso: string;                             // mensaje de alertas
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes 2026 (Fuente: AEAT / Ley 35/2006 art. 51 modificado por Ley 12/2022) ---
  const LIMITE_INDIVIDUAL_MAX = 1500;   // € límite anual aportación individual deducible
  const LIMITE_EMPRESA_MAX = 8500;      // € límite anual aportación empresa deducible
  const LIMITE_CONJUNTO_MAX = 10000;    // € límite conjunto individual + empresa
  const LIMITE_PORCENTUAL = 0.30;       // 30 % de rendimientos netos del trabajo
  const EDAD_JUBILACION = 67;           // edad de jubilación ordinaria 2027+ (Fuente: Seguridad Social)

  // --- Saneamiento de inputs ---
  const aportacion_ind = Math.max(0, i.aportacion_anual || 0);
  const aportacion_emp = Math.max(0, Math.min(i.aportacion_empresa || 0, LIMITE_EMPRESA_MAX));
  const rendimientos = Math.max(0, i.rendimientos_netos_trabajo || 0);
  const marginal = Math.max(0, Math.min(i.tipo_marginal || 37, 100)) / 100;
  const edad = Math.max(18, Math.min(i.edad_actual || 40, 66));
  const capital_inicial = Math.max(0, i.capital_actual_plan || 0);
  const rentabilidad = Math.max(0, Math.min(i.rentabilidad_anual || 4, 100)) / 100;

  // --- Cálculo del límite deducible ---
  // Límite monetario: aportación individual (máx 1.500 €) + aportación empresa (máx 8.500 €)
  // El total conjunto no puede superar 10.000 €
  const limite_monetario_ind = Math.min(aportacion_ind, LIMITE_INDIVIDUAL_MAX);
  const limite_monetario_total = Math.min(
    limite_monetario_ind + Math.min(aportacion_emp, LIMITE_EMPRESA_MAX),
    LIMITE_CONJUNTO_MAX
  );

  // Límite porcentual: 30 % de los rendimientos netos del trabajo
  const limite_porcentual_euros = rendimientos * LIMITE_PORCENTUAL;

  // Límite deducible final: el menor de los dos
  const limite_deducible = Math.min(limite_monetario_total, limite_porcentual_euros);

  // Aportación total (individual + empresa)
  const aportacion_total = aportacion_ind + aportacion_emp;

  // Importe realmente deducible (no puede superar el límite ni la aportación total)
  const aportacion_deducible = Math.min(aportacion_total, limite_deducible);

  // --- Ahorro fiscal anual ---
  // Reducción de base imponible × tipo marginal = ahorro en cuota IRPF
  const deduccion_irpf = aportacion_deducible * marginal;

  // Coste neto real de la aportación individual (lo que le cuesta al partícipe descontado el ahorro fiscal)
  // Solo sobre la parte individual, ya que la empresa aporta aparte
  const aportacion_ind_deducible = Math.min(aportacion_ind, Math.min(LIMITE_INDIVIDUAL_MAX, limite_deducible));
  const ahorro_fiscal_ind = aportacion_ind_deducible * marginal;
  const coste_neto_aportacion = Math.max(0, aportacion_ind - ahorro_fiscal_ind);

  // Porcentaje de ahorro fiscal sobre la aportación individual
  const porcentaje_ahorro = aportacion_ind > 0 ? (ahorro_fiscal_ind / aportacion_ind) * 100 : 0;

  // --- Proyección del capital a la jubilación ---
  const anos_hasta_jubilacion = Math.max(0, EDAD_JUBILACION - edad);

  let capital_proyectado = 0;
  let total_aportado = 0;

  if (anos_hasta_jubilacion === 0) {
    // Ya tiene 67 años o más
    capital_proyectado = capital_inicial;
    total_aportado = 0;
  } else if (rentabilidad === 0) {
    // Sin rentabilidad: suma simple
    total_aportado = aportacion_total * anos_hasta_jubilacion;
    capital_proyectado = capital_inicial + total_aportado;
  } else {
    // Valor futuro con aportaciones periódicas (annuity) + capital inicial
    // VF = C0 × (1+r)^n + A × [(1+r)^n - 1] / r
    // Fuente: fórmula estándar de matemática financiera
    const factor = Math.pow(1 + rentabilidad, anos_hasta_jubilacion);
    const vf_capital_inicial = capital_inicial * factor;
    const vf_aportaciones = aportacion_total * ((factor - 1) / rentabilidad);
    capital_proyectado = vf_capital_inicial + vf_aportaciones;
    total_aportado = aportacion_total * anos_hasta_jubilacion;
  }

  const ganancia_por_rentabilidad = Math.max(0, capital_proyectado - capital_inicial - total_aportado);

  // Ahorro fiscal total acumulado durante todos los años de aportación
  const ahorro_fiscal_total_acumulado = deduccion_irpf * anos_hasta_jubilacion;

  // --- Avisos ---
  const avisos: string[] = [];

  if (aportacion_ind > LIMITE_INDIVIDUAL_MAX) {
    avisos.push(
      `Tu aportación individual (${aportacion_ind.toLocaleString('es-ES')} €) supera el límite deducible de 1.500 €/año. El exceso de ${(aportacion_ind - LIMITE_INDIVIDUAL_MAX).toLocaleString('es-ES')} € no generará ahorro fiscal.`
    );
  }

  if (aportacion_emp > LIMITE_EMPRESA_MAX) {
    avisos.push(
      `La aportación de la empresa (${aportacion_emp.toLocaleString('es-ES')} €) supera el límite de 8.500 €/año para planes de empleo.`
    );
  }

  if (limite_porcentual_euros < limite_monetario_total && rendimientos > 0) {
    avisos.push(
      `El límite del 30 % de tus rendimientos netos (${limite_porcentual_euros.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €) es inferior al límite monetario. Tu deducción máxima queda reducida a ${limite_deducible.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €.`
    );
  }

  if (rendimientos === 0 && aportacion_total > 0) {
    avisos.push(
      'Introduce tus rendimientos netos del trabajo para calcular correctamente el límite del 30 %. Sin ese dato, el límite porcentual es 0 €.'
    );
  }

  if (anos_hasta_jubilacion === 0) {
    avisos.push('Has alcanzado o superado la edad de jubilación ordinaria (67 años). No se realiza proyección futura.');
  }

  const aviso = avisos.length > 0 ? avisos.join(' | ') : 'Cálculo correcto dentro de los límites legales 2026.';

  // --- Insight + gráfico ---
  const eur = (n: number) => Math.round(n).toLocaleString('es-ES') + ' €';
  const pctAhorroR = Math.round(porcentaje_ahorro * 100) / 100;
  const costeNetoR = Math.round(coste_neto_aportacion * 100) / 100;

  const hayProyeccion = anos_hasta_jubilacion > 0 && capital_proyectado > 0;
  const exoCede = aportacion_ind > LIMITE_INDIVIDUAL_MAX
    || aportacion_emp > LIMITE_EMPRESA_MAX
    || (limite_porcentual_euros < limite_monetario_total && rendimientos > 0);

  const _insight = {
    title: exoCede ? 'Ojo con los límites de deducción' : 'Tu ahorro fiscal este año',
    text: deduccion_irpf > 0
      ? `Aportando lo deducible este año te ahorrás **${eur(deduccion_irpf)}** en el IRPF: cada euro que metés en el plan te cuesta de verdad solo **${eur(costeNetoR > 0 ? costeNetoR : 0)}** netos (recuperás el **${pctAhorroR.toFixed(0)}%** vía Hacienda).${hayProyeccion ? ` A ${anos_hasta_jubilacion} años vista proyectás **${eur(capital_proyectado)}**, de los cuales **${eur(ganancia_por_rentabilidad)}** son puro interés compuesto.` : ''}`
      : `Con los datos cargados no se genera deducción este año${exoCede ? ': revisá los límites (1.500 € individual, 8.500 € empresa, 30% de tus rendimientos netos).' : '.'}`,
    tone: exoCede ? 'warn' : (deduccion_irpf > 0 ? 'good' : 'neutral'),
    icon: exoCede ? '⚠️' : '🏦',
  };

  const _chart = hayProyeccion ? {
    type: 'doughnut',
    slices: [
      { label: 'Capital actual', value: Math.round(capital_inicial) },
      { label: 'Aportaciones futuras', value: Math.round(total_aportado) },
      { label: 'Ganancia por rentabilidad', value: Math.round(ganancia_por_rentabilidad) },
    ],
    prefix: '',
    suffix: ' €',
    centerValue: eur(capital_proyectado),
    centerLabel: 'A la jubilación',
    ariaLabel: `Capital proyectado a la jubilación de ${eur(capital_proyectado)}: ${eur(capital_inicial)} de capital actual, ${eur(total_aportado)} de aportaciones futuras y ${eur(ganancia_por_rentabilidad)} de ganancia por rentabilidad.`,
  } : undefined;

  return {
    limite_deducible: Math.round(limite_deducible * 100) / 100,
    aportacion_deducible: Math.round(aportacion_deducible * 100) / 100,
    deduccion_irpf: Math.round(deduccion_irpf * 100) / 100,
    coste_neto_aportacion: Math.round(coste_neto_aportacion * 100) / 100,
    porcentaje_ahorro: Math.round(porcentaje_ahorro * 100) / 100,
    anos_hasta_jubilacion,
    capital_proyectado: Math.round(capital_proyectado * 100) / 100,
    total_aportado: Math.round(total_aportado * 100) / 100,
    ganancia_por_rentabilidad: Math.round(ganancia_por_rentabilidad * 100) / 100,
    ahorro_fiscal_total_acumulado: Math.round(ahorro_fiscal_total_acumulado * 100) / 100,
    aviso,
    _insight,
    ...(_chart ? { _chart } : {})
  };
}
