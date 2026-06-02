export interface Inputs {
  deuda_acumulada: number;
  meses_atraso: number;
  pension_mensual_fijada: number;
  fecha_primer_incumplimiento?: string;
  tiene_sentencia_firme: boolean;
}

export interface Outputs {
  deuda_actual_con_intereses: number;
  intereses_generados: number;
  tasa_interes_aplicada: number;
  meses_mora_calculados: number;
  sanciones_aplicables: string;
  retenciones_impuestos: number;
  esta_en_registro_deudores: boolean;
  prohibicion_salida_pais: boolean;
  resolucion_pago_sugerida: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Fuentes: Código Civil Art. 22, Ley 21.389, Ley 20.255
  const TASA_INTERES_ANUAL = 0.27; // 27% anual - Art. 22 inciso 4 Código Civil
  const UMBRAL_REGISTRO_DEUDORES_MESES = 2; // Art. 8 Ley 21.389
  const UMBRAL_PROHIBICION_MESES = 3; // Art. 86 Ley 20.255
  const UMBRAL_PROHIBICION_DINERO = 300000; // $ - Art. 86 Ley 20.255
  const PORCENTAJE_RETENCION_IMPUESTOS = 0.5; // 50% máximo - Art. 174 Ley 20.255
  const DIAS_AÑO = 365;
  const MESES_AÑO = 12;

  // Validaciones básicas
  const deuda = Math.max(0, i.deuda_acumulada);
  const meses = Math.max(0, i.meses_atraso);
  const pension = Math.max(0, i.pension_mensual_fijada);
  const tiene_sentencia = i.tiene_sentencia_firme === true;

  // 1. Cálculo de intereses legales (simple, no capitalizado)
  // Fórmula: Intereses = Capital × (Tasa anual × Meses / 12)
  const intereses = deuda * (TASA_INTERES_ANUAL * meses / MESES_AÑO);
  const deuda_con_intereses = deuda + intereses;

  // 2. Determinación de sanciones por plazo
  const esta_en_registro = meses >= UMBRAL_REGISTRO_DEUDORES_MESES;
  const tiene_prohibicion = meses >= UMBRAL_PROHIBICION_MESES || 
                           deuda_con_intereses >= UMBRAL_PROHIBICION_DINERO;

  // 3. Construcción de sanciones aplicables (texto descriptivo)
  let sanciones_texto = "Ninguna (< 2 meses atraso)";
  if (tiene_sentencia) {
    const sanciones_list: string[] = [];
    
    if (esta_en_registro) {
      sanciones_list.push("Inscripción en Registro Nacional Deudores Alimentos (SII)");
      sanciones_list.push("Retención automática devolución impuesto Renta (hasta 50%)");
      sanciones_list.push("Retenciones bancarias por embargo");
    }
    
    if (tiene_prohibicion) {
      sanciones_list.push("Prohibición de salida del país (Policía Internacional)");
      sanciones_list.push("Bloqueo pasaporte");
      sanciones_list.push("Reporte antecedentes comerciales");
    }
    
    if (deuda_con_intereses >= 300000) {
      if (!sanciones_list.includes("Prohibición de salida del país (Policía Internacional)")) {
        sanciones_list.push("Prohibición de salida del país por monto (Policía Internacional)");
        sanciones_list.push("Inhibición de bienes raíces");
      }
    }
    
    sanciones_texto = sanciones_list.length > 0 
      ? sanciones_list.join("; ")
      : "Sanciones aplicables según mora acumulada";
  } else {
    sanciones_texto = "No aplicables: falta sentencia firme";
  }

  // 4. Cálculo retención impuestos (máximo 50% sobre deuda actualizada)
  const retenciones = Math.min(
    deuda_con_intereses * PORCENTAJE_RETENCION_IMPUESTOS,
    deuda_con_intereses
  );

