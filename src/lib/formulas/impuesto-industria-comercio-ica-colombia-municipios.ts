export interface Inputs {
  ingresos_brutos: number;
  municipio: string;
  actividad_economica: string;
  es_gran_contribuyente: string;
  periodicidad: string;
}

export interface Outputs {
  ica_basico: number;
  tarifa_aplicada: number;
  ica_total_periodo: number;
  ica_anual_estimado: number;
  retencion_ica: number;
  mensaje_obligaciones: string;
}

// Tarifas por mil (‰) según municipio y actividad económica (2026)
const TARIFAS_ICA: Record<string, Record<string, number>> = {
  bogota: {
    comercio_general: 8.48,
    restaurantes_cafes: 8.48,
    hoteles: 8.48,
    transporte: 6.90,
    servicios_profesionales: 4.14,
    salud: 6.90,
    educacion: 0,
    telecomunicaciones: 6.90,
    energeticos: 6.90,
    agua_saneamiento: 0,
    financiero: 6.90,
    manufactura: 4.14,
    construccion: 8.48,
    inmuebles: 6.90,
    tecnologia: 4.14,
    agricultura: 2.07,
    mineria: 4.14,
    cultura_entretenimiento: 6.90,
    belleza: 8.48,
    otro: 6.90
  },
  medellin: {
    comercio_general: 5.0,
    restaurantes_cafes: 4.5,
    hoteles: 4.0,
    transporte: 3.0,
    servicios_profesionales: 3.0,
    salud: 3.5,
    educacion: 0,
    telecomunicaciones: 3.5,
    energeticos: 3.5,
    agua_saneamiento: 0,
    financiero: 3.5,
    manufactura: 2.5,
    construccion: 4.5,
    inmuebles: 3.0,
    tecnologia: 2.0,
    agricultura: 0,
    mineria: 2.0,
    cultura_entretenimiento: 3.5,
    belleza: 4.5,
    otro: 3.5
  },
  cali: {
    comercio_general: 5.0,
    restaurantes_cafes: 4.5,
    hoteles: 4.0,
    transporte: 3.0,
    servicios_profesionales: 3.0,
    salud: 3.5,
    educacion: 0,
    telecomunicaciones: 3.5,
    energeticos: 3.5,
    agua_saneamiento: 0,
    financiero: 3.5,
    manufactura: 3.0,
    construccion: 4.5,
    inmuebles: 3.5,
    tecnologia: 2.5,
    agricultura: 0,
    mineria: 2.5,
    cultura_entretenimiento: 4.0,
    belleza: 5.0,
    otro: 3.5
  },
  barranquilla: {
    comercio_general: 5.0,
    restaurantes_cafes: 4.0,
    hoteles: 3.5,
    transporte: 2.5,
    servicios_profesionales: 2.5,
    salud: 3.0,
    educacion: 0,
    telecomunicaciones: 3.0,
    energeticos: 3.0,
    agua_saneamiento: 0,
    financiero: 3.0,
    manufactura: 2.5,
    construccion: 4.0,
    inmuebles: 3.0,
    tecnologia: 2.0,
    agricultura: 0,
    mineria: 2.0,
    cultura_entretenimiento: 3.5,
    belleza: 4.5,
    otro: 3.0
  },
  bucaramanga: {
    comercio_general: 4.0,
    restaurantes_cafes: 3.5,
    hoteles: 3.0,
    transporte: 2.0,
    servicios_profesionales: 2.0,
    salud: 2.5,
    educacion: 0,
    telecomunicaciones: 2.5,
    energeticos: 2.5,
    agua_saneamiento: 0,
    financiero: 2.5,
    manufactura: 2.0,
    construccion: 3.5,
    inmuebles: 2.5,
    tecnologia: 1.5,
    agricultura: 0,
    mineria: 1.5,
    cultura_entretenimiento: 2.5,
    belleza: 3.5,
    otro: 2.5
  },
  cartagena: {
    comercio_general: 4.5,
    restaurantes_cafes: 4.0,
    hoteles: 3.5,
    transporte: 2.5,
    servicios_profesionales: 2.5,
    salud: 3.0,
    educacion: 0,
    telecomunicaciones: 3.0,
    energeticos: 3.0,
    agua_saneamiento: 0,
    financiero: 3.0,
    manufactura: 2.5,
    construccion: 4.0,
    inmuebles: 3.0,
    tecnologia: 2.0,
    agricultura: 0,
    mineria: 2.0,
    cultura_entretenimiento: 3.5,
    belleza: 4.0,
    otro: 3.0
  },
  santa_marta: {
    comercio_general: 4.0,
    restaurantes_cafes: 3.5,
    hoteles: 3.0,
    transporte: 2.0,
    servicios_profesionales: 2.0,
    salud: 2.5,
    educacion: 0,
    telecomunicaciones: 2.5,
    energeticos: 2.5,
    agua_saneamiento: 0,
    financiero: 2.5,
    manufactura: 2.0,
    construccion: 3.5,
    inmuebles: 2.5,
    tecnologia: 1.5,
    agricultura: 0,
    mineria: 1.5,
    cultura_entretenimiento: 2.5,
    belleza: 3.5,
    otro: 2.5
  },
  pereira: {
    comercio_general: 4.0,
    restaurantes_cafes: 3.5,
    hoteles: 3.0,
    transporte: 2.0,
    servicios_profesionales: 2.0,
    salud: 2.5,
    educacion: 0,
    telecomunicaciones: 2.5,
    energeticos: 2.5,
    agua_saneamiento: 0,
    financiero: 2.5,
    manufactura: 2.0,
    construccion: 3.5,
    inmuebles: 2.5,
    tecnologia: 1.5,
    agricultura: 0,
    mineria: 1.5,
    cultura_entretenimiento: 2.5,
    belleza: 3.5,
    otro: 2.5
  },
  manizales: {
    comercio_general: 4.0,
    restaurantes_cafes: 3.5,
    hoteles: 3.0,
    transporte: 2.0,
    servicios_profesionales: 2.0,
    salud: 2.5,
    educacion: 0,
    telecomunicaciones: 2.5,
    energeticos: 2.5,
    agua_saneamiento: 0,
    financiero: 2.5,
    manufactura: 2.0,
    construccion: 3.5,
    inmuebles: 2.5,
    tecnologia: 1.5,
    agricultura: 0,
    mineria: 1.5,
    cultura_entretenimiento: 2.5,
    belleza: 3.5,
    otro: 2.5
  },
  tunja: {
    comercio_general: 3.5,
    restaurantes_cafes: 3.0,
    hoteles: 2.5,
    transporte: 1.5,
    servicios_profesionales: 1.5,
    salud: 2.0,
    educacion: 0,
    telecomunicaciones: 2.0,
    energeticos: 2.0,
    agua_saneamiento: 0,
    financiero: 2.0,
    manufactura: 1.5,
    construccion: 3.0,
    inmuebles: 2.0,
    tecnologia: 1.0,
    agricultura: 0,
    mineria: 1.0,
    cultura_entretenimiento: 2.0,
    belleza: 3.0,
    otro: 2.0
  },
  ibague: {
    comercio_general: 4.0,
    restaurantes_cafes: 3.5,
    hoteles: 3.0,
    transporte: 2.0,
    servicios_profesionales: 2.0,
    salud: 2.5,
    educacion: 0,
    telecomunicaciones: 2.5,
    energeticos: 2.5,
    agua_saneamiento: 0,
    financiero: 2.5,
    manufactura: 2.0,
    construccion: 3.5,
    inmuebles: 2.5,
    tecnologia: 1.5,
    agricultura: 0,
    mineria: 1.5,
    cultura_entretenimiento: 2.5,
    belleza: 3.5,
    otro: 2.5
  },
  villavicencio: {
    comercio_general: 4.0,
    restaurantes_cafes: 3.5,
    hoteles: 3.0,
    transporte: 2.0,
    servicios_profesionales: 2.0,
    salud: 2.5,
    educacion: 0,
    telecomunicaciones: 2.5,
    energeticos: 2.5,
    agua_saneamiento: 0,
    financiero: 2.5,
    manufactura: 2.0,
    construccion: 3.5,
    inmuebles: 2.5,
    tecnologia: 1.5,
    agricultura: 0,
    mineria: 1.5,
    cultura_entretenimiento: 2.5,
    belleza: 3.5,
    otro: 2.5
  },
  popayan: {
    comercio_general: 3.5,
    restaurantes_cafes: 3.0,
    hoteles: 2.5,
    transporte: 1.5,
    servicios_profesionales: 1.5,
    salud: 2.0,
    educacion: 0,
    telecomunicaciones: 2.0,
    energeticos: 2.0,
    agua_saneamiento: 0,
    financiero: 2.0,
    manufactura: 1.5,
    construccion: 3.0,
    inmuebles: 2.0,
    tecnologia: 1.0,
    agricultura: 0,
    mineria: 1.0,
    cultura_entretenimiento: 2.0,
    belleza: 3.0,
    otro: 2.0
  },
  pasto: {
    comercio_general: 3.5,
    restaurantes_cafes: 3.0,
    hoteles: 2.5,
    transporte: 1.5,
    servicios_profesionales: 1.5,
    salud: 2.0,
    educacion: 0,
    telecomunicaciones: 2.0,
    energeticos: 2.0,
    agua_saneamiento: 0,
    financiero: 2.0,
    manufactura: 1.5,
    construccion: 3.0,
    inmuebles: 2.0,
    tecnologia: 1.0,
    agricultura: 0,
    mineria: 1.0,
    cultura_entretenimiento: 2.0,
    belleza: 3.0,
    otro: 2.0
  },
  monteria: {
    comercio_general: 4.0,
    restaurantes_cafes: 3.5,
    hoteles: 3.0,
    transporte: 2.0,
    servicios_profesionales: 2.0,
    salud: 2.5,
    educacion: 0,
    telecomunicaciones: 2.5,
    energeticos: 2.5,
    agua_saneamiento: 0,
    financiero: 2.5,
    manufactura: 2.0,
    construccion: 3.5,
    inmuebles: 2.5,
    tecnologia: 1.5,
    agricultura: 0,
    mineria: 1.5,
    cultura_entretenimiento: 2.5,
    belleza: 3.5,
    otro: 2.5
  },
  valledupar: {
    comercio_general: 3.5,
    restaurantes_cafes: 3.0,
    hoteles: 2.5,
    transporte: 1.5,
    servicios_profesionales: 1.5,
    salud: 2.0,
    educacion: 0,
    telecomunicaciones: 2.0,
    energeticos: 2.0,
    agua_saneamiento: 0,
    financiero: 2.0,
    manufactura: 1.5,
    construccion: 3.0,
    inmuebles: 2.0,
    tecnologia: 1.0,
    agricultura: 0,
    mineria: 1.0,
    cultura_entretenimiento: 2.0,
    belleza: 3.0,
    otro: 2.0
  },
  sincelejo: {
    comercio_general: 3.5,
    restaurantes_cafes: 3.0,
    hoteles: 2.5,
    transporte: 1.5,
    servicios_profesionales: 1.5,
    salud: 2.0,
    educacion: 0,
    telecomunicaciones: 2.0,
    energeticos: 2.0,
    agua_saneamiento: 0,
    financiero: 2.0,
    manufactura: 1.5,
    construccion: 3.0,
    inmuebles: 2.0,
    tecnologia: 1.0,
    agricultura: 0,
    mineria: 1.0,
    cultura_entretenimiento: 2.0,
    belleza: 3.0,
    otro: 2.0
  },
  riohacha: {
    comercio_general: 3.5,
    restaurantes_cafes: 3.0,
    hoteles: 2.5,
    transporte: 1.5,
    servicios_profesionales: 1.5,
    salud: 2.0,
    educacion: 0,
    telecomunicaciones: 2.0,
    energeticos: 2.0,
    agua_saneamiento: 0,
    financiero: 2.0,
    manufactura: 1.5,
    construccion: 3.0,
    inmuebles: 2.0,
    tecnologia: 1.0,
    agricultura: 0,
    mineria: 1.0,
    cultura_entretenimiento: 2.0,
    belleza: 3.0,
    otro: 2.0
  },
  arauca: {
    comercio_general: 3.0,
    restaurantes_cafes: 2.5,
    hoteles: 2.0,
    transporte: 1.0,
    servicios_profesionales: 1.0,
    salud: 1.5,
    educacion: 0,
    telecomunicaciones: 1.5,
    energeticos: 1.5,
    agua_saneamiento: 0,
    financiero: 1.5,
    manufactura: 1.0,
    construccion: 2.5,
    inmuebles: 1.5,
    tecnologia: 0.5,
    agricultura: 0,
    mineria: 0.5,
    cultura_entretenimiento: 1.5,
    belleza: 2.5,
    otro: 1.5
  },
  yopal: {
    comercio_general: 3.0,
    restaurantes_cafes: 2.5,
    hoteles: 2.0,
    transporte: 1.0,
    servicios_profesionales: 1.0,
    salud: 1.5,
    educacion: 0,
    telecomunicaciones: 1.5,
    energeticos: 1.5,
    agua_saneamiento: 0,
    financiero: 1.5,
    manufactura: 1.0,
    construccion: 2.5,
    inmuebles: 1.5,
    tecnologia: 0.5,
    agricultura: 0,
    mineria: 0.5,
    cultura_entretenimiento: 1.5,
    belleza: 2.5,
    otro: 1.5
  },
  inirida: {
    comercio_general: 3.0,
    restaurantes_cafes: 2.5,
    hoteles: 2.0,
    transporte: 1.0,
    servicios_profesionales: 1.0,
    salud: 1.5,
    educacion: 0,
    telecomunicaciones: 1.5,
    energeticos: 1.5,
    agua_saneamiento: 0,
    financiero: 1.5,
    manufactura: 1.0,
    construccion: 2.5,
    inmuebles: 1.5,
    tecnologia: 0.5,
    agricultura: 0,
    mineria: 0.5,
    cultura_entretenimiento: 1.5,
    belleza: 2.5,
    otro: 1.5
  },
  puerto_carreño: {
    comercio_general: 3.0,
    restaurantes_cafes: 2.5,
    hoteles: 2.0,
    transporte: 1.0,
    servicios_profesionales: 1.0,
    salud: 1.5,
    educacion: 0,
    telecomunicaciones: 1.5,
    energeticos: 1.5,
    agua_saneamiento: 0,
    financiero: 1.5,
    manufactura: 1.0,
    construccion: 2.5,
    inmuebles: 1.5,
    tecnologia: 0.5,
    agricultura: 0,
    mineria: 0.5,
    cultura_entretenimiento: 1.5,
    belleza: 2.5,
    otro: 1.5
  },
  leticia: {
    comercio_general: 3.0,
    restaurantes_cafes: 2.5,
    hoteles: 2.0,
    transporte: 1.0,
    servicios_profesionales: 1.0,
    salud: 1.5,
    educacion: 0,
    telecomunicaciones: 1.5,
    energeticos: 1.5,
    agua_saneamiento: 0,
    financiero: 1.5,
    manufactura: 1.0,
    construccion: 2.5,
    inmuebles: 1.5,
    tecnologia: 0.5,
    agricultura: 0,
    mineria: 0.5,
    cultura_entretenimiento: 1.5,
    belleza: 2.5,
    otro: 1.5
  }
};

