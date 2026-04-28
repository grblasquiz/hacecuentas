export interface Inputs {
  terminacion_placa: string; // '0'-'9'
  entidad: string; // 'cdmx' | 'edomex'
  anio_vehiculo: number;
  mes_consulta: number; // 1-12
}

export interface Outputs {
  bimestre_asignado: string;
  mes_inicio_bimestre: string;
  mes_fin_bimestre: string;
  fecha_limite_verificacion: string;
  bimestres_atraso: number;
  multa_estimada: number;
  tipo_holograma: string;
  restriccion_hoy_no_circula: string;
  estado_circulacion: string;
}

export function compute(i: Inputs): Outputs {
  // Mapeo de terminación a bimestre (1=I, 2=II, ..., 0=IV)
  const bimestres: { [key: string]: number } = {
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 1, '8': 2, '9': 3, '0': 4
  };

  const bimestreNum = bimestres[i.terminacion_placa] || 1;
  const bimestreNombres: { [key: number]: string } = {
    1: 'I (Enero-Febrero)',
    2: 'II (Marzo-Abril)',
    3: 'III (Mayo-Junio)',
    4: 'IV (Julio-Agosto)',
    5: 'V (Septiembre-Octubre)',
    6: 'VI (Noviembre-Diciembre)'
  };

  // Asignar fechas de bimestre
  const fechasLimite: { [key: number]: { inicio: string; fin: string; limite: string } } = {
    1: { inicio: 'Enero', fin: 'Febrero', limite: '28 de febrero' },
    2: { inicio: 'Marzo', fin: 'Abril', limite: '30 de abril' },
    3: { inicio: 'Mayo', fin: 'Junio', limite: '30 de junio' },
    4: { inicio: 'Julio', fin: 'Agosto', limite: '31 de agosto' },
    5: { inicio: 'Septiembre', fin: 'Octubre', limite: '31 de octubre' },
    6: { inicio: 'Noviembre', fin: 'Diciembre', limite: '31 de diciembre' }
  };

  const fechaBim = fechasLimite[bimestreNum] || fechasLimite[1];

  // Calcular atraso en bimestres
  // Mes actual vs mes fin bimestre asignado
  const bimestresMeses: { [key: number]: number } = {
    1: 2, 2: 4, 3: 6, 4: 8, 5: 10, 6: 12
  };
  const mesFin = bimestresMeses[bimestreNum] || 2;
  let atraso = 0;
  if (i.mes_consulta > mesFin) {
    // Si pasó el mes límite del bimestre
    atraso = Math.floor((i.mes_consulta - mesFin) / 2) + 1;
  } else if (i.mes_consulta === mesFin && i.mes_consulta > 1) {
    // En el mes límite pero después de fecha límite (asumimos atraso parcial)
    atraso = 0; // Aún en tiempo
  }

  // Multa base CDMX: $2,000 MXN por bimestre
  const multaBase = 2000;
  const multaEstimada = atraso > 0 ? multaBase * atraso : 0;

  // Hologramas por antigüedad (año actual 2026)
  let tipoHolograma = 'Holograma 2';
  if (i.anio_vehiculo <= 1995) {
    tipoHolograma = 'Holograma 0 (Prohibido en CDMX)';
  } else if (i.anio_vehiculo >= 1996 && i.anio_vehiculo <= 2009) {
    tipoHolograma = 'Holograma 1 (Sujeto a Hoy No Circula)';
  } else if (i.anio_vehiculo >= 2010) {
    tipoHolograma = 'Holograma 2 (Normas recientes)';
  }

  // Restricción Hoy No Circula
  let restriccionHNC = 'Aplica 1 día/semana según engomado';
  if (atraso > 0) {
    restriccionHNC = `DOBLE RESTRICCIÓN: ${atraso} bimestres sin verificación + Hoy No Circula (hasta 2 días/semana)`;
  } else if (i.anio_vehiculo <= 1995) {
    restriccionHNC = 'Prohibición diaria en CDMX';
  }

  // Estado de circulación
  let estadoCirculacion = 'Circulación permitida';
  if (atraso > 0) {
    estadoCirculacion = `NO PERMITIDO en CDMX (atraso ${atraso} bimestres). EdoMex: tolera 10 días adicionales.`;
  } else if (i.anio_vehiculo <= 1995) {
    estadoCirculacion = 'Prohibido en CDMX diariamente';
  }

  // Ajuste por entidad (EdoMex ligeramente más tolerante en multa)
  let multaFinal = multaEstimada;
  if (i.entidad === 'edomex' && atraso > 0) {
    multaFinal = Math.round(multaEstimada * 0.9); // EdoMex: ~90% de CDMX
  }

  return {
    bimestre_asignado: bimestreNombres[bimestreNum] || 'I',
    mes_inicio_bimestre: fechaBim.inicio,
    mes_fin_bimestre: fechaBim.fin,
    fecha_limite_verificacion: fechaBim.limite,
    bimestres_atraso: Math.max(0, atraso),
    multa_estimada: multaFinal,
    tipo_holograma: tipoHolograma,
    restriccion_hoy_no_circula: restriccionHNC,
    estado_circulacion: estadoCirculacion
  };
}
