export interface Inputs {
  salario_mensual: number;
  fecha_nacimiento: string; // 'YYYY-MM-DD'
  es_trabajador_formal: boolean;
  dias_adicionales_negociados: number;
}

export interface Outputs {
  dias_licencia_legal: number;
  dias_licencia_total: number;
  salario_diario: number;
  subsidio_total_legal: number;
  subsidio_total_con_adicionales: number;
  fecha_inicio_licencia: string;
  fecha_fin_licencia: string;
  fecha_fin_total: string;
  comparativa_oecd: string;
  elegibilidad: string;
  aviso_reforma: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia
  const DIAS_LICENCIA_LEGAL = 14; // Ley 1822/2017
  const PORCENTAJE_COBERTURA = 100; // EPS cubre 100%
  const DIAS_MES = 30; // Cálculo estándar nómina Colombia
  const PROMEDIO_SEMANAS_OECD = 11; // Promedio países OCDE (Colombia: 2 semanas)

  // Validaciones básicas
  if (i.salario_mensual <= 0) {
    return {
      dias_licencia_legal: 0,
      dias_licencia_total: 0,
      salario_diario: 0,
      subsidio_total_legal: 0,
      subsidio_total_con_adicionales: 0,
      fecha_inicio_licencia: '',
      fecha_fin_licencia: '',
      fecha_fin_total: '',
      comparativa_oecd: 'Salario inválido',
      elegibilidad: 'NO CUMPLE: Salario debe ser > 0',
      aviso_reforma: ''
    };
  }

  // Cálculo de salario diario
  const salario_diario = Math.round((i.salario_mensual / DIAS_MES) * 100) / 100;

  // Cálculo subsidio 14 días legales
  const subsidio_total_legal = Math.round(salario_diario * DIAS_LICENCIA_LEGAL);

  // Cálculo con días adicionales
  const dias_licencia_total = DIAS_LICENCIA_LEGAL + i.dias_adicionales_negociados;
  const subsidio_total_con_adicionales = Math.round(salario_diario * dias_licencia_total);

  // Cálculo fechas
  const fecha_nacimiento = new Date(i.fecha_nacimiento);
  const fecha_inicio = new Date(fecha_nacimiento);
  
  const fecha_fin_legal = new Date(fecha_inicio);
  fecha_fin_legal.setDate(fecha_fin_legal.getDate() + (DIAS_LICENCIA_LEGAL - 1));
  
  const fecha_fin_total_calc = new Date(fecha_inicio);
  fecha_fin_total_calc.setDate(fecha_fin_total_calc.getDate() + (dias_licencia_total - 1));

  // Función auxiliar para formatear dates
  const formatDate = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Determinación elegibilidad
  let mensaje_elegibilidad = '';
  if (!i.es_trabajador_formal) {
    mensaje_elegibilidad = 'NO CUMPLE: Debes ser trabajador formal (contrato + EPS activa)';
  } else if (i.salario_mensual < 10000) {
    mensaje_elegibilidad = 'CONDICIÓN: Salario muy bajo. Verifica con tu EPS.';
  } else {
    mensaje_elegibilidad = '✓ CUMPLES REQUISITOS: Trabajador formal. Tienes derecho a 14 días.';
  }

  // Comparativa OCDE
  const semanas_colombia = (DIAS_LICENCIA_LEGAL / 7).toFixed(1);
  const comparativa = `Colombia: ${semanas_colombia} semanas. OCDE promedio: ${PROMEDIO_SEMANAS_OECD} semanas. Déficit: ${(PROMEDIO_SEMANAS_OECD - parseFloat(semanas_colombia)).toFixed(1)} semanas.`;

  // Aviso reforma 2026
  const aviso_reforma = 'ℹ️ En tramite legislativo: Proyecto de Ley ampliar a 4 semanas (28 días). Estado: Discusión Congreso. Plazo estimado: 2026-2027.';

  return {
    dias_licencia_legal: DIAS_LICENCIA_LEGAL,
    dias_licencia_total: dias_licencia_total,
    salario_diario: salario_diario,
    subsidio_total_legal: subsidio_total_legal,
    subsidio_total_con_adicionales: subsidio_total_con_adicionales,
    fecha_inicio_licencia: formatDate(fecha_inicio),
    fecha_fin_licencia: formatDate(fecha_fin_legal),
    fecha_fin_total: formatDate(fecha_fin_total_calc),
    comparativa_oecd: comparativa,
    elegibilidad: mensaje_elegibilidad,
    aviso_reforma: aviso_reforma
  };
}
