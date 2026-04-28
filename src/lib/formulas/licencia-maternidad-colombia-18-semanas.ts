export interface Inputs {
  ibc_promedio: number;
  fecha_parto: string;
  meses_cotizados: number;
  incluir_paternidad: boolean;
}

export interface Outputs {
  dias_licencia_maternidad: number;
  semanas_licencia: number;
  dias_paternidad: number;
  dias_totales: number;
  fecha_inicio: string;
  fecha_fin: string;
  subsidio_total: number;
  subsidio_diario: number;
  cumple_requisitos: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes Ley 1822/2017 Colombia
  const DIAS_MATERNIDAD = 126; // 18 semanas × 7 días
  const SEMANAS_MATERNIDAD = 18;
  const DIAS_PATERNIDAD_OPCIONAL = 14; // 2 semanas
  const MESES_COTIZACION_MINIMO = 6; // requisito DIAN/MinTrabajo
  const DIAS_ANTES_PARTO = 30; // hasta 30 días previos
  const DIVISOR_DIARIO = 30; // estándar Colombia para IBC diario
  const DESCUENTO_PENSION = 0.04; // 4% aporte pensional durante licencia

  // Validar requisitos
  const cumpleRequisitos = i.meses_cotizados >= MESES_COTIZACION_MINIMO && i.ibc_promedio > 0;
  const cumpleRequisitoTexto = cumpleRequisitos 
    ? `✓ Sí (${i.meses_cotizados} meses > ${MESES_COTIZACION_MINIMO} mínimo requerido)`
    : `✗ No (${i.meses_cotizados} meses < ${MESES_COTIZACION_MINIMO} mínimo). Sin derecho a subsidio.`;

  // Calcular subsidio diario (100% IBC)
  const subsidio_diario = i.ibc_promedio / DIVISOR_DIARIO;

  // Días paternidad
  const dias_paternidad = i.incluir_paternidad ? DIAS_PATERNIDAD_OPCIONAL : 0;
  const dias_totales = DIAS_MATERNIDAD + dias_paternidad;

  // Subsidio total (maternidad + paternidad si aplica)
  const subsidio_total = subsidio_diario * dias_totales;

  // Semanas licencia maternidad (18 fijas)
  const semanas_licencia = SEMANAS_MATERNIDAD + (i.incluir_paternidad ? 2 : 0);

  // Calcular fechas
  const datePartoObj = new Date(i.fecha_parto);
  
  // Fecha inicio: 30 días antes del parto
  const dateInicio = new Date(datePartoObj);
  dateInicio.setDate(dateInicio.getDate() - DIAS_ANTES_PARTO);
  const fecha_inicio = dateInicio.toISOString().split('T')[0];

  // Fecha fin: inicio + días totales - 1 (porque el primer día ya está contado)
  const dateFin = new Date(dateInicio);
  dateFin.setDate(dateFin.getDate() + dias_totales - 1);
  const fecha_fin = dateFin.toISOString().split('T')[0];

  return {
    dias_licencia_maternidad: DIAS_MATERNIDAD,
    semanas_licencia: semanas_licencia,
    dias_paternidad: dias_paternidad,
    dias_totales: dias_totales,
    fecha_inicio: fecha_inicio,
    fecha_fin: fecha_fin,
    subsidio_total: Math.round(subsidio_total),
    subsidio_diario: Math.round(subsidio_diario),
    cumple_requisitos: cumpleRequisitoTexto
  };
}
