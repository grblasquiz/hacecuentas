export interface Inputs {
  universidad: 'uc' | 'udd' | 'uai' | 'unab' | 'uss' | 'udec' | 'pucv' | 'duoc' | 'aiep' | 'inacap' | 'otra';
  carrera: 'ingenieria' | 'derecho' | 'medicina' | 'administracion' | 'ciencias_sociales' | 'humanidades' | 'educacion' | 'artes' | 'tecnica';
  arancel_anual_custom?: number;
  anos_carrera: number;
  reajuste_anual: number;
  financiamiento: 'directo' | 'cae' | 'cae_beca' | 'gratuidad' | 'credito_privado' | 'mixto';
  beca_porcentaje: number;
  cae_monto_anual: number;
  tasa_interes_cae: number;
  credito_privado_tasa: number;
}

export interface Outputs {
  arancel_referencial: number;
  costo_total_sin_ajuste: number;
  costo_total_con_ajuste: number;
  descuento_beca: number;
  costo_neto_antes_financiamiento: number;
  costo_alumno_cae: number;
  deuda_cae_final: number;
  cuota_mensual_pago_cae: number;
  costo_credito_privado: number;
  comparativa_financiamiento: string;
  anos_pago_deuda: number;
}

export function compute(i: Inputs): Outputs {
  // Aranceles referenciales 2026 por institución (CLP)
  // Fuente: Mineduc - Información de Aranceles 2026
  const arancelesBase: Record<string, number> = {
    'uc': 5800000,      // UC: $5.8M base
    'udd': 6000000,     // UDD: $6.0M base
    'uai': 5500000,     // UAI: $5.5M base
    'unab': 3800000,    // UNAB: $3.8M base
    'uss': 3500000,     // USS: $3.5M base
    'udec': 4000000,    // UDEC: $4.0M base
    'pucv': 4200000,    // PUCV: $4.2M base
    'duoc': 2800000,    // DuocUC: $2.8M base
    'aiep': 2500000,    // AIEP: $2.5M base
    'inacap': 2600000,  // INACAP: $2.6M base
    'otra': 4500000     // Promedio general
  };

  // Ajuste por carrera (multiplicador)
  const ajustesCarrera: Record<string, number> = {
    'ingenieria': 1.20,         // +20% (carreras STEM caras)
    'derecho': 1.18,            // +18%
    'medicina': 1.25,           // +25% (más cara)
    'administracion': 1.0,      // Base
    'ciencias_sociales': 0.92,  // -8%
    'humanidades': 0.88,        // -12%
    'educacion': 0.85,          // -15%
    'artes': 0.90,              // -10%
    'tecnica': 1.0              // Base
  };

  // Paso 1: Determinar arancel anual de base
  let arancel_anual = i.arancel_anual_custom 
    ? i.arancel_anual_custom 
    : (arancelesBase[i.universidad] || 4500000);

  // Aplicar ajuste por carrera
  arancel_anual = arancel_anual * (ajustesCarrera[i.carrera] || 1.0);
  const arancel_referencial = Math.round(arancel_anual);

  // Paso 2: Calcular costo total SIN reajuste (años * arancel base)
  const costo_total_sin_ajuste = Math.round(arancel_anual * i.anos_carrera);

  // Paso 3: Calcular costo total CON reajuste anual (suma geométrica)
  // Fórmula: Σ Arancel × (1 + tasa)^(año-1) para año 1..n
  let costo_total_con_ajuste = 0;
  const tasa_reajuste = i.reajuste_anual / 100;
  for (let año = 0; año < i.anos_carrera; año++) {
    const arancel_ajustado = arancel_anual * Math.pow(1 + tasa_reajuste, año);
    costo_total_con_ajuste += arancel_ajustado;
  }
  costo_total_con_ajuste = Math.round(costo_total_con_ajuste);

  // Paso 4: Aplicar beca de mérito
  const descuento_beca = Math.round(costo_total_con_ajuste * (i.beca_porcentaje / 100));
  const costo_neto_antes_financiamiento = costo_total_con_ajuste - descuento_beca;

  // Paso 5: Aplicar gratuidad si corresponde
  let costo_neto_post_gratuidad = costo_neto_antes_financiamiento;
  const LIMITE_GRATUIDAD_ANUAL = 2900000; // $2.9M 2026
  if (i.financiamiento === 'gratuidad') {
    const limite_total = LIMITE_GRATUIDAD_ANUAL * i.anos_carrera;
    costo_neto_post_gratuidad = Math.max(0, costo_neto_antes_financiamiento - limite_total);
  }

  // Paso 6: Financiamiento con CAE
  let costo_alumno_cae = 0;
  let deuda_cae_total = 0;
  let deuda_cae_final = 0;
  let cuota_mensual_pago_cae = 0;

  if (['cae', 'cae_beca', 'mixto'].includes(i.financiamiento)) {
    // CAE cubre hasta monto anual, anualmente
    const tasa_interes_cae_decimal = i.tasa_interes_cae / 100;
    
    // Deuda CAE generada (años de estudio)
    let deuda_anual_cae = 0;
    for (let año = 0; año < i.anos_carrera; año++) {
      const arancel_ajustado = arancel_anual * Math.pow(1 + tasa_reajuste, año);
      const arancel_post_beca = arancel_ajustado * (1 - i.beca_porcentaje / 100);
      const cae_este_año = Math.min(i.cae_monto_anual, arancel_post_beca);
      deuda_anual_cae += cae_este_año;
    }

    // Calcular deuda CAE con interés (acumulado durante carrera + pago posterior)
    // Modelo: cada año de CAE genera interés durante (n_años - año) restante + 10 años pago
    deuda_cae_total = deuda_anual_cae;
    let deuda_con_interes = 0;
    for (let año = 0; año < i.anos_carrera; año++) {
      const arancel_ajustado = arancel_anual * Math.pow(1 + tasa_reajuste, año);
      const arancel_post_beca = arancel_ajustado * (1 - i.beca_porcentaje / 100);
      const cae_este_año = Math.min(i.cae_monto_anual, arancel_post_beca);
      const años_interes = (i.anos_carrera - año - 1) + 10; // años pendientes + 10 de pago
      const deuda_capitalizada = cae_este_año * Math.pow(1 + tasa_interes_cae_decimal, años_interes);
      deuda_con_interes += deuda_capitalizada;
    }
    deuda_cae_final = Math.round(deuda_con_interes);

    // Calcular costo que paga el alumno (diferencia entre costo neto y CAE)
    let costo_alumno = 0;
    for (let año = 0; año < i.anos_carrera; año++) {
      const arancel_ajustado = arancel_anual * Math.pow(1 + tasa_reajuste, año);
      const arancel_post_beca = arancel_ajustado * (1 - i.beca_porcentaje / 100);
      const arancel_restante = arancel_post_beca - Math.min(i.cae_monto_anual, arancel_post_beca);
      costo_alumno += arancel_restante;
    }
    costo_alumno_cae = Math.round(costo_alumno);

    // Cuota mensual (sistema de amortización francesa, 10 años = 120 meses)
    const meses_pago = 120;
    const tasa_mensual = tasa_interes_cae_decimal / 12;
    if (tasa_mensual > 0) {
      cuota_mensual_pago_cae = Math.round(
        deuda_cae_final * 
        (tasa_mensual * Math.pow(1 + tasa_mensual, meses_pago)) /
        (Math.pow(1 + tasa_mensual, meses_pago) - 1)
      );
    } else {
      cuota_mensual_pago_cae = Math.round(deuda_cae_final / meses_pago);
    }
  }

  // Paso 7: Financiamiento con Crédito Privado
  let costo_credito_privado = 0;
  const tasa_privada_decimal = i.credito_privado_tasa / 100;
  if (i.financiamiento === 'credito_privado') {
    // Costo total = principal × [(1+r)^n - 1] / r × (1+r)
    // Aproximación: deuda crece con interés compuesto durante carrera
    let deuda_privada = 0;
    for (let año = 0; año < i.anos_carrera; año++) {
      const arancel_ajustado = arancel_anual * Math.pow(1 + tasa_reajuste, año);
      const arancel_post_beca = arancel_ajustado * (1 - i.beca_porcentaje / 100);
      const deuda_capitalizada = arancel_post_beca * Math.pow(1 + tasa_privada_decimal, i.anos_carrera - año);
      deuda_privada += deuda_capitalizada;
    }
    costo_credito_privado = Math.round(deuda_privada);
  }

  // Paso 8: Comparativa de financiamiento
  const comparativa_array: string[] = [];
  comparativa_array.push(`Pago Directo: $${costo_neto_antes_financiamiento.toLocaleString('es-CL')}`);
  if (['cae', 'cae_beca', 'mixto'].includes(i.financiamiento)) {
    comparativa_array.push(`CAE: Deuda Final $${deuda_cae_final.toLocaleString('es-CL')} (Cuota ~$${cuota_mensual_pago_cae.toLocaleString('es-CL')}/mes)`);
  }
  if (i.financiamiento === 'credito_privado') {
    comparativa_array.push(`Crédito Privado: Deuda Final $${costo_credito_privado.toLocaleString('es-CL')}`);
  }
  if (i.financiamiento === 'gratuidad') {
    const diferencia = costo_neto_antes_financiamiento - (LIMITE_GRATUIDAD_ANUAL * i.anos_carrera);
    comparativa_array.push(`Gratuidad ($${(LIMITE_GRATUIDAD_ANUAL * i.anos_carrera).toLocaleString('es-CL')}): Tú pagas $${Math.max(0, diferencia).toLocaleString('es-CL')}`);
  }
  const comparativa_financiamiento = comparativa_array.join(' | ');

  // Paso 9: Años de pago de deuda
  let anos_pago_deuda = 0;
  if (['cae', 'cae_beca', 'mixto'].includes(i.financiamiento)) {
    // CAE: plazo típico 10 años, pero puede extenderse a 20 años
    anos_pago_deuda = 10;
  } else if (i.financiamiento === 'credito_privado') {
    // Crédito privado: típicamente 12-15 años
    anos_pago_deuda = 12;
  }

  return {
    arancel_referencial,
    costo_total_sin_ajuste,
    costo_total_con_ajuste,
    descuento_beca,
    costo_neto_antes_financiamiento,
    costo_alumno_cae,
    deuda_cae_final,
    cuota_mensual_pago_cae,
    costo_credito_privado,
    comparativa_financiamiento,
    anos_pago_deuda
  };
}
