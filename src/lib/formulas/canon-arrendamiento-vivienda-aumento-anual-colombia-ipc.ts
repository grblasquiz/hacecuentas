export interface Inputs {
  canon_actual: number;
  ipc_anterior: number;
  fecha_inicio_contrato: string;
}

export interface Outputs {
  nuevo_canon: number;
  incremento_pesos: number;
  incremento_porcentaje: number;
  fecha_vigencia: string;
  dias_notificacion: number;
  cumple_normativa: string;
}

export function compute(i: Inputs): Outputs {
  // Validación de entradas
  if (!i.canon_actual || i.canon_actual <= 0) {
    return {
      nuevo_canon: 0,
      incremento_pesos: 0,
      incremento_porcentaje: 0,
      fecha_vigencia: '',
      dias_notificacion: 0,
      cumple_normativa: 'Error: Canon actual inválido'
    };
  }

  if (i.ipc_anterior < 0 || i.ipc_anterior > 15) {
    return {
      nuevo_canon: 0,
      incremento_pesos: 0,
      incremento_porcentaje: 0,
      fecha_vigencia: '',
      dias_notificacion: 0,
      cumple_normativa: 'Error: IPC fuera de rango válido (0-15%)'
    };
  }

  // Cálculo del nuevo canon
  // Fórmula: Nuevo Canon = Canon Actual × (1 + IPC%/100)
  // Fuente: Ley 820/2003, Art. 6
  const factor_aumento = 1 + (i.ipc_anterior / 100);
  const nuevo_canon = Math.round(i.canon_actual * factor_aumento);
  const incremento_pesos = nuevo_canon - i.canon_actual;
  const incremento_porcentaje = i.ipc_anterior;

  // Fecha de vigencia: aniversario del contrato
  const fecha_contrato = new Date(i.fecha_inicio_contrato);
  const fecha_vigencia = new Date(fecha_contrato);
  
  // Asegurar que la fecha es válida
  if (isNaN(fecha_vigencia.getTime())) {
    return {
      nuevo_canon,
      incremento_pesos,
      incremento_porcentaje,
      fecha_vigencia: 'Fecha inválida',
      dias_notificacion: 30,
      cumple_normativa: 'Error: Fecha del contrato inválida'
    };
  }

  // Formato YYYY-MM-DD para salida
  const año = fecha_vigencia.getFullYear();
  const mes = String(fecha_vigencia.getMonth() + 1).padStart(2, '0');
  const día = String(fecha_vigencia.getDate()).padStart(2, '0');
  const fecha_vigencia_str = `${año}-${mes}-${día}`;

  // Cálculo de días para notificación
  // Mínimo legal: 30 días antes de vigencia (Ley 820/2003)
  const dias_notificacion = 30;

  // Validación de cumplimiento normativo
  // El aumento no puede superar el IPC del año anterior
  let cumple_normativa = 'Sí, cumple Ley 820/2003';
  if (incremento_porcentaje > i.ipc_anterior) {
    cumple_normativa = 'No cumple: aumento superior al IPC';
  }
  
  if (incremento_porcentaje === i.ipc_anterior) {
    cumple_normativa = 'Sí, cumple al máximo legal (IPC ' + i.ipc_anterior.toFixed(2) + '%)';
  }

  // Mensaje sobre notificación
  const ahora = new Date();
  const fecha_min_notificacion = new Date(fecha_vigencia);
  fecha_min_notificacion.setDate(fecha_min_notificacion.getDate() - 30);

  if (ahora > fecha_min_notificacion && ahora < fecha_vigencia) {
    cumple_normativa += '. ⚠ Plazo de notificación vencido o próximo a vencer.';
  }

  return {
    nuevo_canon: Math.round(nuevo_canon),
    incremento_pesos: Math.round(incremento_pesos),
    incremento_porcentaje: Math.round(incremento_porcentaje * 100) / 100,
    fecha_vigencia: fecha_vigencia_str,
    dias_notificacion,
    cumple_normativa
  };
}
