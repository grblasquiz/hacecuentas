export interface Inputs {
  precio_cobre_usd_libra: number;
  tipo_cambio_usd_clp: number;
  produccion_cobre_ton: number;
  tasa_royalty_promedio: number;
  margen_operacional_codelco: number;
  tasa_impuesto_corporativo: number;
  otras_mineras_aporte?: number;
}

export interface Outputs {
  ingreso_royalty_usd: number;
  ingreso_irpf_codelco_usd: number;
  total_ingresos_codelco_usd: number;
  total_ingresos_mineria_clp: number;
  sensibilidad_precio_usd: number;
  sensibilidad_precio_clp: number;
  porcentaje_presupuesto_fiscal: number;
  fondo_estabilizacion_aporte: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes y validaciones
  const LIBRAS_POR_TONELADA = 2204.62; // Conversión métrica estándar
  const PORCENTAJE_INGRESOS_FISCAL_BASE = 12; // Cobre representa ~12% ingresos fiscales Chile
  const FACTOR_FONDO_ESTABILIZACION = 0.15; // 15% ingresos cobre van a fondo si precio está arriba equilibrio
  const PRECIO_EQUILIBRIO_FISCAL = 3.05; // USD/lb, precio balance presupuesto fiscal (SII 2026)

  // Inputs con defaults sensatos
  const precioCobreUsdLibra = Math.max(2.0, Math.min(5.5, i.precio_cobre_usd_libra || 3.5));
  const tipoCambioUsdClp = Math.max(750, Math.min(1100, i.tipo_cambio_usd_clp || 900));
  const produccionCobreTon = Math.max(1000000, Math.min(2000000, i.produccion_cobre_ton || 1650000));
  const tasaRoyaltyPorcentaje = Math.max(5, Math.min(14, i.tasa_royalty_promedio || 9.5));
  const margenOperacionalPorcentaje = Math.max(10, Math.min(40, i.margen_operacional_codelco || 25));
  const tasaIrpfPorcentaje = Math.max(25, Math.min(35, i.tasa_impuesto_corporativo || 27));
  const otrasMinendasAportePorcentaje = Math.max(0, Math.min(60, i.otras_mineras_aporte || 35));

  // Paso 1: Calcular libras anuales totales
  const librasAnuales = produccionCobreTon * LIBRAS_POR_TONELADA; // 1.65M × 2204.62

  // Paso 2: Ingresos brutos en USD (sin descontar costos)
  const ingresosBrutosUsd = librasAnuales * precioCobreUsdLibra; // 3.637B × 3.5

  // Paso 3: Ingreso por Royalty Minero (5–14% según ley 2023, tasas progresivas simplificadas a promedio)
  const ingresoRoyaltyUsd = ingresosBrutosUsd * (tasaRoyaltyPorcentaje / 100);

  // Paso 4: Utilidades Codelco antes impuesto (margen operacional)
  const utilidadesAntesIrpfUsd = ingresosBrutosUsd * (margenOperacionalPorcentaje / 100);

  // Paso 5: IRPF sobre utilidades (tasa corporativa 27% 2026)
  const ingresoIrpfCodelcoUsd = utilidadesAntesIrpfUsd * (tasaIrpfPorcentaje / 100);

  // Paso 6: Total ingresos fiscales Codelco en USD
  const totalIngresosCodelcoUsd = ingresoRoyaltyUsd + ingresoIrpfCodelcoUsd;

  // Paso 7: Ingresos totales minería (Codelco + privada) en CLP
  const factorTotalMineria = 1 + (otrasMinendasAportePorcentaje / 100);
  const totalIngresosMineriaClp = totalIngresosCodelcoUsd * factorTotalMineria * tipoCambioUsdClp;

  // Paso 8: Sensibilidad (elasticidad de ingresos respecto a precio cobre)
  // ∂Ingresos/∂Precio = Libras × (tasaRoyalty + margenOp × tasaIrpf)
  const sensibilidadBaseUsd = librasAnuales * (
    (tasaRoyaltyPorcentaje / 100) + 
    ((margenOperacionalPorcentaje / 100) * (tasaIrpfPorcentaje / 100))
  );
  const sensibilidadPrecioUsd = sensibilidadBaseUsd;
  const sensibilidadPrecioClp = sensibilidadBaseUsd * tipoCambioUsdClp;

  // Paso 9: Porcentaje estimado de presupuesto fiscal
  // Base: cobre ~12% de ingresos fiscales totales promedio. Ajuste según precio relativo a equilibrio.
  let porcentajePresupuestoFiscal = PORCENTAJE_INGRESOS_FISCAL_BASE;
  if (precioCobreUsdLibra > PRECIO_EQUILIBRIO_FISCAL) {
    // Por cada 0.1 USD arriba equilibrio, +0.1% contribución relativa (max ~14%)
    const primaAlcista = (precioCobreUsdLibra - PRECIO_EQUILIBRIO_FISCAL) / 0.1;
    porcentajePresupuestoFiscal = Math.min(14, PORCENTAJE_INGRESOS_FISCAL_BASE + primaAlcista * 0.1);
  } else if (precioCobreUsdLibra < PRECIO_EQUILIBRIO_FISCAL) {
    // Por cada 0.1 USD bajo equilibrio, -0.15% (mínimo ~8%)
    const descuentoBajista = (PRECIO_EQUILIBRIO_FISCAL - precioCobreUsdLibra) / 0.1;
    porcentajePresupuestoFiscal = Math.max(8, PORCENTAJE_INGRESOS_FISCAL_BASE - descuentoBajista * 0.15);
  }

  // Paso 10: Aporte potencial a Fondo Estabilización Económica y Social
  // Si precio > equilibrio, 15% de ingresos van a fondo (política contra-cíclica)
  let fondeEstabilizacionAporteClp = 0;
  if (precioCobreUsdLibra > PRECIO_EQUILIBRIO_FISCAL) {
    const excesoSobreEquilibrio = precioCobreUsdLibra - PRECIO_EQUILIBRIO_FISCAL;
    const ingresoExcesoUsd = librasAnuales * excesoSobreEquilibrio * (tasaRoyaltyPorcentaje / 100);
    fondeEstabilizacionAporteClp = ingresoExcesoUsd * FACTOR_FONDO_ESTABILIZACION * tipoCambioUsdClp;
  }

  // Retorno de outputs
  return {
    ingreso_royalty_usd: Math.round(ingresoRoyaltyUsd / 1e6 * 100) / 100, // Millones USD
    ingreso_irpf_codelco_usd: Math.round(ingresoIrpfCodelcoUsd / 1e6 * 100) / 100, // Millones USD
    total_ingresos_codelco_usd: Math.round(totalIngresosCodelcoUsd / 1e6 * 100) / 100, // Millones USD
    total_ingresos_mineria_clp: Math.round(totalIngresosMineriaClp / 1e9 * 100) / 100, // Miles de millones CLP
    sensibilidad_precio_usd: Math.round(sensibilidadPrecioUsd / 1e6 * 100) / 100, // Millones USD por USD/lb
    sensibilidad_precio_clp: Math.round(sensibilidadPrecioClp / 1e9 * 100) / 100, // Miles de millones CLP por USD/lb
    porcentaje_presupuesto_fiscal: Math.round(porcentajePresupuestoFiscal * 10) / 10, // Porcentaje
    fondo_estabilizacion_aporte: Math.round(fondeEstabilizacionAporteClp / 1e9 * 100) / 100 // Miles de millones CLP
  };
}
