export interface Inputs {
  tipo_pago: 'dividendos' | 'intereses' | 'regalias' | 'servicios' | 'comisiones' | 'otros';
  pais_beneficiario: string;
  valor_pago_cop: number;
  existe_tratado: 'no_sabe' | 'no' | 'si_reducida' | 'si_exenta';
  tarifa_tratado?: number;
  es_residente_permanente: 'no' | 'si';
}

export interface Outputs {
  tarifa_retencion_aplicable: number;
  valor_retencion_cop: number;
  valor_neto_remesa_cop: number;
  clasificacion_riesgo: string;
  obligacion_declarativa: string;
  formulario_requerido: string;
  plazo_retencion_dias: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DIAN Decreto 1771/2020
  const TARIFA_PARAISO_FISCAL = 0.35; // 35% estándar sin tratado
  const PLAZO_GIRO_DIAS = 10; // Máximo giro retención a DIAN
  
  // Lista paraísos fiscales DIAN (muestra representativa 2026)
  const PARAISOS_FISCALES = [
    'Islas Caimán', 'Panamá', 'Samoa', 'Mauricio', 'Malta',
    'Seychelles', 'Emiratos', 'Dubái', 'Maldivas', 'Chipre',
    'Luxemburgo (contexto fiscal)', 'Bahamas', 'Islas Vírgenes'
  ];
  
  // Lógica: determinar si es paraíso fiscal por nombre país
  const esParaisoFiscal = PARAISOS_FISCALES.some(p => 
    i.pais_beneficiario.toLowerCase().includes(p.toLowerCase())
  );
  
  // Determinar tarifa aplicable
  let tarifaAplicable = TARIFA_PARAISO_FISCAL; // por defecto 35%
  let clasificacionRiesgo = 'Riesgo Alto - Paraíso Fiscal';
  
  if (i.existe_tratado === 'si_exenta') {
    tarifaAplicable = 0.0;
    clasificacionRiesgo = 'Riesgo Bajo - Exención por Tratado';
  } else if (i.existe_tratado === 'si_reducida' && i.tarifa_tratado !== undefined) {
    tarifaAplicable = i.tarifa_tratado / 100;
    clasificacionRiesgo = `Riesgo Medio - Tratado Bilateral (${i.tarifa_tratado}%)`;
  } else if (i.existe_tratado === 'no_sabe') {
    // Aplicar prudencialmente 35% si no se verifica tratado
    tarifaAplicable = TARIFA_PARAISO_FISCAL;
    clasificacionRiesgo = 'Riesgo Alto - Tratado No Verificado';
  } else if (i.existe_tratado === 'no') {
    tarifaAplicable = TARIFA_PARAISO_FISCAL;
    clasificacionRiesgo = 'Riesgo Alto - Sin Tratado Bilateral';
  }
  
  // Calcular retención y neto
  const valorRetencion = i.valor_pago_cop * tarifaAplicable;
  const valorNeto = i.valor_pago_cop - valorRetencion;
  
  // Obligaciones declarativas (depende de monto y tipo pago)
  let obligacion = 'Reportar en Formulario 1780 (Renta) - Sección Retenciones No Residentes';
  if (i.valor_pago_cop > 50000000) {
    obligacion += '; Anexo Renta Exterior si vinculada; Certificado Residencia Fiscal Beneficiario';
  }
  
  // Formulario requerido principal
  const formularioRequerido = i.es_residente_permanente === 'si' 
    ? 'Formulario 1780 + Justificación Residencia Permanente'
    : 'Formulario 1780 + Anexo Renta Exterior + Form W-8BEN o Certificado AIU';
  
  return {
    tarifa_retencion_aplicable: tarifaAplicable * 100, // como %
    valor_retencion_cop: Math.round(valorRetencion),
    valor_neto_remesa_cop: Math.round(valorNeto),
    clasificacion_riesgo: clasificacionRiesgo,
    obligacion_declarativa: obligacion,
    formulario_requerido: formularioRequerido,
    plazo_retencion_dias: PLAZO_GIRO_DIAS
  };
}