// Mensajes obligaciones según si es gran contribuyente
const MENSAJE_GRAN_CONTRIBUYENTE = `**Eres gran contribuyente (RUT):**
- Obligación de actuar como **agente de retención de ICA**
- Retiene el 50% del ICA a tus proveedores/contratistas
- Presentar declaraciones **mensuales certificadas** (no bimestrales)
- Contraseña de acceso a sistemas tributarios municipales
- Auditoría fiscal especial y revisión permanente
- Plazos de pago más estrictos (sin prórroga)`;

const MENSAJE_CONTRIBUYENTE_ORDINARIO = `**Eres contribuyente ordinario:**
- Obligación de **declarar mensual o bimestralmente** según municipio
- **No es agente de retención** (no retienes ICA a otros)
- Pago directo a la administración tributaria municipal
- Puedes solicitar prórrogas en casos justificados
- Revisión ordinaria según planes de auditoría`;

export function compute(i: Inputs): Outputs {
  // Obtener tarifa aplicable
  const tarifasDelMunicipio = TARIFAS_ICA[i.municipio] || {};
  let tarifa_aplicada = tarifasDelMunicipio[i.actividad_economica] ?? 3.5; // Tarifa promedio por defecto

  // Si no hay datos para el municipio, usar tarifa promedio nacional
  if (!TARIFAS_ICA[i.municipio]) {
    tarifa_aplicada = 3.5;
  }

  // Cálculo ICA mensual básico
  // Fórmula: (Ingresos Brutos × Tarifa por mil) / 1.000
  const ica_basico = Math.round((i.ingresos_brutos * tarifa_aplicada) / 1000);

  // Cálculo ICA por período (mensual o bimestral)
  let ica_total_periodo = ica_basico;
  if (i.periodicidad === "bimestral") {
    ica_total_periodo = ica_basico * 2;
  }

  // Cálculo ICA anual estimado (12 meses de cuota mensual)
  const ica_anual_estimado = ica_basico * 12;

  // Cálculo retención ICA si es gran contribuyente
  let retencion_ica = 0;
  if (i.es_gran_contribuyente === "si") {
    // Retienen el 50% del ICA mensual base a sus proveedores
    retencion_ica = Math.round(ica_basico * 0.5);
  }

  // Mensaje de obligaciones según clasificación tributaria
  let mensaje_obligaciones = "";
  if (i.es_gran_contribuyente === "si") {
    mensaje_obligaciones = MENSAJE_GRAN_CONTRIBUYENTE;
  } else {
    mensaje_obligaciones = MENSAJE_CONTRIBUYENTE_ORDINARIO;
  }

  return {
    ica_basico,
    tarifa_aplicada,
    ica_total_periodo,
    ica_anual_estimado,
    retencion_ica,
    mensaje_obligaciones
  };
}
