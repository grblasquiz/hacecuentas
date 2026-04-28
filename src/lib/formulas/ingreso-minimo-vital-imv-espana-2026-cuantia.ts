// Calculadora IMV 2026 - Ingreso Mínimo Vital España
// Fuente: Ley 19/2021 y Seguridad Social. Cuantías 2026 estimadas sobre IPREM 12 pagas.

export interface Inputs {
  adultos: number;
  menores: number;
  monoparental: boolean;
  ingresos_anuales: number;
  patrimonio: number;
}

export interface Outputs {
  cumple_requisitos: string;
  renta_garantizada_anual: number;
  cuantia_mensual_imv: number;
  complemento_infancia_mensual: number;
  total_mensual: number;
  total_anual: number;
  alerta_patrimonio: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes 2026 ---
  // IPREM anual con 12 pagas (base renta de referencia IMV 2026)
  // Fuente: SEPE / BOE - estimado sobre actualización IPC
  const RENTA_REFERENCIA_ANUAL = 6050.12; // €/año (100% para 1 adulto)

  // Porcentajes de incremento por composición de unidad de convivencia
  // Fuente: Art. 10 Ley 19/2021 y Real Decreto de actualización
  const PCT_ADULTO_EXTRA = 0.30; // +30% por cada adulto adicional (hasta un máximo)
  const PCT_PRIMER_MENOR = 0.28; // +28% por el primer menor
  const PCT_MENORES_ADICIONALES = 0.11; // +11% por cada menor adicional (2.º en adelante)
  const PCT_MONOPARENTAL = 0.22; // +22% adicional sobre renta de referencia base

  // Complemento de ayuda a la infancia (valor prudente medio, sin discriminar edad)
  // Fuente: Disposición adicional Ley 19/2021; en 2026: 80€-115€ según edad
  const COMPLEMENTO_INFANCIA_MENSUAL_POR_MENOR = 80; // €/mes por menor (valor conservador)

  // Límites patrimoniales 2026
  // Fuente: Art. 8 Ley 19/2021
  const LIMITE_PATRIMONIO_BASE = 16614; // € para 1 persona
  const LIMITE_PATRIMONIO_EXTRA_MIEMBRO = 3000; // € por cada miembro adicional

  // --- Normalización de inputs ---
  const adultos = Math.max(1, Math.floor(i.adultos ?? 1));
  const menores = Math.max(0, Math.floor(i.menores ?? 0));
  const monoparental = menores > 0 && (i.monoparental ?? false);
  const ingresos_anuales = Math.max(0, i.ingresos_anuales ?? 0);
  const patrimonio = Math.max(0, i.patrimonio ?? 0);

  // --- Cálculo del límite patrimonial para esta unidad ---
  const total_miembros = adultos + menores;
  const limite_patrimonio =
    LIMITE_PATRIMONIO_BASE +
    Math.max(0, total_miembros - 1) * LIMITE_PATRIMONIO_EXTRA_MIEMBRO;

  // --- Aviso de patrimonio ---
  let alerta_patrimonio: string;
  const supera_patrimonio = patrimonio > limite_patrimonio;
  if (supera_patrimonio) {
    alerta_patrimonio = `Tu patrimonio declarado (${patrimonio.toLocaleString('es-ES')}€) supera el límite para esta unidad de convivencia (${limite_patrimonio.toLocaleString('es-ES')}€). En principio no tendrías derecho al IMV por este motivo.`;
  } else {
    alerta_patrimonio = `Patrimonio dentro del límite permitido (${limite_patrimonio.toLocaleString('es-ES')}€).`;
  }

  // --- Cálculo de la renta garantizada anual ---
  // Base: 100% para el primer adulto
  let renta_garantizada_anual = RENTA_REFERENCIA_ANUAL;

