export interface Inputs {
  saldo_inicial: number;
  cat_anual: number;
  pago_minimo_mensual: number;
  pago_alternativo_mensual: number;
}

export interface Outputs {
  meses_pago_minimo: number;
  anos_pago_minimo: number;
  intereses_totales_minimo: number;
  monto_total_pagado_minimo: number;
  meses_pago_alternativo: number;
  anos_pago_alternativo: number;
  intereses_totales_alternativo: number;
  monto_total_pagado_alternativo: number;
  ahorro_intereses: number;
  meses_ahorrados: number;
  años_ahorrados: number;
  advertencia: string;
}

function calcularDeudaTDC(
  saldoInicial: number,
  catAnual: number,
  pagoMensual: number,
  maxMeses: number = 600
): {
  meses: number;
  interesesTotales: number;
  montoPagado: number;
} {
  // CAT mensual: divide CAT anual entre 12 y convierte a decimal
  // CAT 75% anual = 75 / 12 / 100 = 0.00625 (0.625% mensual)
  const catMensual = catAnual / 12 / 100;

  let saldo = saldoInicial;
  let interesesTotales = 0;
  let meses = 0;
  let montoPagado = 0;

  // Iterar mes a mes hasta que saldo <= 0 o se alcance max de meses
  for (meses = 1; meses <= maxMeses && saldo > 0; meses++) {
    // Aplicar interés compuesto
    const interesMes = saldo * catMensual;
    saldo += interesMes;
    interesesTotales += interesMes;

    // Aplicar pago
    // Si el saldo es menor que el pago, pagar exactamente lo que queda
    if (saldo <= pagoMensual) {
      montoPagado += saldo;
      saldo = 0;
    } else {
      saldo -= pagoMensual;
      montoPagado += pagoMensual;
    }
  }

  // Si se alcanzó el máximo de meses sin pagar, retornar valores altos
  // para indicar que el pago es insuficiente
  if (saldo > 0) {
    return {
      meses: maxMeses,
      interesesTotales: interesesTotales,
      montoPagado: montoPagado,
    };
  }

  return {
    meses: meses,
    interesesTotales: Math.round(interesesTotales * 100) / 100,
    montoPagado: Math.round(montoPagado * 100) / 100,
  };
}

export function compute(i: Inputs): Outputs {
  // Validación de inputs
  const saldoInicial = Math.max(100, i.saldo_inicial);
  const catAnual = Math.max(10, Math.min(150, i.cat_anual));
  const pagoMinimo = Math.max(50, i.pago_minimo_mensual);
  const pagoAlternativo = Math.max(50, i.pago_alternativo_mensual);

  // Calcular con pago mínimo
  const resultMinimo = calcularDeudaTDC(
    saldoInicial,
    catAnual,
    pagoMinimo,
    600
  );

  // Calcular con pago alternativo
  const resultAlternativo = calcularDeudaTDC(
    saldoInicial,
    catAnual,
    pagoAlternativo,
    600
  );

  // Calcular años
  const anosMinimo = resultMinimo.meses / 12;
  const anosAlternativo = resultAlternativo.meses / 12;
  const anosAhorrados = anosMinimo - anosAlternativo;

  // Calcular diferencias
  const ahorroIntereses =
    resultMinimo.interesesTotales - resultAlternativo.interesesTotales;
  const mesesAhorrados = resultMinimo.meses - resultAlternativo.meses;

  // Generar advertencia
  let advertencia = "";
  if (pagoMinimo < saldoInicial * 0.02) {
    advertencia = `⚠️ Tu pago mínimo (\$${pagoMinimo.toFixed(0)}) es muy bajo. Puede ser menor que los intereses mensuales (\$${(saldoInicial * (catAnual / 12 / 100)).toFixed(0)}). Recomendación: paga al menos \$${Math.ceil(saldoInicial * (catAnual / 12 / 100) + 100)}.`;
  } else if (resultMinimo.meses > 120) {
    advertencia = `⚠️ Pagando mínimo tardarás ${resultMinimo.meses} meses (${anosMinimo.toFixed(1)} años). Esto es una trampa. Intenta pagar más cada mes.`;
  }

  return {
    meses_pago_minimo: resultMinimo.meses,
    anos_pago_minimo: Math.round(anosMinimo * 10) / 10,
    intereses_totales_minimo: resultMinimo.interesesTotales,
    monto_total_pagado_minimo: resultMinimo.montoPagado,
    meses_pago_alternativo: resultAlternativo.meses,
    anos_pago_alternativo: Math.round(anosAlternativo * 10) / 10,
    intereses_totales_alternativo: resultAlternativo.interesesTotales,
    monto_total_pagado_alternativo: resultAlternativo.montoPagado,
    ahorro_intereses: Math.round(ahorroIntereses * 100) / 100,
    meses_ahorrados: mesesAhorrados,
    años_ahorrados: Math.round(anosAhorrados * 10) / 10,
    advertencia: advertencia,
  };
}
