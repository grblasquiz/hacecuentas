export interface Inputs {
  salario_mensual: number;
  anos_aporte: number;
  tipo_fondo: string;
  aporte_voluntario_anual: number;
  objetivo_principal: string;
  edad_actual: number;
  inflacion_anual: number;
}

export interface Outputs {
  saldo_acumulado_fna: number;
  saldo_acumulado_privado: number;
  diferencia_saldo: number;
  rentabilidad_anual_fna: number;
  rentabilidad_anual_privado: number;
  credito_vivienda_fna_max: number;
  subsidio_vivienda_fna: number;
  cuota_mensual_fna: number;
  anos_falta_retiro: number;
  recomendacion: string;
  comparativa_completa: Record<string, any>;
}

export function compute(i: Inputs): Outputs {
  // Constantes Colombia 2026
  const UMV_2026 = 400000; // COP
  const APORTE_CESANTIA_PCT = 0.0833; // 8.33% obligatorio
  const TASA_FNA_ANUAL = 0.032; // 3.2% EA garantizada
  const TASA_BANCO_PRIVADO_BASE = 0.04; // 4% EA para crédito
  const PLAZO_CREDITO_ANOS = 15;
  const PLAZO_MESES = PLAZO_CREDITO_ANOS * 12; // 180 meses
  const MULTIPLO_CREDITO_FNA = 4; // Máximo 4× saldo
  const TOPE_CREDITO_VIVIENDA = UMV_2026 * 650; // ~$260M aprox
  const EDAD_RETIRO_MUJER = 62;
  const EDAD_RETIRO_HOMBRE = 65;
  
  // Datos fondos privados: [rentabilidad nominal %, comisión %]
  const FONDOS_PRIVADOS: Record<string, [number, number]> = {
    porvenir: [5.8, 0.50],
    proteccion: [5.5, 0.55],
    colfondos: [5.3, 0.60]
  };

  // Aporte anual cesantía
  const aporte_anual = i.salario_mensual * APORTE_CESANTIA_PCT * 12; // COP/año

  // Función capitalización compuesta
  function capitalizar(
    aporte_anual: number,
    tasa_anual: number,
    anos: number,
    aporte_voluntario_anual: number = 0
  ): number {
    let saldo = 0;
    for (let a = 0; a < anos; a++) {
      saldo = (saldo + aporte_anual + aporte_voluntario_anual) * (1 + tasa_anual);
    }
    return saldo;
  }

  // Cálculo FNA
  const saldo_fna = capitalizar(
    aporte_anual,
    TASA_FNA_ANUAL,
    i.anos_aporte,
    i.aporte_voluntario_anual
  );

  // Cálculo fondos privados según selección
  let saldo_privado = 0;
  let tasa_privada_neta = 0;
  let fondo_seleccionado = i.tipo_fondo;

  if (i.tipo_fondo === "comparar_todos") {
    // Promedio de fondos
    const rentabilidades_netas = Object.values(FONDOS_PRIVADOS).map(
      ([rent, comision]) => (rent - comision) / 100
    );
    tasa_privada_neta =
      rentabilidades_netas.reduce((a, b) => a + b, 0) /
      rentabilidades_netas.length;
  } else {
    const [rent_pct, comision_pct] = FONDOS_PRIVADOS[i.tipo_fondo] || [5.5, 0.55];
    tasa_privada_neta = (rent_pct - comision_pct) / 100;
  }

  saldo_privado = capitalizar(
    aporte_anual,
    tasa_privada_neta,
    i.anos_aporte,
    i.aporte_voluntario_anual
  );

  const diferencia = saldo_privado - saldo_fna;

  // Rentabilidad anual
  const rentabilidad_fna_pct = TASA_FNA_ANUAL * 100;
  const rentabilidad_privado_pct = tasa_privada_neta * 100;

  // Crédito vivienda FNA
  const credito_max_bruto = Math.min(
    saldo_fna * MULTIPLO_CREDITO_FNA,
    TOPE_CREDITO_VIVIENDA
  );

  // Subsidio según tramo salarial (aproximado)
  let factor_subsidio = 0.15; // Base 15%
  const salarios_minimos = i.salario_mensual / UMV_2026;
  if (salarios_minimos < 2) factor_subsidio = 0.45; // Máximo para muy bajos
  else if (salarios_minimos < 4) factor_subsidio = 0.3;
  else if (salarios_minimos < 6) factor_subsidio = 0.2;
  else factor_subsidio = 0.1;

  const subsidio_vivienda = Math.min(
    credito_max_bruto * factor_subsidio,
    credito_max_bruto * 0.45
  ); // Cap 45%
  const capital_neto_credito = credito_max_bruto - subsidio_vivienda;

  // Cuota mensual (amortización francesa 4% EA)
  const tasa_mensual = TASA_BANCO_PRIVADO_BASE / 12;
  const factor_pago = (tasa_mensual * Math.pow(1 + tasa_mensual, PLAZO_MESES)) /
    (Math.pow(1 + tasa_mensual, PLAZO_MESES) - 1);
  const cuota_mensual = capital_neto_credito * factor_pago;

  // Años a retiro legal
  const edad_retiro_legal = i.edad_actual < 45 ? EDAD_RETIRO_MUJER : EDAD_RETIRO_HOMBRE; // Aprox
  const anos_falta = Math.max(0, edad_retiro_legal - i.edad_actual);

  // Recomendación según objetivo
  let recomendacion = "";
  if (i.objetivo_principal === "vivienda") {
    recomendacion =
      `FNA ofrece crédito vivienda con subsidio $${Math.round(subsidio_vivienda / 1000000)}M y cuota mensual $${Math.round(cuota_mensual / 1000)}K. ` +
      `Fondo privado requiere banco tercero, tasa 8–12%, sin subsidio. **Recomendación: FNA.**`;
  } else if (i.objetivo_principal === "rentabilidad") {
    const ganancia_privado = diferencia > 0 ? "mayor" : "menor";
    recomendacion =
      `Fondo privado proyecta $${Math.round(diferencia / 1000000)}M ${ganancia_privado} rentabilidad. ` +
      `Rentabilidad privada neta ${rentabilidad_privado_pct.toFixed(2)}% vs FNA ${rentabilidad_fna_pct.toFixed(2)}%. ` +
      `Pero cero acceso vivienda subsidiada. **Trade-off: más dinero, menos beneficios.**`;
  } else if (i.objetivo_principal === "liquidez") {
    recomendacion =
      `Fondos privados permiten retiros parciales (con costos). FNA es menos flexible hasta edad legal. ` +
      `Si liquidez frecuente es crítica: fondo privado. Si puedes esperar: FNA ofrece mejor valor total (crédito vivienda).`;
  } else {
    recomendacion =
      `Equilibrio: FNA garantiza 3.2%, subsidia vivienda, retiro seguro. Privados dan +2% rentabilidad pero requieren banco tercero para vivienda. ` +
      `Considera: ¿prioridad es casa o máxima rentabilidad? Si casa: FNA. Si inversión pura: privado.`;
  }

  // Tabla comparativa
  const comparativa: Record<string, any> = {};
  comparativa["FNA"] = {
    rentabilidad_anual_pct: rentabilidad_fna_pct.toFixed(2),
    comision_pct: "0.00",
    saldo_20anos_cop: Math.round(saldo_fna),
    credito_vivienda_max: Math.round(credito_max_bruto),
    subsidio_est: Math.round(subsidio_vivienda),
    cuota_mensual: Math.round(cuota_mensual),
    tasa_credito_ea: "4.0%",
    liquidez: "Limitada (edad legal)"
  };

  Object.entries(FONDOS_PRIVADOS).forEach(([nombre, [rent, comision]]) => {
    const tasa_neta = (rent - comision) / 100;
    const saldo = capitalizar(
      aporte_anual,
      tasa_neta,
      i.anos_aporte,
      i.aporte_voluntario_anual
    );
    comparativa[nombre] = {
      rentabilidad_anual_pct: (rent - comision).toFixed(2),
      comision_pct: comision.toFixed(2),
      saldo_20anos_cop: Math.round(saldo),
      credito_vivienda_max: "Banco tercero (no FNA)",
      subsidio_est: "No aplica",
      cuota_mensual: "8–12% EA banco comercial",
      tasa_credito_ea: "8.0–12.0%",
      liquidez: "Flexible (retiros parciales)"
    };
  });

  return {
    saldo_acumulado_fna: Math.round(saldo_fna),
    saldo_acumulado_privado: Math.round(saldo_privado),
    diferencia_saldo: Math.round(diferencia),
    rentabilidad_anual_fna: parseFloat(rentabilidad_fna_pct.toFixed(2)),
    rentabilidad_anual_privado: parseFloat(rentabilidad_privado_pct.toFixed(2)),
    credito_vivienda_fna_max: Math.round(credito_max_bruto),
    subsidio_vivienda_fna: Math.round(subsidio_vivienda),
    cuota_mensual_fna: Math.round(cuota_mensual),
    anos_falta_retiro: anos_falta,
    recomendacion: recomendacion,
    comparativa_completa: comparativa
  };
}