  // 5. Resolución de pago sugerida
  let resolucion = "";
  if (deuda_con_intereses === 0) {
    resolucion = "Sin deuda. Situación regular.";
  } else if (meses === 0) {
    resolucion = "Pago total de $" + deuda_con_intereses.toLocaleString('es-CL', { maximumFractionDigits: 0 }) + " para evitar mora.";
  } else if (meses >= 1 && meses < 2) {
    resolucion = "Pago urgente antes de mes 2. Deuda: $" + deuda_con_intereses.toLocaleString('es-CL', { maximumFractionDigits: 0 }) + ". A partir de mes 2 se registra en Deudores.";
  } else if (meses >= 2 && meses < 3) {
    resolucion = "Ya registrado en Deudores (mes 2+). Opciones: (A) Pago total $" + deuda_con_intereses.toLocaleString('es-CL', { maximumFractionDigits: 0 }) + "; (B) Cuotas con tribunal; (C) Solicitar remisión intereses (requiere 3 cuotas previas).";
  } else {
    resolucion = "Mora crítica (3+ meses). Prohibición salida país activa. Recomendado: acudir tribunal para acuerdo de cuotas o solicitar remisión condicionada. Retenciones automáticas hasta $" + retenciones.toLocaleString('es-CL', { maximumFractionDigits: 0 }) + ".";
  }

  const fmtCLP = (v: number) =>
    '$' + Math.round(v).toLocaleString('es-CL', { maximumFractionDigits: 0 });
  const registro_efectivo = esta_en_registro && tiene_sentencia;
  const prohibicion_efectiva = tiene_prohibicion && tiene_sentencia;

  // Insight dinámico según gravedad de la mora
  let _insight: any;
  if (deuda <= 0) {
    _insight = {
      title: 'Sin deuda registrada',
      text: 'No hay deuda acumulada: tu situación de pensión de alimentos está al día.',
      tone: 'good',
      icon: '✅',
    };
  } else if (!tiene_sentencia) {
    _insight = {
      title: 'Deuda sin sentencia firme',
      text: `La deuda actualizada es de **${fmtCLP(deuda_con_intereses)}** (intereses: **${fmtCLP(intereses)}**), pero sin sentencia firme aún no aplican el Registro de Deudores ni las sanciones.`,
      tone: 'warn',
      icon: '📄',
    };
  } else if (prohibicion_efectiva) {
    _insight = {
      title: 'Mora crítica con prohibición de salida',
      text: `Con **${Math.floor(meses)} meses** de atraso la deuda llega a **${fmtCLP(deuda_con_intereses)}**. Ya corresponde Registro de Deudores y **prohibición de salida del país**, más retención de hasta **${fmtCLP(retenciones)}** en tu devolución de impuestos.`,
      tone: 'warn',
      icon: '🚫',
    };
  } else if (registro_efectivo) {
    _insight = {
      title: 'Inscripción en el Registro de Deudores',
      text: `Con **${Math.floor(meses)} meses** de atraso (deuda **${fmtCLP(deuda_con_intereses)}**) ya estás en el Registro Nacional de Deudores de Alimentos, con retención automática de hasta el 50% de tu devolución de impuestos.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    _insight = {
      title: 'Atraso inicial: aún a tiempo',
      text: `Llevás **${Math.floor(meses)} mes(es)** de atraso y la deuda con intereses es de **${fmtCLP(deuda_con_intereses)}**. Pagando antes del mes 2 evitás entrar al Registro de Deudores.`,
      tone: 'warn',
      icon: '⏰',
    };
  }

  // Donut: capital adeudado + intereses (suman la deuda actualizada)
  let _chart: any = undefined;
  if (deuda > 0 && intereses > 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Capital adeudado', value: Math.round(deuda) },
        { label: 'Intereses (27% anual)', value: Math.round(intereses) },
      ],
      prefix: '$',
      centerValue: fmtCLP(Math.round(deuda) + Math.round(intereses)),
      centerLabel: 'Deuda total',
      ariaLabel: 'Composición de la deuda de pensión de alimentos entre capital e intereses',
    };
  }

  return {
    deuda_actual_con_intereses: Math.round(deuda_con_intereses),
    intereses_generados: Math.round(intereses),
    tasa_interes_aplicada: TASA_INTERES_ANUAL * 100, // retorna como %
    meses_mora_calculados: Math.floor(meses),
    sanciones_aplicables: sanciones_texto,
    retenciones_impuestos: Math.round(retenciones),
    esta_en_registro_deudores: registro_efectivo,
    prohibicion_salida_pais: prohibicion_efectiva,
    resolucion_pago_sugerida: resolucion,
    _insight,
    ...(_chart ? { _chart } : {})
  };
}
