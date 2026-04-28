export interface Inputs {
  monto_inicial: number;
  plazo_meses: number;
  perfil_riesgo: 'conservador' | 'moderado' | 'agresivo';
  tipo_fondo: 'liquidez' | 'renta_fija' | 'mixto' | 'accionario';
  administradora: 'bci' | 'bancoestado' | 'banchile' | 'larrain_vial' | 'mbi';
  comision_base: number;
  rentabilidad_historica: number;
}

export interface Outputs {
  rentabilidad_bruta_total: number;
  rentabilidad_bruta_porcentaje: number;
  comisiones_totales: number;
  rentabilidad_neta_comisiones: number;
  impuesto_retenido: number;
  rentabilidad_neta_total: number;
  valor_final_cartera: number;
  tasa_retorno_neta_anual: number;
  recomendacion: string;
  comparativa_administradoras: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - SII, CMF
  const TASA_IMPUESTO_LIQUIDEZ = 0.17; // 17% liquidez
  const TASA_IMPUESTO_RENTA_FIJA = 0.18; // 18% renta fija
  const TASA_IMPUESTO_MIXTO = 0.19; // 19% mixto
  const TASA_IMPUESTO_ACCIONARIO = 0.19; // 19% accionario

  // Comisiones administradoras referencia 2026
  const COMISIONES_ADMIN: Record<string, { min: number; max: number; promedio: number }> = {
    bci: { min: 0.8, max: 2.5, promedio: 1.5 },
    bancoestado: { min: 1.0, max: 2.0, promedio: 1.5 },
    banchile: { min: 1.2, max: 2.5, promedio: 1.8 },
    larrain_vial: { min: 1.5, max: 3.0, promedio: 2.2 },
    mbi: { min: 0.9, max: 2.2, promedio: 1.5 }
  };

  // Validación inputs
  const montoInicial = Math.max(100000, i.monto_inicial);
  const plazoAnios = Math.max(0.083, i.plazo_meses / 12); // mínimo 1 mes = 0.083 años
  const rentabilidadAnual = Math.max(0.01, i.rentabilidad_historica / 100);
  const comisionAnual = i.comision_base / 100;

  // Determinación tasa impuesto según tipo fondo
  let tasaImpuesto = TASA_IMPUESTO_ACCIONARIO;
  if (i.tipo_fondo === 'liquidez') tasaImpuesto = TASA_IMPUESTO_LIQUIDEZ;
  else if (i.tipo_fondo === 'renta_fija') tasaImpuesto = TASA_IMPUESTO_RENTA_FIJA;
  else if (i.tipo_fondo === 'mixto') tasaImpuesto = TASA_IMPUESTO_MIXTO;

  // Cálculo rentabilidad bruta (fórmula interés compuesto)
  const factorCrecimiento = Math.pow(1 + rentabilidadAnual, plazoAnios);
  const rentabilidadBrutaTotal = montoInicial * (factorCrecimiento - 1);
  const rentabilidadBrutaPorcentaje = ((factorCrecimiento - 1) * 100);

  // Cálculo comisiones totales (aproximación lineal anual)
  const comisionesTotales = montoInicial * comisionAnual * plazoAnios;

  // Rentabilidad neta después comisiones
  const rentabilidadNetaComisiones = rentabilidadBrutaTotal - comisionesTotales;

  // Cálculo impuesto (sobre ganancia neta después comisiones)
  const impuestoRetenido = Math.max(0, rentabilidadNetaComisiones * tasaImpuesto);

  // Rentabilidad neta total (después impuesto)
  const rentabilidadNetaTotal = rentabilidadNetaComisiones - impuestoRetenido;

  // Valor final cartera
  const valorFinalCartera = montoInicial + rentabilidadNetaTotal;

  // Cálculo TIR neta anual
  let tasaRetornoNetaAnual = 0;
  if (plazoAnios > 0) {
    const factorFinal = valorFinalCartera / montoInicial;
    tasaRetornoNetaAnual = (Math.pow(factorFinal, 1 / plazoAnios) - 1) * 100;
  }

  // Recomendación según perfil riesgo
  let recomendacion = '';
  if (i.perfil_riesgo === 'conservador') {
    recomendacion = 'Perfil conservador: recomendamos fondos de Liquidez o Renta Fija. Bajo riesgo, rentabilidad 3-6% anual. Ideal para plazo <3 años o jubilados.';
  } else if (i.perfil_riesgo === 'moderado') {
    recomendacion = 'Perfil moderado: fondos Mixtos son ideales. Rentabilidad esperada 6-8% anual. Balance entre riesgo y retorno. Plazo recomendado 3-7 años.';
  } else if (i.perfil_riesgo === 'agresivo') {
    recomendacion = 'Perfil agresivo: fondos Accionarios ofrecen mayor potencial (8-12% anual). Mayor volatilidad. Requiere plazo >5-7 años y tolerancia riesgo alta. Diversifica entre tipos.';
  }

  // Comparativa administradoras (resumen simplificado)
  const comisionAdmin = COMISIONES_ADMIN[i.administradora as keyof typeof COMISIONES_ADMIN];
  const comisionPromedio = comisionAdmin?.promedio || 1.5;
  const rentabilidadAdminNetaEstimada = ((rentabilidadBrutaPorcentaje / 100 - comisionAnual) * 100);

  let comparativa = `Administradora seleccionada: ${i.administradora.toUpperCase()}. Comisión promedio: ${comisionPromedio.toFixed(2)}% anual. `;
  comparativa += `Rentabilidad neta estimada: ${rentabilidadAdminNetaEstimada.toFixed(2)}% anual (antes impuesto). `;
  comparativa += `Verifica prospectos en CMF y webs oficiales para comisiones exactas según monto y fondo específico.`;

  return {
    rentabilidad_bruta_total: Math.round(rentabilidadBrutaTotal),
    rentabilidad_bruta_porcentaje: Number(rentabilidadBrutaPorcentaje.toFixed(2)),
    comisiones_totales: Math.round(comisionesTotales),
    rentabilidad_neta_comisiones: Math.round(rentabilidadNetaComisiones),
    impuesto_retenido: Math.round(impuestoRetenido),
    rentabilidad_neta_total: Math.round(rentabilidadNetaTotal),
    valor_final_cartera: Math.round(valorFinalCartera),
    tasa_retorno_neta_anual: Number(tasaRetornoNetaAnual.toFixed(2)),
    recomendacion: recomendacion,
    comparativa_administradoras: comparativa
  };
}
