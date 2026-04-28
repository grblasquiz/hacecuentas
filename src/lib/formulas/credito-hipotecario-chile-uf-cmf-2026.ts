export interface Inputs {
  precio_vivienda_clp: number;      // CLP
  pie_porcentaje: number;            // %
  plazo_anos: number;                // años
  tasa_real_anual: number;           // % anual
  uf_clp: number;                    // pesos por UF
}

export interface Outputs {
  monto_prestamo_uf: number;         // UF
  cuota_mensual_uf: number;          // UF
  cuota_mensual_clp: number;         // CLP
  total_intereses_uf: number;        // UF
  total_intereses_clp: number;       // CLP
  total_pagado_uf: number;           // UF
  total_pagado_clp: number;          // CLP
  ratio_deuda_ingreso: string;       // Texto recomendación
  comparativa_tasa: string;          // Texto impacto
}

export function compute(inputs: Inputs): Outputs {
  // Validaciones básicas
  if (inputs.precio_vivienda_clp < 5000000 || inputs.precio_vivienda_clp > 500000000) {
    return getDefaultOutputs('Precio vivienda debe estar entre $5M y $500M CLP.');
  }
  if (inputs.pie_porcentaje < 10 || inputs.pie_porcentaje > 50) {
    return getDefaultOutputs('Pie debe estar entre 10% y 50%.');
  }
  if (inputs.plazo_anos < 5 || inputs.plazo_anos > 30) {
    return getDefaultOutputs('Plazo debe estar entre 5 y 30 años.');
  }
  if (inputs.tasa_real_anual < 3.5 || inputs.tasa_real_anual > 7) {
    return getDefaultOutputs('Tasa real debe estar entre 3,5% y 7% anual.');
  }
  if (inputs.uf_clp < 30000 || inputs.uf_clp > 45000) {
    return getDefaultOutputs('UF/CLP debe estar entre $30.000 y $45.000.');
  }

  // CMF 2026: Validación pie según monto
  const precio_uf = inputs.precio_vivienda_clp / inputs.uf_clp;
  if (precio_uf > 2500 && inputs.pie_porcentaje < 20) {
    return getDefaultOutputs('Para vivienda >$2.500 UF, pie mínimo es 20% (CMF 2026).');
  }

  // === CÁLCULO SISTEMA FRANCÉS ===
  
  // 1. Monto a financiar en UF
  const monto_clp = inputs.precio_vivienda_clp * (1 - inputs.pie_porcentaje / 100);
  const monto_prestamo_uf = monto_clp / inputs.uf_clp;

  // 2. Parámetros tasa
  const tasa_real_mensual = inputs.tasa_real_anual / 100 / 12;  // Tasa mensual
  const num_cuotas = inputs.plazo_anos * 12;

  // 3. Cuota mensual en UF (fórmula francés)
  // Cuota = Capital × [i(1+i)^n] / [(1+i)^n - 1]
  const numerador = tasa_real_mensual * Math.pow(1 + tasa_real_mensual, num_cuotas);
  const denominador = Math.pow(1 + tasa_real_mensual, num_cuotas) - 1;
  const cuota_mensual_uf = monto_prestamo_uf * (numerador / denominador);

  // 4. Total pagado e intereses
  const total_pagado_uf = cuota_mensual_uf * num_cuotas;
  const total_intereses_uf = total_pagado_uf - monto_prestamo_uf;

  // 5. Conversión a CLP
  const cuota_mensual_clp = Math.round(cuota_mensual_uf * inputs.uf_clp);
  const total_pagado_clp = Math.round(total_pagado_uf * inputs.uf_clp);
  const total_intereses_clp = Math.round(total_intereses_uf * inputs.uf_clp);

  // 6. Texto ratio deuda/ingreso
  const ratio_text = `Para aprobación, cuota debe ser ≤35% ingreso neto. Tu cuota: $${cuota_mensual_clp.toLocaleString('es-CL')} CLP. Ingreso neto requerido mínimo: $${Math.round(cuota_mensual_clp / 0.35).toLocaleString('es-CL')} CLP.`;

  // 7. Comparativa tasa: impacto +/- 0,5%
  const tasa_mayor = inputs.tasa_real_anual + 0.5;
  const tasa_menor = inputs.tasa_real_anual - 0.5;

  const i_mayor = tasa_mayor / 100 / 12;
  const i_menor = tasa_menor / 100 / 12;

  const numerador_mayor = i_mayor * Math.pow(1 + i_mayor, num_cuotas);
  const denominador_mayor = Math.pow(1 + i_mayor, num_cuotas) - 1;
  const total_intereses_mayor = (monto_prestamo_uf * (numerador_mayor / denominador_mayor) * num_cuotas) - monto_prestamo_uf;

  const numerador_menor = i_menor * Math.pow(1 + i_menor, num_cuotas);
  const denominador_menor = Math.pow(1 + i_menor, num_cuotas) - 1;
  const total_intereses_menor = (monto_prestamo_uf * (numerador_menor / denominador_menor) * num_cuotas) - monto_prestamo_uf;

  const diferencia_mayor = Math.round((total_intereses_mayor - total_intereses_uf) * inputs.uf_clp);
  const diferencia_menor = Math.round((total_intereses_uf - total_intereses_menor) * inputs.uf_clp);

  const comparativa_text = `Si tasa sube a ${tasa_mayor}%: +$${diferencia_mayor.toLocaleString('es-CL')} CLP en intereses. Si tasa baja a ${tasa_menor}%: -$${diferencia_menor.toLocaleString('es-CL')} CLP en intereses (vs tasa actual ${inputs.tasa_real_anual}%).`;

  return {
    monto_prestamo_uf: parseFloat(monto_prestamo_uf.toFixed(2)),
    cuota_mensual_uf: parseFloat(cuota_mensual_uf.toFixed(2)),
    cuota_mensual_clp,
    total_intereses_uf: parseFloat(total_intereses_uf.toFixed(2)),
    total_intereses_clp,
    total_pagado_uf: parseFloat(total_pagado_uf.toFixed(2)),
    total_pagado_clp,
    ratio_deuda_ingreso: ratio_text,
    comparativa_tasa: comparativa_text
  };
}

function getDefaultOutputs(error: string): Outputs {
  return {
    monto_prestamo_uf: 0,
    cuota_mensual_uf: 0,
    cuota_mensual_clp: 0,
    total_intereses_uf: 0,
    total_intereses_clp: 0,
    total_pagado_uf: 0,
    total_pagado_clp: 0,
    ratio_deuda_ingreso: `Error: ${error}`,
    comparativa_tasa: `Error: ${error}`
  };
}
