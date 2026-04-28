export interface Inputs {
  saldo_deuda_1: number;
  cuota_deuda_1: number;
  tin_deuda_1: number;
  saldo_deuda_2: number;
  cuota_deuda_2: number;
  tin_deuda_2: number;
  saldo_deuda_3: number;
  cuota_deuda_3: number;
  tin_deuda_3: number;
  nuevo_tin: number;
  nuevo_plazo_anios: number;
  gastos_formalizacion: number;
  con_garantia_hipotecaria: string;
}

export interface Outputs {
  saldo_total: number;
  cuota_actual_total: number;
  cuota_nueva: number;
  ahorro_mensual: number;
  porcentaje_ahorro_cuota: number;
  intereses_actuales_restantes: number;
  intereses_nuevo_prestamo: number;
  sobrecoste_intereses: number;
  coste_total_reunificado: number;
  tin_medio_ponderado_actual: number;
  nivel_riesgo_aval: string;
  meses_recuperacion_gastos: number;
  recomendacion: string;
}

/**
 * Estima el número de cuotas restantes de una deuda dada su cuota mensual, saldo y TIN.
 * Fórmula inversa del sistema francés: n = -ln(1 - S*r/C) / ln(1+r)
 * Si la cuota no cubre los intereses mensuales, devuelve un plazo estimado de 60 meses.
 */
function plazoRestante(saldo: number, cuota: number, tinAnual: number): number {
  if (saldo <= 0 || cuota <= 0) return 0;
  const r = tinAnual / 100 / 12; // tipo mensual
  if (r <= 0) {
    // Sin intereses: plazo = saldo / cuota
    return Math.ceil(saldo / cuota);
  }
  const interesesMensuales = saldo * r;
  if (cuota <= interesesMensuales) {
    // La cuota no amortiza capital: plazo indeterminado, usamos 60 meses como estimación conservadora
    return 60;
  }
  const n = -Math.log(1 - (saldo * r) / cuota) / Math.log(1 + r);
  return Math.ceil(n);
}

/**
 * Calcula los intereses totales restantes de una deuda usando amortización francesa.
 * Intereses = cuota * n - saldo  (donde n = plazo restante estimado)
 */
function interesesRestantes(saldo: number, cuota: number, tinAnual: number): number {
  if (saldo <= 0) return 0;
  const n = plazoRestante(saldo, cuota, tinAnual);
  const totalPagado = cuota * n;
  return Math.max(0, totalPagado - saldo);
}

/**
 * Calcula la cuota mensual según el sistema de amortización francés (cuota constante).
 * Fuente: Ley 16/2011 de contratos de crédito al consumo (BOE-A-2011-10970)
 * C = S * r / (1 - (1+r)^(-n))
 */
function cuotaFrancesa(saldo: number, tinAnual: number, plazoMeses: number): number {
  if (saldo <= 0 || plazoMeses <= 0) return 0;
  const r = tinAnual / 100 / 12;
  if (r <= 0) {
    return saldo / plazoMeses;
  }
  const cuota = saldo * r / (1 - Math.pow(1 + r, -plazoMeses));
  return cuota;
}

