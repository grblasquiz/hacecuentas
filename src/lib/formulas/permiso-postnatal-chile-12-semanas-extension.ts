export interface Inputs {
  salario_mensual: number;
  fecha_parto: string;
  modalidad_permiso: 'completa_12' | 'media_18';
  semanas_extension?: number;
  es_padre?: boolean;
  semanas_padre?: number;
}

export interface Outputs {
  dias_postnatal_total: number;
  semanas_total: number;
  fecha_inicio: string;
  fecha_termino: string;
  subsidio_diario: number;
  subsidio_mensual: number;
  subsidio_total: number;
  salario_media_jornada: number;
  resumen_modalidad: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile
  const UF_2026 = 36850; // Valor UF promedio 2026 (pesos)
  const TOPE_UF_SUBSIDIO = 73.2; // UF máximas de subsidio postnatal
  const TOPE_SUBSIDIO_DIARIO = TOPE_UF_SUBSIDIO * UF_2026; // ~$2.700.000 pesos
  
  // Semanas base de permiso
  const SEMANAS_BASE = 12;
  const SEMANAS_EXTENSION_MAX = 12;
  const SEMANAS_TRANSFERENCIA_PADRE = 6; // Máximo que puede ceder la madre al padre
  const SEMANAS_MEDIA_JORNADA = 18;
  
  // Parseo de inputs
  const salarioMensual = i.salario_mensual || 0;
  const fechaParto = new Date(i.fecha_parto);
  const modalidad = i.modalidad_permiso || 'completa_12';
  const semanasExtension = Math.min(i.semanas_extension || 0, SEMANAS_EXTENSION_MAX);
  const esPadre = i.es_padre || false;
  const semanasPadre = esPadre ? Math.min(i.semanas_padre || 0, SEMANAS_TRANSFERENCIA_PADRE) : 0;
  
  // Cálculo de días según modalidad
  let diasTotales = 0;
  let semanasTotal = 0;
  let salarioAplicable = salarioMensual;
  
  if (modalidad === 'completa_12') {
    // 12 semanas base (84 días) + extensión parental (si aplica)
    const diasBase = SEMANAS_BASE * 7; // 84 días
    const diasExtension = semanasExtension * 7; // 0 a 84 días
    diasTotales = diasBase + diasExtension;
    semanasTotal = SEMANAS_BASE + semanasExtension;
  } else if (modalidad === 'media_18') {
    // 18 semanas (126 días) al 50% del salario
    diasTotales = SEMANAS_MEDIA_JORNADA * 7; // 126 días
    semanasTotal = SEMANAS_MEDIA_JORNADA;
    salarioAplicable = salarioMensual * 0.5; // 50% del salario
  }
  
  // Si es padre que recibe permiso, ajustamos días (pero para el cálculo, es subsidiado igual)
  if (esPadre && semanasPadre > 0) {
    // El permiso del padre es parte de lo que cede la madre, ya contado en diasTotales si es modalidad completa
    // Este campo es informativo; el subsidio sigue siendo el mismo
  }
  
  // Cálculo del subsidio
  const salarioDiario = salarioAplicable / 30; // Promedio diario
  const subsidioDiario = Math.min(salarioDiario, TOPE_SUBSIDIO_DIARIO);
  const subsidioMensual = subsidioDiario * 30;
  const subsidioTotal = subsidioDiario * diasTotales;
  
  // Cálculo de fechas
  // El permiso inicia el día siguiente al parto
  const fechaInicio = new Date(fechaParto);
  fechaInicio.setDate(fechaInicio.getDate() + 1);
  
  // Fecha de término: día siguiente al último día de permiso
  const fechaTermino = new Date(fechaInicio);
  fechaTermino.setDate(fechaTermino.getDate() + diasTotales);
  
  // Formato de fechas (dd/mm/yyyy)
  const formatearFecha = (fecha: Date): string => {
    const día = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    return `${día}/${mes}/${año}`;
  };
  
  // Resumen de modalidad
  let resumenModalidad = '';
  if (modalidad === 'completa_12') {
    resumenModalidad = `Jornada completa: ${SEMANAS_BASE} semanas base + ${semanasExtension} semanas extensión parental = ${semanasTotal} semanas totales. `;
    if (esPadre && semanasPadre > 0) {
      resumenModalidad += `Como padre, recibes ${semanasPadre} semanas cedidas por la madre. `;
    }
    resumenModalidad += `Subsidio al 100% de tu salario (hasta tope de $${TOPE_SUBSIDIO_DIARIO.toLocaleString('es-CL')} diarios).`;
  } else {
    resumenModalidad = `Media jornada: ${SEMANAS_MEDIA_JORNADA} semanas a 50% de tu salario normal. Subsidio sobre el 50% ($${(subsidioMensual).toLocaleString('es-CL')} mensual aprox.).`;
  }
  
  // Salario en media jornada (si aplica)
  const salarioMediaJornada = modalidad === 'media_18' ? salarioMensual * 0.5 : salarioMensual * 0.5;
  
  return {
    dias_postnatal_total: diasTotales,
    semanas_total: semanasTotal,
    fecha_inicio: formatearFecha(fechaInicio),
    fecha_termino: formatearFecha(fechaTermino),
    subsidio_diario: Math.round(subsidioDiario),
    subsidio_mensual: Math.round(subsidioMensual),
    subsidio_total: Math.round(subsidioTotal),
    salario_media_jornada: Math.round(salarioMediaJornada),
    resumen_modalidad: resumenModalidad
  };
}
