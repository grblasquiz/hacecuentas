export interface Inputs {
  salario_bruto_mensual: number;
  aplicar_subsidio: boolean;
}

export interface Outputs {
  isr_bruto: number;
  subsidio_empleo: number;
  isr_neto: number;
  aportacion_imss: number;
  neto_en_mano: number;
  tramo_aplicado: number;
  tasa_efectiva: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 SAT — Artículo 96 LISR, tarifa mensual
  // Fuente: SAT Resolución Miscelánea Fiscal 2026
  const tramos = [
    { limite_inf: 0, limite_sup: 496.07, tasa: 0.0192, cuota_fija: 0 },
    { limite_inf: 496.07, limite_sup: 4942.84, tasa: 0.064, cuota_fija: 9.52 },
    { limite_inf: 4942.84, limite_sup: 9926.37, tasa: 0.1088, cuota_fija: 314.60 },
    { limite_inf: 9926.37, limite_sup: 17357.85, tasa: 0.16, cuota_fija: 1127.93 },
    { limite_inf: 17357.85, limite_sup: 20089.15, tasa: 0.1792, cuota_fija: 2944.84 },
    { limite_inf: 20089.15, limite_sup: 30779.70, tasa: 0.2136, cuota_fija: 3501.13 },
    { limite_inf: 30779.70, limite_sup: 61236.47, tasa: 0.2352, cuota_fija: 6246.61 },
    { limite_inf: 61236.47, limite_sup: 99881.35, tasa: 0.30, cuota_fija: 16072.74 },
    { limite_inf: 99881.35, limite_sup: 357347.20, tasa: 0.32, cuota_fija: 28482.16 },
    { limite_inf: 357347.20, limite_sup: 3573472.00, tasa: 0.34, cuota_fija: 123606.02 },
    { limite_inf: 3573472.00, limite_sup: Infinity, tasa: 0.35, cuota_fija: 1236060.20 }
  ];

  // Tabla subsidio al empleo 2026 (SAT) — aproximada por rangos
  // Nota: Subsidio máximo ~347 MXN para ingresos hasta ~20,089 MXN
  const subsidioPorRango = [
    { limite_inf: 0, limite_sup: 496.07, subsidio: 0 },
    { limite_inf: 496.07, limite_sup: 4942.84, subsidio: 32.90 },
    { limite_inf: 4942.84, limite_sup: 9926.37, subsidio: 107.72 },
    { limite_inf: 9926.37, limite_sup: 17357.85, subsidio: 230.39 },
    { limite_inf: 17357.85, limite_sup: 20089.15, subsidio: 347.06 },
    { limite_inf: 20089.15, limite_sup: 30779.70, subsidio: 347.06 },
    { limite_inf: 30779.70, limite_sup: 99881.35, subsidio: 0 },
    { limite_inf: 99881.35, limite_sup: Infinity, subsidio: 0 }
  ];

  const salario = i.salario_bruto_mensual || 0;

  // Paso 1: Determinar tramo y calcular ISR bruto
  let isr_bruto = 0;
  let tramo_idx = 0;
  for (let idx = 0; idx < tramos.length; idx++) {
    const tramo = tramos[idx];
    if (salario >= tramo.limite_inf && salario < tramo.limite_sup) {
      isr_bruto = (salario - tramo.limite_inf) * tramo.tasa + tramo.cuota_fija;
      tramo_idx = idx;
      break;
    }
  }

  // Paso 2: Aplicar subsidio al empleo
  let subsidio_empleo = 0;
  if (i.aplicar_subsidio) {
    for (const rango of subsidioPorRango) {
      if (salario >= rango.limite_inf && salario < rango.limite_sup) {
        subsidio_empleo = rango.subsidio;
        break;
      }
    }
  }

  // Paso 3: Calcular ISR neto (después de subsidio)
  const isr_neto = Math.max(0, isr_bruto - subsidio_empleo);

  // Paso 4: Aportación IMSS empleado 3.05% (SAT/IMSS)
  const aportacion_imss = salario * 0.0305;

  // Paso 5: Neto en mano
  const neto_en_mano = salario - isr_neto - aportacion_imss;

  // Paso 6: Tasa efectiva de ISR
  const tasa_efectiva = salario > 0 ? (isr_neto / salario) * 100 : 0;

  // Paso 7: Tasa marginal del tramo aplicado
  const tramo_aplicado = tramos[tramo_idx].tasa * 100;

  const isrNetoOut = Math.round(isr_neto * 100) / 100;
  const imssOut = Math.round(aportacion_imss * 100) / 100;
  const netoOut = Math.round(neto_en_mano * 100) / 100;
  const subsidioOut = Math.round(subsidio_empleo * 100) / 100;
  const tasaEfectivaOut = Math.round(tasa_efectiva * 100) / 100;
  const fmtMXN = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const pctNeto = salario > 0 ? Math.round((netoOut / salario) * 1000) / 10 : 0;

  const _insight = {
    title: salario <= 0 ? 'Ingresá tu salario' : 'Tu neto en mano',
    text: salario <= 0
      ? 'Cargá tu salario bruto mensual para estimar el ISR, el IMSS y el neto que cobrás.'
      : subsidioOut > 0
      ? `De un bruto de **${fmtMXN(salario)}** te descuentan **${fmtMXN(isrNetoOut)}** de ISR (ya con subsidio de ${fmtMXN(subsidioOut)}) y **${fmtMXN(imssOut)}** de IMSS: te quedan **${fmtMXN(netoOut)}** en mano, el **${pctNeto}%**.`
      : `De un bruto de **${fmtMXN(salario)}** te descuentan **${fmtMXN(isrNetoOut)}** de ISR (tasa marginal ${Math.round(tramo_aplicado * 100) / 100}%) y **${fmtMXN(imssOut)}** de IMSS: cobrás **${fmtMXN(netoOut)}** netos, el **${pctNeto}%**.`,
    tone: salario <= 0 ? 'neutral' : pctNeto >= 85 ? 'good' : pctNeto < 70 ? 'warn' : 'neutral',
    icon: '💵',
  };

  const out: Outputs = {
    isr_bruto: Math.round(isr_bruto * 100) / 100,
    subsidio_empleo: subsidioOut,
    isr_neto: isrNetoOut,
    aportacion_imss: imssOut,
    neto_en_mano: netoOut,
    tramo_aplicado: Math.round(tramo_aplicado * 100) / 100,
    tasa_efectiva: tasaEfectivaOut,
    _insight,
  };

  // Donut: el salario bruto se reparte entre neto en mano + ISR + IMSS (suman el bruto)
  if (salario > 0 && netoOut >= 0) {
    const slices = [
      { label: 'Neto en mano', value: netoOut },
      { label: 'ISR neto', value: isrNetoOut },
      { label: 'IMSS (empleado)', value: imssOut },
    ].filter(s => s.value > 0);
    if (slices.length >= 2) {
      out._chart = {
        type: 'doughnut',
        slices,
        prefix: '$',
        centerValue: fmtMXN(salario),
        centerLabel: 'Salario bruto',
        ariaLabel: 'Reparto del salario bruto mensual entre neto en mano, ISR e IMSS',
      };
    }
  }

  return out;
}