export function compute(i: Inputs): Outputs {
  // --- Saneamiento de entradas ---
  const s1 = Math.max(0, i.saldo_deuda_1 || 0);
  const c1 = Math.max(0, i.cuota_deuda_1 || 0);
  const t1 = Math.max(0, i.tin_deuda_1 || 0);

  const s2 = Math.max(0, i.saldo_deuda_2 || 0);
  const c2 = Math.max(0, i.cuota_deuda_2 || 0);
  const t2 = Math.max(0, i.tin_deuda_2 || 0);

  const s3 = Math.max(0, i.saldo_deuda_3 || 0);
  const c3 = Math.max(0, i.cuota_deuda_3 || 0);
  const t3 = Math.max(0, i.tin_deuda_3 || 0);

  const nuevoTin = Math.max(0, i.nuevo_tin || 0);
  const nuevoPlazoAnios = Math.max(1, Math.min(30, i.nuevo_plazo_anios || 10));
  const gastos = Math.max(0, i.gastos_formalizacion || 0);
  const conHipoteca = i.con_garantia_hipotecaria === 'si';

  // --- Saldo total ---
  const saldo_total = s1 + s2 + s3;

  // --- Suma cuotas actuales ---
  const cuota_actual_total = c1 + c2 + c3;

  // --- Nueva cuota unificada (sistema francés) ---
  const plazoMeses = nuevoPlazoAnios * 12;
  const cuota_nueva = cuotaFrancesa(saldo_total, nuevoTin, plazoMeses);

  // --- Ahorro mensual ---
  const ahorro_mensual = Math.max(0, cuota_actual_total - cuota_nueva);
  const porcentaje_ahorro_cuota =
    cuota_actual_total > 0 ? (ahorro_mensual / cuota_actual_total) * 100 : 0;

  // --- Intereses restantes de las deudas actuales (estimado) ---
  const int1 = interesesRestantes(s1, c1, t1);
  const int2 = interesesRestantes(s2, c2, t2);
  const int3 = interesesRestantes(s3, c3, t3);
  const intereses_actuales_restantes = int1 + int2 + int3;

  // --- Intereses totales del préstamo reunificado ---
  const intereses_nuevo_prestamo = Math.max(0, cuota_nueva * plazoMeses - saldo_total);

  // --- Sobrecoste neto en intereses ---
  const sobrecoste_intereses = intereses_nuevo_prestamo - intereses_actuales_restantes;

  // --- Coste total del préstamo reunificado (intereses + gastos) ---
  const coste_total_reunificado = intereses_nuevo_prestamo + gastos;

  // --- TIN medio ponderado actual ---
  let tin_medio_ponderado_actual = 0;
  if (saldo_total > 0) {
    tin_medio_ponderado_actual =
      (s1 * t1 + s2 * t2 + s3 * t3) / saldo_total;
  }

  // --- Nivel de riesgo por aval hipotecario ---
  // Fuente: Ley 5/2019 de crédito inmobiliario y Código de Buenas Prácticas BdE
  let nivel_riesgo_aval: string;
  if (!conHipoteca) {
    nivel_riesgo_aval =
      'Bajo — sin garantía hipotecaria. El impago puede derivar en embargo de bienes, pero no en ejecución hipotecaria directa sobre la vivienda.';
  } else {
    nivel_riesgo_aval =
      'ALTO — con garantía hipotecaria (segunda hipoteca). El impago puede derivar en la ejecución y pérdida de la vivienda. Revisa la FEIN con 10 días de antelación antes de firmar (Ley 5/2019).';
  }

  // --- Meses para recuperar los gastos de formalización ---
  let meses_recuperacion_gastos = 0;
  if (ahorro_mensual > 0 && gastos > 0) {
    meses_recuperacion_gastos = Math.ceil(gastos / ahorro_mensual);
  } else if (gastos <= 0) {
    meses_recuperacion_gastos = 0;
  } else {
    // Sin ahorro mensual, los gastos nunca se recuperan
    meses_recuperacion_gastos = 9999;
  }

  // --- Valoración orientativa ---
  let recomendacion: string;
  const tinMejora = nuevoTin < tin_medio_ponderado_actual;
  const sobrecosteRelativo =
    intereses_actuales_restantes > 0
      ? sobrecoste_intereses / intereses_actuales_restantes
      : 0;

  if (saldo_total <= 0) {
    recomendacion = 'Introduce al menos una deuda con saldo pendiente para obtener una valoración.';
  } else if (!tinMejora && sobrecoste_intereses > 0) {
    recomendacion =
      'Desfavorable: el nuevo TIN es superior a tu media ponderada actual y pagarás más intereses en total. Negocia un TIN más bajo o amortiza las deudas de mayor coste por separado.';
  } else if (tinMejora && sobrecosteRelativo > 1.5) {
    recomendacion =
      'Cuota reducida, pero el sobrecoste en intereses supera el 150% de lo que pagarías sin reunificar. Considera reducir el plazo del nuevo préstamo para limitar el coste total.';
  } else if (tinMejora && sobrecosteRelativo > 0.5) {
    recomendacion =
      'Aceptable si necesitas alivio de liquidez a corto plazo: la cuota baja, pero el coste total en intereses aumenta de forma significativa. Amortiza anticipadamente en cuanto puedas.';
  } else if (tinMejora && sobrecoste_intereses <= 0) {
    recomendacion =
      'Favorable: el nuevo TIN es inferior a tu media ponderada y no incrementas el coste total en intereses. Verifica que los gastos de formalización no anulen el ahorro.';
  } else {
    recomendacion =
      'La operación puede tener sentido según tus circunstancias. Compara el TAE (no solo el TIN) y consulta al menos dos entidades financieras antes de firmar.';
  }

  return {
    saldo_total: Math.round(saldo_total * 100) / 100,
    cuota_actual_total: Math.round(cuota_actual_total * 100) / 100,
    cuota_nueva: Math.round(cuota_nueva * 100) / 100,
    ahorro_mensual: Math.round(ahorro_mensual * 100) / 100,
    porcentaje_ahorro_cuota: Math.round(porcentaje_ahorro_cuota * 10) / 10,
    intereses_actuales_restantes: Math.round(intereses_actuales_restantes * 100) / 100,
    intereses_nuevo_prestamo: Math.round(intereses_nuevo_prestamo * 100) / 100,
    sobrecoste_intereses: Math.round(sobrecoste_intereses * 100) / 100,
    coste_total_reunificado: Math.round(coste_total_reunificado * 100) / 100,
    tin_medio_ponderado_actual: Math.round(tin_medio_ponderado_actual * 100) / 100,
    nivel_riesgo_aval,
    meses_recuperacion_gastos,
    recomendacion,
  };
}
