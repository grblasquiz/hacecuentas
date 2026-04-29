export interface Inputs {
  ingreso_bruto_familia: number;
  cantidad_hijos: number;
  condicion_laboral: string;
  tiene_escolaridad: boolean;
  tiene_prenatal: boolean;
}

export interface Outputs {
  tramo_ingreso: string;
  asignacion_por_hijo: number;
  monto_escolaridad: number;
  monto_prenatal: number;
  total_mensual: number;
  observaciones: string;
}

export function compute(i: Inputs): Outputs {
  const ingreso = Number(i.ingreso_bruto_familia) || 0;
  const hijos = Math.max(1, Math.floor(Number(i.cantidad_hijos) || 1));
  const condicion = String(i.condicion_laboral || 'empleado');
  const escolaridad = Boolean(i.tiene_escolaridad);
  const prenatal = Boolean(i.tiene_prenatal);

  // Valores ANSES 2026 aproximados en pesos (ARS)
  const TRAMOS_2026 = [
    { limite: 90000, tramo: 1, asignacion: 18500, escolar: 6500, prenatal: 10000 },
    { limite: 135000, tramo: 2, asignacion: 15800, escolar: 5500, prenatal: 8500 },
    { limite: 180000, tramo: 3, asignacion: 12200, escolar: 4200, prenatal: 6500 },
    { limite: Infinity, tramo: 4, asignacion: 8500, escolar: 3000, prenatal: 5000 }
  ];

  let tramoActual = TRAMOS_2026[3];
  let tramoLabel = 'Tramo 4 (Ingreso alto)';

  if (condicion === 'desocupado') {
    return {
      tramo_ingreso: 'Desocupado con hijos',
      asignacion_por_hijo: 5000,
      monto_escolaridad: 0,
      monto_prenatal: 0,
      total_mensual: 5000 * hijos,
      observaciones: 'Como desocupado cobras $5.000 por hijo. No aplican adicionales de escolaridad ni prenatal. Requiere estar registrado en ANSES como desocupado.'
    };
  }

  for (let t of TRAMOS_2026) {
    if (ingreso <= t.limite) {
      tramoActual = t;
      tramoLabel = `Tramo ${t.tramo} (hasta $${t.limite.toLocaleString('es-AR')})`;
      break;
    }
  }

  let asignacionPorHijo = tramoActual.asignacion;
  let montoEscolar = escolaridad ? tramoActual.escolar : 0;
  let montoPrenatal = prenatal ? tramoActual.prenatal : 0;

  // Los monotributistas pueden tener restricciones adicionales
  if (condicion === 'monotributista' && ingreso > 180000) {
    return {
      tramo_ingreso: 'Fuera de rango monotributista',
      asignacion_por_hijo: 0,
      monto_escolaridad: 0,
      monto_prenatal: 0,
      total_mensual: 0,
      observaciones: 'Como monotributista, los ingresos declarados superan el límite para acceder a asignación familiar (máx. ~$180.000). Consulta con ANSES sobre tu categoría.'
    };
  }

  const totalAsignacion = asignacionPorHijo * hijos;
  const totalMensual = totalAsignacion + montoEscolar + montoPrenatal;

  let obs = `Trabajador ${condicion === 'empleado' ? 'en relación de dependencia' : 'monotributista'} ubicado en ${tramoLabel}.`;
  if (escolaridad) obs += ` Incluye adicional escolaridad ($${montoEscolar.toLocaleString('es-AR')}).`;
  if (prenatal) obs += ` Incluye prenatal ($${montoPrenatal.toLocaleString('es-AR')}).`;
  obs += ' Valores aproximados; verificar en anses.gob.ar.';

  return {
    tramo_ingreso: tramoLabel,
    asignacion_por_hijo: asignacionPorHijo,
    monto_escolaridad: montoEscolar,
    monto_prenatal: montoPrenatal,
    total_mensual: totalMensual,
    observaciones: obs
  };
}
