export interface Inputs {
  estrato_socioeconomico: number; // 1-6
  tipo_ies: string; // 'universidad' | 'tecnica' | 'tecnologica'
  numero_semestres: number;
  valor_matricula_semestral: number;
  incluir_manutención: boolean;
}

export interface Outputs {
  monto_total_financiable: number;
  cuota_periodo_estudio: number;
  porcentaje_subsidio: number;
  tasa_interes_postgraduada: number;
  cuota_postgraduada_estimada: number;
  plazo_meses: number;
  total_a_pagar_postgraduada: number;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  const estrato = Math.max(1, Math.min(6, i.estrato_socioeconomico));
  const semestres = Math.max(1, Math.min(16, i.numero_semestres));
  const matricula = Math.max(500000, i.valor_matricula_semestral);
  const incluyeManutención = i.incluir_manutención === true;

  // Tabla de subsidios y tasas 2026 ICETEX
  const datosEstrato: { [key: number]: { subsidio: number; aporte: number; tasa: number } } = {
    1: { subsidio: 100, aporte: 0, tasa: 0.0 },
    2: { subsidio: 95, aporte: 5, tasa: 0.015 },
    3: { subsidio: 70, aporte: 30, tasa: 0.03 },
    4: { subsidio: 40, aporte: 60, tasa: 0.04 },
    5: { subsidio: 25, aporte: 75, tasa: 0.045 },
    6: { subsidio: 0, aporte: 100, tasa: 0.05 }
  };

  const config = datosEstrato[estrato];
  const porcentajeSubsidio = config.subsidio;
  const porcentajeAporte = config.aporte;
  const tasaPostGrado = config.tasa;

  // Cálculo monto total
  let montoBase = matricula * semestres;
  if (incluyeManutención) {
    montoBase = montoBase * 1.3; // +30% manutención
  }
  const montoTotalFinanciable = Math.round(montoBase);

  // Cuota período estudio (aporte estudiante desembolsado mensuales)
  const aporteTotal = (montoTotalFinanciable * porcentajeAporte) / 100;
  const cuotaPeriodoEstudio = Math.round(aporteTotal / (semestres * 4.33));

  // Plazo post-grado (2x semestres)
  const plazoMeses = semestres * 2;

  // Cálculo cuota post-grado con fórmula hipotecaria
  // Cuota = P * [(i * (1+i)^n) / ((1+i)^n - 1)]
  // donde P = capital, i = tasa mensual, n = plazo meses
  const tasaMensual = tasaPostGrado / 12;
  let cuotaPostGrada = 0;
  let totalAPagarPostGrada = 0;

  if (tasaMensual > 0) {
    const numerador = tasaMensual * Math.pow(1 + tasaMensual, plazoMeses);
    const denominador = Math.pow(1 + tasaMensual, plazoMeses) - 1;
    cuotaPostGrada = Math.round(montoTotalFinanciable * (numerador / denominador));
    totalAPagarPostGrada = Math.round(cuotaPostGrada * plazoMeses);
  } else {
    // Tasa 0%: cuota simple dividida
    cuotaPostGrada = Math.round(montoTotalFinanciable / plazoMeses);
    totalAPagarPostGrada = montoTotalFinanciable;
  }

  return {
    monto_total_financiable: montoTotalFinanciable,
    cuota_periodo_estudio: cuotaPeriodoEstudio,
    porcentaje_subsidio: porcentajeSubsidio,
    tasa_interes_postgraduada: tasaPostGrado * 100, // en %
    cuota_postgraduada_estimada: cuotaPostGrada,
    plazo_meses: plazoMeses,
    total_a_pagar_postgraduada: totalAPagarPostGrada
  };
}
