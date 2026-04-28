export interface Inputs {
  ingresos_mensuales: number;
  numero_cargas: number;
  tipo_trabajador: string;
  region?: string;
  hijos_educacion_superior?: number;
  grupo_tramo_rsh?: string;
}

export interface Outputs {
  tramo_asignacion: string;
  monto_asignacion_mensual: number;
  asignacion_anual: number;
  tramo_rsh_resultado: string;
  acceso_gratuidad: string;
  acceso_pgu: string;
  beneficios_adicionales: string;
  ingreso_per_capita: number;
  observaciones: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Asignación Familiar
  // Fuente: MINTRA Decreto 2026, SII
  const MONTO_ASIGNACION_BASE = 49850; // CLP, ajustado IPC enero 2026
  const TRAMO_1_LIMITE = 853750;   // hasta 100% asignación
  const TRAMO_2_LIMITE = 1280625;  // 75% asignación
  const TRAMO_3_LIMITE = 1707500;  // 50% asignación
  const TRAMO_4_LIMITE = 2134375;  // 25% asignación

  // Validaciones básicas
  const ingresos = Math.max(0, i.ingresos_mensuales || 0);
  const cargas = Math.max(0, Math.floor(i.numero_cargas || 0));
  const tipo = i.tipo_trabajador || 'dependiente';
  const region = i.region || 'metropoliana';
  const hijosSuperiores = Math.max(0, Math.floor(i.hijos_educacion_superior || 0));

  // 1. Determinar tramo de asignación familiar
  let porcentaje_asignacion = 0;
  let tramo_asignacion = 'Sin asignación';

  if (ingresos <= TRAMO_1_LIMITE) {
    porcentaje_asignacion = 100;
    tramo_asignacion = 'Tramo I - 100%';
  } else if (ingresos <= TRAMO_2_LIMITE) {
    porcentaje_asignacion = 75;
    tramo_asignacion = 'Tramo II - 75%';
  } else if (ingresos <= TRAMO_3_LIMITE) {
    porcentaje_asignacion = 50;
    tramo_asignacion = 'Tramo III - 50%';
  } else if (ingresos <= TRAMO_4_LIMITE) {
    porcentaje_asignacion = 25;
    tramo_asignacion = 'Tramo IV - 25%';
  } else {
    porcentaje_asignacion = 0;
    tramo_asignacion = 'Sin asignación (ingresos superiores)';
  }

  // 2. Calcular monto asignación mensual
  let monto_asignacion_mensual = 0;
  if (tipo === 'dependiente' || tipo === 'microempresario') {
    monto_asignacion_mensual = (MONTO_ASIGNACION_BASE * porcentaje_asignacion / 100) * cargas;
  } else if (tipo === 'independiente') {
    // Independientes deben solicitar, monto igual pero manual
    monto_asignacion_mensual = (MONTO_ASIGNACION_BASE * porcentaje_asignacion / 100) * cargas;
  } else if (tipo === 'estudiante' || tipo === 'beneficiario_pgu') {
    monto_asignacion_mensual = 0; // No aplica asignación laboral
  }

  const asignacion_anual = monto_asignacion_mensual * 12;

  // 3. Calcular ingreso per cápita para RSH
  const miembros_hogar = cargas + 1; // cargas + jefe de hogar
  const ingreso_per_capita = ingresos / miembros_hogar;

  // 4. Determinar tramo RSH (estimado)
  let tramo_rsh = i.grupo_tramo_rsh || 'auto';
  let tramo_rsh_resultado = 'No determinado';

  if (tramo_rsh === 'auto') {
    if (ingreso_per_capita < 250000) {
      tramo_rsh_resultado = 'Tramo D (Extrema pobreza)';
    } else if (ingreso_per_capita < 450000) {
      tramo_rsh_resultado = 'Tramo C (Pobreza)';
    } else if (ingreso_per_capita < 800000) {
      tramo_rsh_resultado = 'Tramo B (Vulnerabilidad)';
    } else if (ingreso_per_capita < 1200000) {
      tramo_rsh_resultado = 'Tramo A (Clase media baja)';
    } else {
      tramo_rsh_resultado = 'Grupo superior (Clase media/alta)';
    }
  } else {
    const mapas = {
      'indigente': 'Indigente (sin ingresos regulares)',
      'd': 'Tramo D (Extrema pobreza)',
      'c': 'Tramo C (Pobreza)',
      'b': 'Tramo B (Vulnerabilidad)',
      'a': 'Tramo A (Clase media baja)'
    };
    tramo_rsh_resultado = mapas[tramo_rsh] || 'No determinado';
  }

  // 5. Determinar acceso a gratuidad educacional
  let acceso_gratuidad = 'No';
  let porcentaje_gratuidad = 0;

