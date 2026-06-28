export interface Inputs {
  ingreso_mensual_bruto: number;
  tiene_carga_familiar: boolean;
  num_consultas_anuales: number;
  num_examenes_anuales: number;
  comparar_isapre: boolean;
}

export interface Outputs {
  tramo_fonasa: string;
  descripcion_tramo: string;
  cotizacion_fonasa_mensual: number;
  copago_porcentaje: number;
  mai_2026: number;
  costo_consulta_estimada: number;
  gasto_anual_consultas: number;
  costo_anual_fonasa: number;
  costo_isapre_estimado: number;
  ahorro_fonasa_vs_isapre: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).comparar_isapre = (i as any).comparar_isapre === true || (i as any).comparar_isapre === 'true';
  // Constantes 2026 Chile (SII, SuperSalud)
  const UF_2026 = 780000; // UF promedio 2026 (referencia SII)
  const TRAMO_B_LIMITE = UF_2026 * 0.5; // ~$390.000
  const TRAMO_D_LIMITE = UF_2026 * 1.0; // ~$780.000
  const MAI_2026 = 65000; // Módulo Arancel Institucional 2026
  const COTIZACION_FONASA_PCT = 0.07; // 7% del sueldo (tramos C y D)
  
  // Aranceles base (referencia MAI)
  const COSTO_CONSULTA_BASE = MAI_2026 * 0.4; // ~$26.000
  const COSTO_EXAMEN_BASE = MAI_2026 * 0.3; // ~$19.500
  
  // Isapre (referencia promedio)
  const PRIMA_ISAPRE_MENSUAL = 110000; // Plan B/C promedio
  const COASEGURO_ISAPRE_PCT = 0.1; // 10% adicional
  
  let tramo_fonasa = "";
  let copago_porcentaje = 0;
  let descripcion_tramo = "";
  
  // Determinar tramo
  if (i.ingreso_mensual_bruto <= 0) {
    tramo_fonasa = "A";
    copago_porcentaje = 0;
    descripcion_tramo = "Tramo A: indigente o sin ingresos. Cobertura Fonasa 100% (gratuito). Requiere acreditación en Fonasa local.";
  } else if (i.ingreso_mensual_bruto <= TRAMO_B_LIMITE) {
    tramo_fonasa = "B";
    copago_porcentaje = 0;
    descripcion_tramo = `Tramo B: ingreso < $${TRAMO_B_LIMITE.toLocaleString("es-CL")}. Cobertura Fonasa 100% (gratuito o aporte voluntario mínimo).`;
  } else if (i.ingreso_mensual_bruto <= TRAMO_D_LIMITE) {
    tramo_fonasa = "C";
    copago_porcentaje = 10;
    descripcion_tramo = `Tramo C: ingreso entre $${TRAMO_B_LIMITE.toLocaleString("es-CL")} y $${TRAMO_D_LIMITE.toLocaleString("es-CL")}. Copago 10% en consultas y exámenes.`;
  } else {
    tramo_fonasa = "D";
    copago_porcentaje = 20;
    descripcion_tramo = `Tramo D: ingreso > $${TRAMO_D_LIMITE.toLocaleString("es-CL")}. Copago 20% en consultas y exámenes.`;
  }
  
  // Cotización Fonasa (solo tramos C y D)
  const cotizacion_fonasa_mensual =
    tramo_fonasa === "A" || tramo_fonasa === "B"
      ? 0
      : Math.round(i.ingreso_mensual_bruto * COTIZACION_FONASA_PCT);
  
  // Costo consulta con copago
  const costo_base_consulta = COSTO_CONSULTA_BASE;
  const costo_consulta_con_copago = Math.round(
    costo_base_consulta * (1 + copago_porcentaje / 100)
  );
  const costo_consulta_estimada = Math.round(
    costo_base_consulta + costo_base_consulta * (copago_porcentaje / 100)
  );
  
  // Costo examen con copago
  const costo_base_examen = COSTO_EXAMEN_BASE;
  const costo_examen_con_copago = Math.round(
    costo_base_examen * (1 + copago_porcentaje / 100)
  );
  
  // Gasto anual consultas + exámenes
  const gasto_consultas = costo_consulta_con_copago * i.num_consultas_anuales;
  const gasto_examenes = costo_examen_con_copago * i.num_examenes_anuales;
  const gasto_anual_consultas = gasto_consultas + gasto_examenes;
  
  // Costo anual Fonasa (cotización + copagos)
  const costo_anual_cotizacion = cotizacion_fonasa_mensual * 12;
  const costo_anual_fonasa = costo_anual_cotizacion + gasto_anual_consultas;
  
  // Costo Isapre estimado
  const costo_anual_prima_isapre = PRIMA_ISAPRE_MENSUAL * 12;
  const costo_anual_coaseguro = Math.round(gasto_anual_consultas * COASEGURO_ISAPRE_PCT);
  const costo_isapre_estimado = costo_anual_prima_isapre + costo_anual_coaseguro;
  
  // Diferencia
  const ahorro_fonasa_vs_isapre = costo_isapre_estimado - costo_anual_fonasa;
  
  // Recomendación
  let recomendacion = "";
  if (tramo_fonasa === "A" || tramo_fonasa === "B") {
    recomendacion = `Estás en Tramo ${tramo_fonasa}: tienes cobertura Fonasa gratuita. Mantente afiliado a menos que tengas ingresos mayores o necesites red más amplia (Isapre).`;
  } else if (tramo_fonasa === "C") {
    if (ahorro_fonasa_vs_isapre > 0) {
      recomendacion = `Tramo C con copago 10%. Fonasa es $${ahorro_fonasa_vs_isapre.toLocaleString("es-CL")}/año más barato que Isapre promedio. Recomendado: mantener Fonasa.`;
    } else {
      recomendacion = `Tramo C con copago 10%. Isapre podría ser comparable o ligeramente más barata. Compara planes específicos con tu Isapre de interés.`;
    }
  } else {
    if (ahorro_fonasa_vs_isapre > 500000) {
      recomendacion = `Tramo D con copago 20%. Fonasa sigue siendo $${ahorro_fonasa_vs_isapre.toLocaleString("es-CL")}/año más barato. Pero con ingreso alto, Isapre puede ofrecer servicios premium (segundas opiniones, especialistas privados).`;
    } else {
      recomendacion = `Tramo D con copago 20%. Isapre y Fonasa tienen costos similares. Tu elección dependerá de preferencia de red (privada vs. pública) y servicios adicionales.`;
    }
  }
  
  // Insight: tramo y costo según cobertura
  const fmtCL = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  let _insight: any;
  if (tramo_fonasa === 'A' || tramo_fonasa === 'B') {
    _insight = {
      title: `Tramo ${tramo_fonasa}: cobertura gratuita`,
      text: `Quedás en **Tramo ${tramo_fonasa}** con **0% de copago**: tu atención en la red pública es **gratuita** (sin cotización extra ni pago por consulta).`,
      tone: 'good',
      icon: '🩺'
    };
  } else {
    const ahorroTxt = i.comparar_isapre
      ? (ahorro_fonasa_vs_isapre > 0
          ? ` Frente a una Isapre promedio ahorrás **${fmtCL(ahorro_fonasa_vs_isapre)}/año**.`
          : ` En tu caso una Isapre podría costar parecido o menos: compará planes concretos.`)
      : ``;
    _insight = {
      title: `Tramo ${tramo_fonasa}: copago ${copago_porcentaje}%`,
      text: `Estás en **Tramo ${tramo_fonasa}** con **${copago_porcentaje}% de copago**. Entre cotización (**${fmtCL(costo_anual_cotizacion)}/año**) y atenciones, tu costo anual estimado es **${fmtCL(costo_anual_fonasa)}**.` + ahorroTxt,
      tone: i.comparar_isapre && ahorro_fonasa_vs_isapre <= 0 ? 'warn' : 'neutral',
      icon: '🩺'
    };
  }

  // Donut: costo anual Fonasa = cotización + atenciones (consultas+exámenes)
  const _chart = costo_anual_fonasa > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Cotización (7%)', value: Math.round(costo_anual_cotizacion) },
      { label: 'Consultas + exámenes', value: Math.round(gasto_anual_consultas) }
    ].filter(s => s.value > 0),
    prefix: '$',
    centerValue: fmtCL(costo_anual_fonasa),
    centerLabel: 'Costo anual',
    ariaLabel: `Costo anual Fonasa ${fmtCL(costo_anual_fonasa)}: ${fmtCL(costo_anual_cotizacion)} de cotización y ${fmtCL(gasto_anual_consultas)} en consultas y exámenes.`
  } : undefined;

  return {
    tramo_fonasa,
    descripcion_tramo,
    cotizacion_fonasa_mensual,
    copago_porcentaje,
    mai_2026: MAI_2026,
    costo_consulta_estimada,
    gasto_anual_consultas,
    costo_anual_fonasa,
    costo_isapre_estimado: i.comparar_isapre ? costo_isapre_estimado : 0,
    ahorro_fonasa_vs_isapre: i.comparar_isapre ? ahorro_fonasa_vs_isapre : 0,
    recomendacion,
    _insight,
    ...(_chart && _chart.slices.length >= 2 ? { _chart } : {})
  };
}