  // Incremento por adultos adicionales: +30% por cada adulto extra (2.º, 3.º...)
  // La ley limita el máximo a 220% para 4+ adultos; se aplica progresivamente
  // Simplificación: +30% por cada adulto adicional hasta un tope implícito
  if (adultos >= 2) {
    // 2.º adulto: +30%, 3.º: +30%, 4.º: +30%... tope efectivo: 220% (4 adultos)
    const adultos_extra = Math.min(adultos - 1, 3); // máximo 3 incrementos (4 adultos = 190%+)
    // Realmente la ley usa escala: 130%, 160%, 190% para 2, 3, 4+ adultos
    const escala_adultos: Record<number, number> = {
      1: 1.00,
      2: 1.30,
      3: 1.60,
      4: 1.90
    };
    const pct_adultos = escala_adultos[Math.min(adultos, 4)] ?? 1.90;
    renta_garantizada_anual = RENTA_REFERENCIA_ANUAL * pct_adultos;
  }

  // Incremento por menores
  if (menores >= 1) {
    renta_garantizada_anual += RENTA_REFERENCIA_ANUAL * PCT_PRIMER_MENOR;
  }
  if (menores >= 2) {
    renta_garantizada_anual +=
      RENTA_REFERENCIA_ANUAL * PCT_MENORES_ADICIONALES * (menores - 1);
  }

  // Incremento por monoparentalidad: +22% sobre renta de referencia base
  if (monoparental) {
    renta_garantizada_anual += RENTA_REFERENCIA_ANUAL * PCT_MONOPARENTAL;
  }

  // Redondeo a 2 decimales
  renta_garantizada_anual = Math.round(renta_garantizada_anual * 100) / 100;

  // --- Cuantía mensual del IMV ---
  // IMV = máx(0, renta_garantizada_mensual - ingresos_mensuales)
  const renta_garantizada_mensual = renta_garantizada_anual / 12;
  const ingresos_mensuales = ingresos_anuales / 12;
  const cuantia_mensual_imv = Math.max(
    0,
    Math.round((renta_garantizada_mensual - ingresos_mensuales) * 100) / 100
  );

  // --- Complemento de ayuda a la infancia ---
  // Se abona por cada menor de 18 años, independientemente de la cuantía del IMV
  // Fuente: Disposición adicional Ley 19/2021
  const complemento_infancia_mensual = menores * COMPLEMENTO_INFANCIA_MENSUAL_POR_MENOR;

  // --- Total mensual y anual ---
  const total_mensual =
    Math.round((cuantia_mensual_imv + complemento_infancia_mensual) * 100) / 100;
  const total_anual = Math.round(total_mensual * 12 * 100) / 100;

  // --- Evaluación de requisitos ---
  let cumple_requisitos: string;

  if (supera_patrimonio) {
    cumple_requisitos =
      '❌ No cumples el requisito patrimonial. Tu patrimonio supera el límite establecido para tu unidad de convivencia.';
  } else if (ingresos_anuales >= renta_garantizada_anual) {
    cumple_requisitos =
      '⚠️ Tus ingresos anuales superan la renta garantizada para tu unidad de convivencia. No tendrías derecho a la prestación del IMV, aunque podrías tener derecho al complemento de ayuda a la infancia si tienes menores a cargo.';
  } else if (cuantia_mensual_imv > 0) {
    cumple_requisitos =
      `✅ En principio cumples los requisitos económicos y patrimoniales básicos. La cuantía estimada es de ${cuantia_mensual_imv.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€/mes. Recuerda que el INSS verificará todos los datos antes de resolver.`;
  } else {
    cumple_requisitos =
      '⚠️ Con los datos introducidos la cuantía estimada es de 0€. Revisa los ingresos y composición de la unidad.';
  }

  return {
    cumple_requisitos,
    renta_garantizada_anual,
    cuantia_mensual_imv,
    complemento_infancia_mensual,
    total_mensual,
    total_anual,
    alerta_patrimonio
  };
}
