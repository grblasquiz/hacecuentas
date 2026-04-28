export interface Inputs {
  precio_compra_uf: number;
  uf_valor: number;
  arriendo_mensual_uf: number;
  gastos_comunes_mensuales: number;
  contribuciones_mensuales: number;
  comision_corredor_meses: number;
  gastos_mantenimiento_mensuales: number;
  impuesto_plusvalia_porcentaje: number;
  plusvalia_anual_porcentaje: number;
  horizonte_anos: number;
  tasa_benchmark_anual: number;
}

export interface Outputs {
  precio_compra_pesos: number;
  arriendo_anual_uf: number;
  arriendo_anual_pesos: number;
  gastos_anuales_totales: number;
  flujo_neto_anual: number;
  yield_bruto_porcentaje: number;
  yield_neto_porcentaje: number;
  valor_departamento_final: number;
  plusvalia_total_bruta: number;
  impuesto_plusvalia_total: number;
  plusvalia_neta: number;
  flujo_neto_acumulado: number;
  roi_total_porcentaje: number;
  roi_anual_promedio: number;
  benchmark_rendimiento_total: number;
  diferencia_vs_benchmark: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes y validaciones
  const precioCompraUF = Math.max(i.precio_compra_uf, 500);
  const ufValor = Math.max(i.uf_valor, 25000);
  const arriendoMensualUF = Math.max(i.arriendo_mensual_uf, 0);
  const gastosComunes = Math.max(i.gastos_comunes_mensuales, 0);
  const contribuciones = Math.max(i.contribuciones_mensuales, 0);
  const comisionCorrelorMeses = Math.max(Math.min(i.comision_corredor_meses, 2), 0);
  const gastosMantenimiento = Math.max(i.gastos_mantenimiento_mensuales, 0);
  const impuestoPlusvaliaPorc = Math.max(Math.min(i.impuesto_plusvalia_porcentaje, 50), 0);
  const plusvaliaAnualPorc = Math.max(Math.min(i.plusvalia_anual_porcentaje, 15), 0);
  const horizonte = Math.max(Math.min(i.horizonte_anos, 30), 5);
  const tasaBenchmark = Math.max(Math.min(i.tasa_benchmark_anual, 20), 0);

  // 1. Precio compra en pesos
  const precioCompraPesos = precioCompraUF * ufValor;

  // 2. Arriendo anual
  const arriendoAnualUF = arriendoMensualUF * 12;
  const arriendoAnualPesos = arriendoAnualUF * ufValor;

  // 3. Comisión corredor anual
  const comisionCorrelorAnual = arriendoAnualPesos * (comisionCorrelorMeses / 12);

  // 4. Gastos anuales totales
  const gastosAnualesTotales =
    gastosComunes * 12 +
    contribuciones * 12 +
    comisionCorrelorAnual +
    gastosMantenimiento * 12;

  // 5. Flujo neto anual
  const flujoNetoAnual = arriendoAnualPesos - gastosAnualesTotales;

  // 6. Yields
  const yieldBrutoPorc = (arriendoAnualPesos / precioCompraPesos) * 100;
  const yieldNetoPorc = (flujoNetoAnual / precioCompraPesos) * 100;

  // 7. Valor departamento en año final (con plusvalía compuesta)
  // Valor final en UF = Precio compra UF × (1 + plusvalía%)^horizonte
  const valorFinalUF = precioCompraUF * Math.pow(1 + plusvaliaAnualPorc / 100, horizonte);
  const valorDepartamentoFinal = valorFinalUF * ufValor;

  // 8. Plusvalía
  const plusvaliaBruta = valorDepartamentoFinal - precioCompraPesos;
  const impuestoPlusvaliaTotal = plusvaliaBruta * (impuestoPlusvaliaPorc / 100);
  const plusvaliaNeta = plusvaliaBruta - impuestoPlusvaliaTotal;

  // 9. Flujo neto acumulado (sin capitalizar, simple)
  const flujoNetoAcumulado = flujoNetoAnual * horizonte;

  // 10. ROI total
  const roiTotalPorc = ((flujoNetoAcumulado + plusvaliaNeta) / precioCompraPesos) * 100;
  const roiAnualPromedio = roiTotalPorc / horizonte;

  // 11. Benchmark (capital inicial a tasa fija, sin reinversión continua, valor final simple)
  // Valor benchmark = Precio compra × (1 + tasa benchmark%)^horizonte
  const benchmarkRendimientoTotal = precioCompraPesos * Math.pow(1 + tasaBenchmark / 100, horizonte);
  const diferenciaVsBenchmark = flujoNetoAcumulado + plusvaliaNeta - benchmarkRendimientoTotal;

  return {
    precio_compra_pesos: precioCompraPesos,
    arriendo_anual_uf: arriendoAnualUF,
    arriendo_anual_pesos: arriendoAnualPesos,
    gastos_anuales_totales: gastosAnualesTotales,
    flujo_neto_anual: flujoNetoAnual,
    yield_bruto_porcentaje: yieldBrutoPorc,
    yield_neto_porcentaje: yieldNetoPorc,
    valor_departamento_final: valorDepartamentoFinal,
    plusvalia_total_bruta: plusvaliaBruta,
    impuesto_plusvalia_total: impuestoPlusvaliaTotal,
    plusvalia_neta: plusvaliaNeta,
    flujo_neto_acumulado: flujoNetoAcumulado,
    roi_total_porcentaje: roiTotalPorc,
    roi_anual_promedio: roiAnualPromedio,
    benchmark_rendimiento_total: benchmarkRendimientoTotal,
    diferencia_vs_benchmark: diferenciaVsBenchmark
  };
}
