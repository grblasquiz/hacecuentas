export interface Inputs {
  salario_padre_mensual: number;
  fecha_inicio_postnatal_madre: string; // dd/mm/yyyy
  semanas_trasvasadas_padre: number;
  modalidad: 'continuo' | 'parcial';
  tope_imponible_mensual: number;
}

export interface Outputs {
  dias_subsidio_padre: number;
  salario_diario_padre: number;
  subsidio_total_padre: number;
  subsidio_promedio_mensual: number;
  fecha_inicio_permiso_padre: string;
  fecha_termino_permiso_padre: string;
  nota_limitaciones: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes SII 2026 Chile
  const TOPE_IMPONIBLE_2026 = i.tope_imponible_mensual || 3556290; // pesos Chile
  const DIAS_POR_SEMANA = 7;
  const DIAS_POR_MES = 30;
  const SEMANAS_POSTNATAL_MADRE = 12;
  const PORCENTAJE_SUBSIDIO = 1.0; // 100% del salario

  // 1. Validaciones y ajustes
  if (i.semanas_trasvasadas_padre < 0 || i.semanas_trasvasadas_padre > 6) {
    return {
      dias_subsidio_padre: 0,
      salario_diario_padre: 0,
      subsidio_total_padre: 0,
      subsidio_promedio_mensual: 0,
      fecha_inicio_permiso_padre: 'Error',
      fecha_termino_permiso_padre: 'Error',
      nota_limitaciones: 'Semanas trasvasadas debe estar entre 0 y 6. Verify input.'
    };
  }

  if (i.salario_padre_mensual <= 0) {
    return {
      dias_subsidio_padre: 0,
      salario_diario_padre: 0,
      subsidio_total_padre: 0,
      subsidio_promedio_mensual: 0,
      fecha_inicio_permiso_padre: 'Error',
      fecha_termino_permiso_padre: 'Error',
      nota_limitaciones: 'Salario debe ser positivo.'
    };
  }

  // 2. Cálculo de días
  const dias_subsidio = i.semanas_trasvasadas_padre * DIAS_POR_SEMANA;

  // 3. Salario diario (aplicando tope)
  const salario_diario_sin_tope = i.salario_padre_mensual / DIAS_POR_MES;
  const tope_diario = TOPE_IMPONIBLE_2026 / DIAS_POR_MES;
  const salario_diario_aplicable = Math.min(salario_diario_sin_tope, tope_diario);

  // 4. Subsidio total (100% del salario diario)
  const subsidio_total = salario_diario_aplicable * dias_subsidio * PORCENTAJE_SUBSIDIO;

  // 5. Promedio mensual
  const meses_ocupados = dias_subsidio / DIAS_POR_MES;
  const subsidio_promedio_mensual = meses_ocupados > 0 ? subsidio_total / meses_ocupados : 0;

  // 6. Cálculo de fechas
  const fechaInicio = parseFecha(i.fecha_inicio_postnatal_madre);
  if (!fechaInicio) {
    return {
      dias_subsidio_padre: dias_subsidio,
      salario_diario_padre: Math.round(salario_diario_aplicable),
      subsidio_total_padre: Math.round(subsidio_total),
      subsidio_promedio_mensual: Math.round(subsidio_promedio_mensual),
      fecha_inicio_permiso_padre: 'Fecha inválida',
      fecha_termino_permiso_padre: 'Fecha inválida',
      nota_limitaciones: 'Verifique formato fecha postnatal madre (dd/mm/yyyy).'
    };
  }

  // Fecha inicio permiso padre = fecha inicio postnatal madre + 12 semanas
  const fechaInicioPermisoPadre = sumarDias(fechaInicio, SEMANAS_POSTNATAL_MADRE * DIAS_POR_SEMANA);
  const fechaTerminoPermisoPadre = sumarDias(fechaInicioPermisoPadre, dias_subsidio);

  // 7. Notas y limitaciones
  let notaLimitaciones = '';
  if (i.salario_padre_mensual > TOPE_IMPONIBLE_2026) {
    notaLimitaciones += `⚠️ Salario exceede tope SII ($${TOPE_IMPONIBLE_2026.toLocaleString('es-CL')}). Subsidio limitado a tope. `;
  }
  if (i.semanas_trasvasadas_padre === 0) {
    notaLimitaciones += `ℹ️ Sin traspaso: padre no recibe permiso parental adicional. `;
  }
  if (i.modalidad === 'parcial') {
    notaLimitaciones += `ℹ️ Modalidad parcial: las ${i.semanas_trasvasadas_padre} semanas pueden distribuirse. Total subsidio igual. `;
  }
  notaLimitaciones += `✓ Cálculo estimado. Tramitar en SII con acuerdo escrito notariado.`;

  return {
    dias_subsidio_padre: dias_subsidio,
    salario_diario_padre: Math.round(salario_diario_aplicable),
    subsidio_total_padre: Math.round(subsidio_total),
    subsidio_promedio_mensual: Math.round(subsidio_promedio_mensual),
    fecha_inicio_permiso_padre: formatFecha(fechaInicioPermisoPadre),
    fecha_termino_permiso_padre: formatFecha(fechaTerminoPermisoPadre),
    nota_limitaciones: notaLimitaciones
  };
}

// Funciones auxiliares
function parseFecha(fechaStr: string): Date | null {
  // Formato dd/mm/yyyy
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = fechaStr.match(regex);
  if (!match) return null;
  const [, dia, mes, anio] = match;
  const d = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
  return isNaN(d.getTime()) ? null : d;
}

function formatFecha(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

function sumarDias(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}