  if (tramo_rsh_resultado.includes('Tramo D') || tramo_rsh_resultado.includes('Tramo C')) {
    acceso_gratuidad = 'Sí (100%)';
    porcentaje_gratuidad = 100;
  } else if (tramo_rsh_resultado.includes('Tramo B')) {
    acceso_gratuidad = 'Sí (50-100% según establecimiento)';
    porcentaje_gratuidad = 75; // promedio
  } else if (tramo_rsh_resultado.includes('Tramo A')) {
    acceso_gratuidad = 'No (pero evaluar bonificación escolar)';
    porcentaje_gratuidad = 0;
  } else {
    acceso_gratuidad = 'No';
    porcentaje_gratuidad = 0;
  }

  // 6. Determinar acceso PGU y bonificaciones
  let acceso_pgu = 'No';
  if (tramo_rsh_resultado.includes('Tramo D') || tramo_rsh_resultado.includes('Tramo C')) {
    acceso_pgu = 'Sí - Elegible PGU completa y bonificaciones';
  } else if (tramo_rsh_resultado.includes('Tramo B')) {
    acceso_pgu = 'Parcial - Requiere validación adicional DSSI';
  } else {
    acceso_pgu = 'No - Ingresos superiores al límite';
  }

  // 7. Beneficios adicionales según tramo RSH y región
  let beneficios = [];

  if (tramo_rsh_resultado.includes('Tramo D') || tramo_rsh_resultado.includes('Tramo C')) {
    beneficios.push('Pase Escolar 100%');
    beneficios.push('Bonificación educacional escuela');
    if (hijosSuperiores > 0) {
      beneficios.push('Gratuidad educación superior (SIES acreditados)');
    }
    beneficios.push('Bono de protección (si aplica)');
    if (region === 'norte' || region === 'sur' || region === 'extrema') {
      beneficios.push('Subsidio transporte regional');
    }
  } else if (tramo_rsh_resultado.includes('Tramo B')) {
    beneficios.push('Pase Escolar 100%');
    if (hijosSuperiores > 0) {
      beneficios.push('Gratuidad educación superior (parcial)');
    }
    beneficios.push('Bonificación escolar (evaluar per caso)');
  } else if (tramo_rsh_resultado.includes('Tramo A')) {
    beneficios.push('Evaluación de bonificación escolar municipal');
  } else {
    beneficios.push('Sin beneficios adicionales por RSH');
  }

  // Beneficios por tipo de trabajador
  if (tipo === 'beneficiario_pgu') {
    beneficios.push('PGU (Pensión Garantizada Mínima)');
  }

  const beneficios_adicionales = beneficios.length > 0 ? beneficios.join('; ') : 'No aplica';

  // 8. Observaciones y próximos pasos
  let observaciones = '';

  if (tipo === 'independiente') {
    observaciones += '⚠️ **Trabajador independiente:** Debe solicitar asignación familiar en SII con declaración de impuestos del año anterior. \n';
  }

  if (tipo === 'estudiante') {
    observaciones += '⚠️ **Estudiante:** No accedes a asignación laboral. Valida gratuidad en universidades/IP/CFT mediante RSH en dssi.cl. \n';
  }

  if (cargas === 0) {
    observaciones += '📌 Sin cargas familiares: No tienes derecho a asignación familiar. \n';
  }

  if (porcentaje_asignacion === 0) {
    observaciones += '⚠️ **Ingresos elevados:** Superaste límite de asignación familiar 2026. \n';
  } else if (porcentaje_asignacion < 100) {
    observaciones += `⚠️ Recibes ${porcentaje_asignacion}% de asignación familiar por ingresos. \n`;
  }

  // RSH y beneficios
  if (tramo_rsh === 'auto') {
    observaciones += '📋 **RSH estimado:** Este es un cálculo aproximado. Para acceder a beneficios oficiales (gratuidad, PGU, bonificaciones), debes actualizar tu Registro Social Hogares en **dssi.cl** con RUT. \n';
  } else {
    observaciones += '✅ RSH registrado: Revisa dssi.cl para confirmar acceso a cada beneficio. \n';
  }

  if (hijosSuperiores > 0) {
    observaciones += `👨‍🎓 ${hijosSuperiores} hijo(s) en educación superior: Revisa elegibilidad en SIES según RSH. \n`;
  }

  observaciones += `**Próximos pasos:** 1) Actualiza RSH en dssi.cl. 2) Si trabajas, verifica asignación en tu liquidación. 3) Accede a beneficios educacionales en tu municipio o establecimiento. 4) Consulta cambios anuales en mintrabajo.gob.cl.`;

  return {
    tramo_asignacion,
    monto_asignacion_mensual: Math.round(monto_asignacion_mensual),
    asignacion_anual: Math.round(asignacion_anual),
    tramo_rsh_resultado,
    acceso_gratuidad,
    acceso_pgu,
    beneficios_adicionales,
    ingreso_per_capita: Math.round(ingreso_per_capita),
    observaciones
  };
}
