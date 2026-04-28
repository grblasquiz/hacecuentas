export interface Inputs {
  tipo_infraccion: string;
  utm_valor: number;
  dias_pago: number;
  region?: string;
  tiene_antecedentes?: string;
}

export interface Outputs {
  monto_multa_base: number;
  monto_multa_final: number;
  recargo_tardio: number;
  total_pagar: number;
  clasificacion: string;
  juzgado_competente: string;
  plazo_pago_sin_recargo: string;
  notas_recurso: string;
}

export function compute(inputs: Inputs): Outputs {
  // Constantes de coeficientes UTM según Código de Tránsito Ley 18.290
  const coeficientes: { [key: string]: { valor: number; clasificacion: string } } = {
    exceso_velocidad_mayor_70: { valor: 2, clasificacion: "Gravísima" },
    exceso_velocidad_50_70: { valor: 1.5, clasificacion: "Gravísima" },
    no_respetar_luz_roja: { valor: 1.5, clasificacion: "Gravísima" },
    conducir_bajo_influencia: { valor: 2, clasificacion: "Gravísima" },
    no_usar_cinturon: { valor: 0.6, clasificacion: "Grave" },
    usar_celular: { valor: 0.6, clasificacion: "Grave" },
    no_respetar_paso_peatonal: { valor: 1, clasificacion: "Grave" },
    estacionamiento_prohibido: { valor: 0.5, clasificacion: "Menos grave" },
    falta_documentacion: { valor: 0.5, clasificacion: "Menos grave" },
    conduccion_sin_permiso: { valor: 1.5, clasificacion: "Gravísima" },
    exceso_carga: { valor: 0.8, clasificacion: "Grave" },
    falla_sistema_seguridad: { valor: 0.8, clasificacion: "Grave" }
  };

  // Mapa de regiones a juzgados de policía
  const juzgadosPorRegion: { [key: string]: string } = {
    "arica-parinacota": "Juzgado de Policía Local de Arica",
    "tarapaca": "Juzgado de Policía Local de Iquique",
    "antofagasta": "Juzgado de Policía Local de Antofagasta",
    "atacama": "Juzgado de Policía Local de Copiapó",
    "coquimbo": "Juzgado de Policía Local de La Serena",
    "valparaiso": "Juzgado de Policía Local de Valparaíso",
    "metropolitana": "Juzgado de Policía Local de Santiago (según comuna)",
    "ohiggins": "Juzgado de Policía Local de Rancagua",
    "maule": "Juzgado de Policía Local de Talca",
    "nuble": "Juzgado de Policía Local de Chillán",
    "biobio": "Juzgado de Policía Local de Concepción",
    "araucania": "Juzgado de Policía Local de Temuco",
    "losrios": "Juzgado de Policía Local de Valdivia",
    "loslagos": "Juzgado de Policía Local de Puerto Montt",
    "aysen": "Juzgado de Policía Local de Coyhaique",
    "magallanes": "Juzgado de Policía Local de Punta Arenas"
  };

  // Validar entrada
  const coef = coeficientes[inputs.tipo_infraccion];
  if (!coef) {
    return {
      monto_multa_base: 0,
      monto_multa_final: 0,
      recargo_tardio: 0,
      total_pagar: 0,
      clasificacion: "Error: tipo de infracción no válido",
      juzgado_competente: "N/A",
      plazo_pago_sin_recargo: "N/A",
      notas_recurso: "N/A"
    };
  }

  // Cálculo de multa base
  // Fórmula: Multa base = UTM × coeficiente según infracción
  const multa_base = Math.round(inputs.utm_valor * coef.valor);

  // Cálculo de recargo por pago tardío
  // Si días_pago > 30, se aplica 50% de aumento
  const tiene_recargo = inputs.dias_pago > 30;
  const recargo_tardio = tiene_recargo ? Math.round(multa_base * 0.5) : 0;

  // Multa final (sin considerar reincidencia en este cálculo base)
  // La reincidencia se notifica en notas_recurso
  const multa_final_sin_reincidencia = multa_base + recargo_tardio;

  // Aplicar aumento por reincidencia (50%) si aplica
  const tiene_reincidencia = inputs.tiene_antecedentes === "si";
  const multa_final = tiene_reincidencia
    ? Math.round(multa_final_sin_reincidencia * 1.5)
    : multa_final_sin_reincidencia;

  const total_pagar = multa_final;

  // Juzgado competente
  const juzgado = inputs.region
    ? juzgadosPorRegion[inputs.region] || "Juzgado de Policía Local de tu comuna"
    : "Juzgado de Policía Local de tu comuna";

  // Plazo pago sin recargo
  const plazo_pago_sin_recargo = "30 días desde notificación oficial";

  // Notas de recurso y advertencias
  let notas_recurso = "";
  notas_recurso += "**Opciones de recurso**: (1) Reposición ante autoridad notificante (15 días), ";
  notas_recurso += "(2) Apelación ante Juzgado de Policía (30 días), (3) Recurso de Protección ante Corte de Apelaciones si hay vulneración de derechos. ";

  if (tiene_reincidencia) {
    notas_recurso += "⚠️ REINCIDENCIA: Se aplicó aumento del 50% por antecedentes en último año. El juez puede validar en apelación. ";
  }

  if (tiene_recargo) {
    notas_recurso += "⚠️ PAGO TARDÍO: Se aplicó recargo del 50% por pago después de 30 días. ";
  }

  if (
    inputs.tipo_infraccion === "conducir_bajo_influencia" ||
    inputs.tipo_infraccion === "conduccion_sin_permiso"
  ) {
    notas_recurso += "⚠️ GRAVÍSIMA: Esta infracción puede causar caducidad de licencia. Consulta con abogado especializado. ";
  }

  notas_recurso += "Plazo prescripción deuda: 3 años. Verifica actualización UTM mensual en SII.";

  return {
    monto_multa_base: multa_base,
    monto_multa_final: multa_final_sin_reincidencia,
    recargo_tardio: recargo_tardio,
    total_pagar: total_pagar,
    clasificacion: coef.clasificacion,
    juzgado_competente: juzgado,
    plazo_pago_sin_recargo: plazo_pago_sin_recargo,
    notas_recurso: notas_recurso
  };
}
