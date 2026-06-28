export interface Inputs {
  monto_honorario: number;
  incluye_iva: boolean;
  departamento_cliente: string;
  cliente_es_retenedor: boolean;
  aplica_reteiva: boolean;
  es_autorretenedor: boolean;
  periodicidad_declaracion?: string;
}

export interface Outputs {
  base_retencion: number;
  iva_honorario: number;
  retencion_renta: number;
  porcentaje_renta_aplicado: number;
  tarifa_ica: string;
  retencion_ica: number;
  retencion_reteiva: number;
  total_retenciones: number;
  neto_recibido_sin_iva: number;
  total_facturado: number;
  efectivo_neto_total: number;
  tasa_retencion_efectiva: number;
  periodicidad_declaracion_resultado: string;
  obligaciones_complementarias: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).incluye_iva = (i as any).incluye_iva === true || (i as any).incluye_iva === 'true';
  (i as any).cliente_es_retenedor = (i as any).cliente_es_retenedor === true || (i as any).cliente_es_retenedor === 'true';
  (i as any).aplica_reteiva = (i as any).aplica_reteiva === true || (i as any).aplica_reteiva === 'true';
  // Constantes 2026 DIAN
  const IVA_RATE = 0.19; // 19% IVA estándar Colombia
  const RETENCION_RENTA_SERVICIOS = 0.10; // 10% servicios generales
  const RETENCION_RENTA_CONSULTORIA = 0.11; // 11% consultoría/asesoría
  const RETEIVA_RATE = 0.19; // 19% reteIVA sobre IVA

  // Tarifas ICA por municipio (por mil, DIAN 2026)
  const ICA_TARIFAS: { [key: string]: { tasa: number; nombre: string } } = {
    bogota: { tasa: 8.0, nombre: "Bogotá - 8,0 por mil" },
    antioquia: { tasa: 8.0, nombre: "Antioquia (Medellín) - 8,0 por mil" },
    valle: { tasa: 8.0, nombre: "Valle (Cali) - 8,0 por mil" },
    atlantico: { tasa: 8.5, nombre: "Atlántico (Barranquilla) - 8,5 por mil" },
    cundinamarca: { tasa: 10.0, nombre: "Cundinamarca (otra) - 10,0 por mil" },
    santander: { tasa: 9.0, nombre: "Santander (Bucaramanga) - 9,0 por mil" },
    nariño: { tasa: 10.0, nombre: "Nariño (Pasto) - 10,0 por mil" },
    cauca: { tasa: 9.5, nombre: "Cauca (Popayán) - 9,5 por mil" },
    tolima: { tasa: 10.0, nombre: "Tolima (Ibagué) - 10,0 por mil" },
    huila: { tasa: 10.0, nombre: "Huila (Neiva) - 10,0 por mil" },
    otro: { tasa: 10.0, nombre: "Otro - 10,0 por mil (promedio)" }
  };

  // 1. Determinar base de retención
  let base_retencion = i.monto_honorario;
  if (i.incluye_iva) {
    // Descontar IVA: base = total / 1.19
    base_retencion = i.monto_honorario / (1 + IVA_RATE);
  }
  base_retencion = Math.round(base_retencion * 100) / 100;

  // 2. Calcular IVA del honorario
  const iva_honorario = Math.round(base_retencion * IVA_RATE * 100) / 100;

  // 3. Determinar porcentaje de retención en renta
  // Por defecto consultoría (11%), pero podría variar según cliente
  const porcentaje_renta_aplicado = RETENCION_RENTA_CONSULTORIA; // 11% como predeterminado
  const retencion_renta = Math.round(base_retencion * porcentaje_renta_aplicado * 100) / 100;

  // 4. Obtener tarifa ICA
  const ica_data = ICA_TARIFAS[i.departamento_cliente] || ICA_TARIFAS["otro"];
  const tarifa_ica_por_mil = ica_data.tasa;
  const tarifa_ica_desc = ica_data.nombre;

  // 5. Calcular retención ICA (solo si cliente está obligado a retener)
  let retencion_ica = 0;
  if (i.cliente_es_retenedor) {
    retencion_ica = Math.round((base_retencion * tarifa_ica_por_mil) / 1000 * 100) / 100;
  }

  // 6. Calcular reteIVA (solo si aplica y cliente retenedor)
  let retencion_reteiva = 0;
  if (i.aplica_reteiva && i.cliente_es_retenedor) {
    retencion_reteiva = Math.round(iva_honorario * RETEIVA_RATE * 100) / 100;
  }

  // 7. Total retenciones
  const total_retenciones = Math.round((retencion_renta + retencion_ica + retencion_reteiva) * 100) / 100;

  // 8. Neto recibido (sin IVA)
  const neto_recibido_sin_iva = Math.round((base_retencion - total_retenciones) * 100) / 100;

  // 9. Total facturado (honorario + IVA)
  const total_facturado = Math.round((base_retencion + iva_honorario) * 100) / 100;

  // 10. Efectivo neto total recibido
  const efectivo_neto_total = neto_recibido_sin_iva; // Igual a neto sin IVA (IVA se factura pero retenciones se aplican a base)

  // 11. Tasa de retención efectiva
  const tasa_retencion_efectiva = base_retencion > 0
    ? Math.round((total_retenciones / base_retencion) * 10000) / 100
    : 0;

  // 12. Periodicidad declaración
  let periodicidad_declaracion_resultado = "Consulta tu RUT o asesor";
  if (i.cliente_es_retenedor) {
    const promedio_mensual = total_retenciones / 12; // Aproximado
    if (promedio_mensual > 600000) {
      periodicidad_declaracion_resultado = "Mensual (Formulario 361, si retención acumulada > $600k/mes aprox.)";
    } else {
      periodicidad_declaracion_resultado = "Bimestral (Formulario 361 bimestral, si retención menor)";
    }
  } else {
    periodicidad_declaracion_resultado = "Sin retenciones (cliente no está obligado)";
  }

  // 13. Obligaciones complementarias
  let obligaciones = [];
  if (i.cliente_es_retenedor) {
    obligaciones.push("Exigir certificado anual de retención (Formulario 1099 o 2645) al cliente");
    obligaciones.push("Incorporar retenciones certificadas en declaración de renta anual (crédito tributario)");
    obligaciones.push("Validar que cliente cumplió declaración de retenciones ante DIAN");
  }
  if (i.aplica_reteiva) {
    obligaciones.push("ReteIVA 19% retiene sobre IVA: valida inclusión en certificado");
  }
  obligaciones.push("Cotizar EPS (~12,5%) y pensión (~4%) como independiente si procede");
  obligaciones.push("Mantener factura y retención documentadas mínimo 5 años (Código Tributario)");
  const obligaciones_complementarias = obligaciones.join("; ");

  // Insight narrativo sobre la mordida de las retenciones
  const fmtCOP = (n: number) => "$" + Math.round(n).toLocaleString("es-CO");
  let insight_tone: "good" | "warn" | "neutral" = "neutral";
  let insight_text: string;
  if (total_retenciones <= 0) {
    insight_tone = "good";
    insight_text = `Tu cliente **no te retiene** nada: cobrás los **${fmtCOP(base_retencion)}** completos de honorario (más el IVA que factures). Igual recordá declarar renta y aportes como independiente.`;
  } else {
    insight_tone = tasa_retencion_efectiva >= 11 ? "warn" : "neutral";
    insight_text = `De cada honorario te retienen el **${tasa_retencion_efectiva}%**: sobre una base de **${fmtCOP(base_retencion)}** se van **${fmtCOP(total_retenciones)}** y recibís **${fmtCOP(neto_recibido_sin_iva)}** neto. No es un costo perdido: esas retenciones son un **anticipo** que descontás en tu declaración de renta anual.`;
  }
  const _insight = {
    title: "Qué pasa con tu honorario",
    text: insight_text,
    tone: insight_tone,
    icon: "🇨🇴",
  };

  // Gráfico: cómo se reparte la base entre neto y retenciones (anticipo)
  let _chart: any = undefined;
  if (total_retenciones > 0 && neto_recibido_sin_iva >= 0) {
    const slices = [
      { label: "Neto en tu bolsillo", value: Math.round(neto_recibido_sin_iva) },
      { label: "Retención renta (11%)", value: Math.round(retencion_renta) },
    ];
    if (retencion_ica > 0) slices.push({ label: "Retención ICA", value: Math.round(retencion_ica) });
    if (retencion_reteiva > 0) slices.push({ label: "ReteIVA", value: Math.round(retencion_reteiva) });
    _chart = {
      type: "doughnut",
      slices,
      prefix: "$",
      centerValue: fmtCOP(base_retencion),
      centerLabel: "Base honorario",
      ariaLabel: `De ${fmtCOP(base_retencion)} de base, ${fmtCOP(neto_recibido_sin_iva)} quedan netos y ${fmtCOP(total_retenciones)} son retenciones (anticipo de impuestos).`,
    };
  }

  return {
    base_retencion,
    iva_honorario,
    retencion_renta,
    porcentaje_renta_aplicado: Math.round(porcentaje_renta_aplicado * 10000) / 100,
    tarifa_ica: tarifa_ica_desc,
    retencion_ica,
    retencion_reteiva,
    total_retenciones,
    neto_recibido_sin_iva,
    total_facturado,
    efectivo_neto_total,
    tasa_retencion_efectiva,
    periodicidad_declaracion_resultado,
    obligaciones_complementarias,
    _insight,
    _chart
  };
}
