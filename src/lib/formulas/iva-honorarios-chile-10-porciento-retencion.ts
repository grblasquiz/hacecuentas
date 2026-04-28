export interface Inputs {
  monto_bruto_honorario: number;
  incluye_iva: boolean;
  es_pyme: boolean;
  anio_factura: number;
}

export interface Outputs {
  monto_bruto_neto: number;
  tasa_retencion_aplicada: number;
  monto_retencion: number;
  monto_liquido_recibir: number;
  iva_a_pagar: number;
  total_costo_empresa: number;
  obligacion_declaracion: string;
  proyeccion_anual_12_meses: number;
}

export function compute(i: Inputs): Outputs {
  // Tasas retención por año - Ley 21.578 reforma progresiva
  const tasas_por_anio: { [key: number]: number } = {
    2026: 0.1375,  // 13.75% vigente 2026
    2027: 0.155,   // 15.5% vigente 2027
    2028: 0.17,    // 17% vigente 2028+
  };

  // Obtener tasa aplicable
  let tasa_retencion = tasas_por_anio[i.anio_factura] || 0.17;

  // Si es pyme, aplica retención reducida 8.75%
  // Fuente: SII artículo 14 ter, UTA máximo $4.310.000 (2026)
  if (i.es_pyme) {
    tasa_retencion = 0.0875;  // 8.75% régimen pyme
  }

  // Separar IVA si está incluido en monto
  let monto_bruto_neto = i.monto_bruto_honorario;
  let iva_incluido = 0;

  if (i.incluye_iva) {
    // Monto bruto = Total ÷ 1.19 (IVA 19%)
    monto_bruto_neto = i.monto_bruto_honorario / 1.19;
    iva_incluido = i.monto_bruto_honorario - monto_bruto_neto;
  } else {
    iva_incluido = monto_bruto_neto * 0.19;
  }

  // Calcular retención sobre monto bruto neto
  const monto_retencion = monto_bruto_neto * tasa_retencion;

  // Líquido a recibir profesional
  const monto_liquido_recibir = monto_bruto_neto - monto_retencion;

  // Costo total para empresa (bruto + IVA)
  const total_costo_empresa = monto_bruto_neto + iva_incluido;

  // Obligación SII - texto dinámico
  let obligacion_declaracion = "Empresa retiene y deposita en SII antes día 12 hábil siguiente.";
  if (i.es_pyme) {
    obligacion_declaracion = "Régimen pyme: retención reducida 8.75%. Profesional declara en F-29 o F-20.";
  } else {
    obligacion_declaracion = "Retención estándar 13.75%. Profesional reporta en formulario 29 y reconcilia en abril.";
  }

  // Proyección anual (12 meses con mismo monto)
  const proyeccion_anual_12_meses = monto_retencion * 12;

  return {
    monto_bruto_neto: Math.round(monto_bruto_neto),
    tasa_retencion_aplicada: tasa_retencion * 100,
    monto_retencion: Math.round(monto_retencion),
    monto_liquido_recibir: Math.round(monto_liquido_recibir),
    iva_a_pagar: Math.round(iva_incluido),
    total_costo_empresa: Math.round(total_costo_empresa),
    obligacion_declaracion: obligacion_declaracion,
    proyeccion_anual_12_meses: Math.round(proyeccion_anual_12_meses),
  };
}
