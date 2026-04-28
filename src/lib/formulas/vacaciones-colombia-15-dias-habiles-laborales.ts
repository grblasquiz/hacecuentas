export interface Inputs {
  salario_mensual: number;
  meses_trabajados: number;
  anos_servicio: number;
  dias_vacaciones_tomadas: number;
  dias_acumulados_anteriores: number;
}

export interface Outputs {
  dias_vacaciones_anuales: number;
  dias_vacaciones_proporcional: number;
  dias_vacaciones_disponibles: number;
  dias_vacaciones_pendientes: number;
  dias_acumulados_total: number;
  dias_acumulados_legales: number;
  pago_vacaciones_dias_tomados: number;
  pago_vacaciones_pendientes: number;
  pago_total_vacaciones: number;
  advertencia_limite: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes CST 2026 Colombia
  const DIAS_VACACIONES_POR_ANO = 15; // CST art. 186
  const LIMITE_ACUMULACION_DIAS = 30; // Máximo legal (2 años)
  const DIAS_MES = 30; // Para cálculo de valor diario
  const MESES_ANO = 12;

  // Validaciones básicas
  const salario = Math.max(0, i.salario_mensual);
  const meses = Math.max(0, Math.min(i.meses_trabajados, MESES_ANO));
  const anos = Math.max(0, i.anos_servicio);
  const tomados = Math.max(0, i.dias_vacaciones_tomadas);
  const acumulados_ant = Math.max(0, i.dias_acumulados_anteriores);

  // Cálculo de días anuales (años completos)
  const anos_completos = Math.floor(anos);
  const dias_vacaciones_anuales = anos_completos * DIAS_VACACIONES_POR_ANO;

  // Cálculo proporcional del año en curso
  const fraccion_ano = (meses / MESES_ANO);
  const dias_vacaciones_proporcional = Math.round(
    DIAS_VACACIONES_POR_ANO * fraccion_ano * 100
  ) / 100;

  // Total de días disponibles para disfrutar (antes de tomar)
  const dias_disponibles_brutos =
    dias_vacaciones_anuales + dias_vacaciones_proporcional + acumulados_ant;
  const dias_vacaciones_disponibles = Math.round(dias_disponibles_brutos * 100) / 100;

  // Días pendientes después de tomar vacaciones
  const dias_vacaciones_pendientes = Math.max(
    0,
    dias_vacaciones_disponibles - tomados
  );

  // Total acumulado (días disponibles que quedan + días tomados)
  const dias_acumulados_total_calc =
    dias_vacaciones_pendientes + tomados;
  const dias_acumulados_total = Math.round(dias_acumulados_total_calc * 100) / 100;

  // Días acumulados según límite legal (máx 30)
  const dias_acumulados_legales = Math.min(dias_acumulados_total, LIMITE_ACUMULACION_DIAS);

  // Cálculo del valor diario
  const valor_diario = salario / DIAS_MES;

  // Pago por días tomados (en este período)
  const pago_vacaciones_dias_tomados = Math.round(
    valor_diario * tomados * 100
  ) / 100;

  // Pago por días pendientes (acumulados)
  const pago_vacaciones_pendientes = Math.round(
    valor_diario * dias_vacaciones_pendientes * 100
  ) / 100;

  // Pago total de vacaciones
  const pago_total_vacaciones = Math.round(
    (pago_vacaciones_dias_tomados + pago_vacaciones_pendientes) * 100
  ) / 100;

  // Advertencia si excede límite de acumulación
  let advertencia_limite = "";
  if (dias_acumulados_total > LIMITE_ACUMULACION_DIAS) {
    const dias_exceso = Math.round(
      (dias_acumulados_total - LIMITE_ACUMULACION_DIAS) * 100
    ) / 100;
    const valor_exceso = Math.round(
      valor_diario * dias_exceso * 100
    ) / 100;
    advertencia_limite =
      `⚠️ EXCESO DE ACUMULACIÓN: Tiene ${dias_acumulados_total.toFixed(1)} días acumulados. ` +
      `Máximo legal: ${LIMITE_ACUMULACION_DIAS} días. Exceso: ${dias_exceso.toFixed(1)} días ` +
      `(valor: $${valor_exceso.toLocaleString("es-CO", { maximumFractionDigits: 0 })}). ` +
      `El empleador debe autorizar disfrute en el tercer año o pagar en efectivo.`;
  } else {
    advertencia_limite =
      `✓ Acumulación dentro de límite: ${dias_acumulados_total.toFixed(1)} / ${LIMITE_ACUMULACION_DIAS} días permitidos.`;
  }

  return {
    dias_vacaciones_anuales: Math.round(dias_vacaciones_anuales * 100) / 100,
    dias_vacaciones_proporcional,
    dias_vacaciones_disponibles,
    dias_vacaciones_pendientes,
    dias_acumulados_total,
    dias_acumulados_legales: Math.round(dias_acumulados_legales * 100) / 100,
    pago_vacaciones_dias_tomados,
    pago_vacaciones_pendientes,
    pago_total_vacaciones,
    advertencia_limite
  };
}
