export interface Inputs {
  ano_modelo: number;
  fecha_ultima_revision: string | null;
  costo_cda: number;
}

export interface Outputs {
  proxima_fecha_revision: string;
  dias_para_vencimiento: number;
  estado_vigencia: string;
  costo_revision_estimado: number;
  multa_por_vencimiento: number;
  frecuencia_proxima: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia
  const MULTA_SIN_REVISION = 1090000; // COP, Código Nacional de Tránsito
  const ANOS_PRIMERA_REVISION = 6; // Vehículos nuevos
  const CICLO_ANUAL_MESES = 12;
  const HOY = new Date('2026-04-28');

  // Validar costo
  const costo = Math.max(200000, Math.min(280000, i.costo_cda));

  let proximaFecha: Date;
  let frecuencia: string;

  if (!i.fecha_ultima_revision || i.fecha_ultima_revision.trim() === '') {
    // Vehículo nuevo: primera revisión a los 6 años
    proximaFecha = new Date(i.ano_modelo + ANOS_PRIMERA_REVISION, 0, 1);
    frecuencia = 'Primera revisión (año 6)';
  } else {
    // Vehículo con historial: próxima revisión en 12 meses
    const ultimaRevision = new Date(i.fecha_ultima_revision);
    proximaFecha = new Date(ultimaRevision);
    proximaFecha.setFullYear(proximaFecha.getFullYear() + 1);
    frecuencia = 'Anual (12 meses)';
  }

  // Calcular días para vencimiento
  const diffTime = proximaFecha.getTime() - HOY.getTime();
  const diasParaVencimiento = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determinar estado de vigencia
  let estado: string;
  if (diasParaVencimiento > 30) {
    estado = 'Vigente';
  } else if (diasParaVencimiento > 0) {
    estado = 'Próximo a vencer';
  } else if (diasParaVencimiento === 0) {
    estado = 'Vencido hoy';
  } else {
    estado = 'Vencido';
  }

  // Multa se aplica si está vencido
  const multa = diasParaVencimiento < 0 ? MULTA_SIN_REVISION : 0;

  // Formatear fecha próxima (YYYY-MM-DD)
  const ano = proximaFecha.getFullYear();
  const mes = String(proximaFecha.getMonth() + 1).padStart(2, '0');
  const dia = String(proximaFecha.getDate()).padStart(2, '0');
  const proximaFechaStr = `${ano}-${mes}-${dia}`;

  return {
    proxima_fecha_revision: proximaFechaStr,
    dias_para_vencimiento: diasParaVencimiento,
    estado_vigencia: estado,
    costo_revision_estimado: costo,
    multa_por_vencimiento: multa,
    frecuencia_proxima: frecuencia
  };
}
