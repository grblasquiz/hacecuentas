export interface Inputs {
  precio_vivienda: number;
  porcentaje_entrada: number;
  tipo_interes_hipoteca: number;
  plazo_hipoteca_anos: number;
  porcentaje_gastos_compra: number;
  ibi_anual: number;
  seguro_hogar_anual: number;
  comunidad_anual: number;
  mantenimiento_anual: number;
  revalorizacion_vivienda_anual: number;
  renta_mensual: number;
  subida_alquiler_anual: number;
  rentabilidad_inversion_anual: number;
  anos_analisis: number;
}

export interface Outputs {
  entrada_euros: number;
  gastos_compra_euros: number;
  capital_hipoteca: number;
  cuota_hipoteca_mensual: number;
  total_pagado_hipoteca_periodo: number;
  total_intereses_periodo: number;
  capital_amortizado: number;
  gastos_propiedad_periodo: number;
  valor_vivienda_final: number;
  patrimonio_neto_compra: number;
  coste_neto_comprar: number;
  total_alquiler_periodo: number;
  valor_inversion_entrada: number;
  coste_neto_alquilar: number;
  diferencia: number;
  veredicto: string;
  breakeven_anos: string;
}

export function compute(i: Inputs): Outputs {
  // --- Saneamiento de entradas ---
  const precio = Math.max(0, i.precio_vivienda ?? 250000);
  const pctEntrada = Math.min(95, Math.max(0, i.porcentaje_entrada ?? 20));
  const tipoAnual = Math.max(0, i.tipo_interes_hipoteca ?? 3.5);
  const plazoAnos = Math.max(1, Math.round(i.plazo_hipoteca_anos ?? 25));
  const pctGastos = Math.max(0, i.porcentaje_gastos_compra ?? 10);
  const ibiAnual = Math.max(0, i.ibi_anual ?? 400);
  const seguroAnual = Math.max(0, i.seguro_hogar_anual ?? 300);
  const comunidadAnual = Math.max(0, i.comunidad_anual ?? 720);
  const mantenimientoAnual = Math.max(0, i.mantenimiento_anual ?? 500);
  const revalAnual = i.revalorizacion_vivienda_anual ?? 3; // puede ser negativa
  const rentaMensual = Math.max(0, i.renta_mensual ?? 900);
  const subidaAlquiler = Math.max(0, i.subida_alquiler_anual ?? 3);
  const rentabilidadInversion = Math.max(0, i.rentabilidad_inversion_anual ?? 5);
  const anosAnalisis = Math.max(1, Math.min(30, Math.round(i.anos_analisis ?? 10)));

  // =====================
  // BLOQUE COMPRA
  // =====================

  // 1. Inversión inicial
  const entrada = precio * (pctEntrada / 100);
  const gastosCompra = precio * (pctGastos / 100);
  const capitalHipoteca = Math.max(0, precio - entrada);

  // 2. Cuota hipotecaria mensual — sistema francés (fuente: Banco de España)
  //    r = tipo mensual, n = número de cuotas
  const r = tipoAnual / 100 / 12;
  const n = plazoAnos * 12;
  let cuotaMensual = 0;
  if (capitalHipoteca > 0 && r > 0 && n > 0) {
    const potencia = Math.pow(1 + r, n);
    cuotaMensual = capitalHipoteca * r * potencia / (potencia - 1);
  } else if (capitalHipoteca > 0 && r === 0 && n > 0) {
    // Tipo de interés 0%
    cuotaMensual = capitalHipoteca / n;
  }

  // 3. Cuadro de amortización durante el periodo de análisis
  //    Iteramos mes a mes para calcular capital amortizado e intereses exactos
  const mesesAnalisis = anosAnalisis * 12;
  const mesesMax = Math.min(mesesAnalisis, n); // no podemos analizar más meses que el plazo
  let saldo = capitalHipoteca;
  let totalCuotasPeriodo = 0;
  let totalInteresesPeriodo = 0;
  let capitalAmortizado = 0;

  for (let mes = 1; mes <= mesesMax; mes++) {
    if (saldo <= 0) break;
    const interesesMes = saldo * r;
    const amortizacionMes = Math.min(cuotaMensual - interesesMes, saldo);
    totalInteresesPeriodo += interesesMes;
    capitalAmortizado += amortizacionMes;
    totalCuotasPeriodo += cuotaMensual;
    saldo = Math.max(0, saldo - amortizacionMes);
  }

  // Si el plazo de hipoteca es menor que el periodo de análisis,
  // la hipoteca ya está pagada en los primeros plazoAnos años
  // (cuotas ya contabilizadas correctamente arriba)

  // 4. Gastos de propiedad acumulados en el periodo
  const gastosPropiedad = (ibiAnual + seguroAnual + comunidadAnual + mantenimientoAnual) * anosAnalisis;

  // 5. Valor de la vivienda al final del periodo (fuente: INE - IPV)
  const valorViviendaFinal = precio * Math.pow(1 + revalAnual / 100, anosAnalisis);

  // 6. Deuda pendiente al final del periodo
  const deudaPendiente = Math.max(0, capitalHipoteca - capitalAmortizado);

  // 7. Patrimonio neto acumulado (compra)
  const patrimonioNetoCompra = valorViviendaFinal - deudaPendiente;

  // 8. Coste neto de comprar
  //    = Todo lo desembolsado - patrimonio acumulado
  //    (entrada y gastos iniciales + cuotas + gastos propiedad - valor neto vivienda)
  const costeNeto_compra = entrada + gastosCompra + totalCuotasPeriodo + gastosPropiedad - patrimonioNetoCompra;

  // =====================
  // BLOQUE ALQUILER
  // =====================

  // 9. Total alquiler con subida anual compuesta
  let totalAlquiler = 0;
  for (let ano = 1; ano <= anosAnalisis; ano++) {
    const rentaEseAno = rentaMensual * 12 * Math.pow(1 + subidaAlquiler / 100, ano - 1);
    totalAlquiler += rentaEseAno;
  }

  // 10. Rentabilidad de invertir entrada + gastos de compra
  //     Capital invertido = dinero que no has gastado en la entrada ni en los gastos
  //     Se asume inversión al inicio y se capitaliza al tipo indicado
  const capitalInvertido = entrada + gastosCompra;
  const valorInversionFinal = capitalInvertido * Math.pow(1 + rentabilidadInversion / 100, anosAnalisis);
  const gananciaInversion = valorInversionFinal - capitalInvertido;

  // 11. Coste neto de alquilar
  //     = Alquiler pagado - ganancia de la inversión alternativa
  //     (restamos la ganancia porque es lo que obtienes a cambio de no tener la vivienda)
  const costeNeto_alquiler = totalAlquiler - gananciaInversion;

  // =====================
  // COMPARACIÓN
  // =====================

  // 12. Diferencia: positivo => alquilar más barato; negativo => comprar más barato
  const diferencia = costeNeto_compra - costeNeto_alquiler;

  // 13. Veredicto
  let veredicto: string;
  const umbralSignificativo = precio * 0.01; // 1% del precio como umbral de relevancia
  if (Math.abs(diferencia) < umbralSignificativo) {
    veredicto = 'Ambas opciones tienen un coste neto muy similar en este horizonte temporal.';
  } else if (diferencia > 0) {
    veredicto = `Alquilar es más ventajoso en ${anosAnalisis} años: ahorra aproximadamente ${formatCurrency(Math.abs(diferencia))} respecto a comprar.`;
  } else {
    veredicto = `Comprar es más ventajoso en ${anosAnalisis} años: ahorra aproximadamente ${formatCurrency(Math.abs(diferencia))} respecto a alquilar.`;
  }

  // 14. Punto de equilibrio (breakeven)
  //     Buscamos el año a partir del cual coste_compra < coste_alquiler
  //     Iteramos año a año con la misma lógica
  let breakevenAnos = 'No se alcanza en el horizonte máximo de 30 años';

  // Pre-calcular breakeven hasta 30 años
  const MAX_ANOS_BREAKEVEN = 30;
  let saldoBE = capitalHipoteca;
  let cuotasAcumBE = 0;
  let interesesAcumBE = 0;
  let capitalAmortBE = 0;
  let alquilerAcumBE = 0;
  const mesesPlazo = n;
  let mesContadorBE = 0;

  for (let anoBE = 1; anoBE <= MAX_ANOS_BREAKEVEN; anoBE++) {
    // Acumular cuotas hipotecarias ese año
    for (let m = 0; m < 12; m++) {
      mesContadorBE++;
      if (mesContadorBE <= mesesPlazo && saldoBE > 0) {
        const intMes = saldoBE * r;
        const amortMes = Math.min(cuotaMensual - intMes, saldoBE);
        interesesAcumBE += intMes;
        capitalAmortBE += amortMes;
        cuotasAcumBE += cuotaMensual;
        saldoBE = Math.max(0, saldoBE - amortMes);
      }
      // Si el plazo terminó, no hay más cuotas
    }

    // Gastos propiedad acumulados
    const gastosPropBE = (ibiAnual + seguroAnual + comunidadAnual + mantenimientoAnual) * anoBE;

    // Valor vivienda
    const valorVivBE = precio * Math.pow(1 + revalAnual / 100, anoBE);
    const deudaPendBE = Math.max(0, capitalHipoteca - capitalAmortBE);
    const patrimonBE = valorVivBE - deudaPendBE;

    // Coste neto compra hasta ese año
    const costCompraBE = entrada + gastosCompra + cuotasAcumBE + gastosPropBE - patrimonBE;

    // Alquiler acumulado ese año
    alquilerAcumBE += rentaMensual * 12 * Math.pow(1 + subidaAlquiler / 100, anoBE - 1);

    // Valor inversión alternativa hasta ese año
    const valInvBE = capitalInvertido * Math.pow(1 + rentabilidadInversion / 100, anoBE);
    const ganInvBE = valInvBE - capitalInvertido;

    // Coste neto alquiler hasta ese año
    const costAlqBE = alquilerAcumBE - ganInvBE;

    // ¿Se produce breakeven?
    if (costCompraBE <= costAlqBE) {
      breakevenAnos = `Año ${anoBE}: a partir de este momento comprar resulta más ventajoso que alquilar.`;
      break;
    }
  }

  return {
    entrada_euros: round2(entrada),
    gastos_compra_euros: round2(gastosCompra),
    capital_hipoteca: round2(capitalHipoteca),
    cuota_hipoteca_mensual: round2(cuotaMensual),
    total_pagado_hipoteca_periodo: round2(totalCuotasPeriodo),
    total_intereses_periodo: round2(totalInteresesPeriodo),
    capital_amortizado: round2(capitalAmortizado),
    gastos_propiedad_periodo: round2(gastosPropiedad),
    valor_vivienda_final: round2(valorViviendaFinal),
    patrimonio_neto_compra: round2(patrimonioNetoCompra),
    coste_neto_comprar: round2(costeNeto_compra),
    total_alquiler_periodo: round2(totalAlquiler),
    valor_inversion_entrada: round2(valorInversionFinal),
    coste_neto_alquilar: round2(costeNeto_alquiler),
    diferencia: round2(diferencia),
    veredicto,
    breakeven_anos: breakevenAnos,
  };
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

function formatCurrency(val: number): string {
  return val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}
