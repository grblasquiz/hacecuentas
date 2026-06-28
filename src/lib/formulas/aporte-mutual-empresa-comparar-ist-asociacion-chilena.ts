export interface Inputs {
  remuneracion_promedio_mensual: number;
  numero_trabajadores: number;
  sector_actividad: string;
  mutual_comparar: string;
  considerar_bono_prevencion: boolean;
}

export interface ComparativaMutual {
  nombre: string;
  tasa: number;
  aporte_mensual: number;
  cobertura: string;
  sucursales: number;
}

export interface Outputs {
  tasa_aporte_base: number;
  tasa_aporte_adicional: number;
  tasa_total_sin_bono: number;
  tasa_total_con_bono: number;
  aporte_mensual_por_trabajador: number;
  aporte_mensual_total: number;
  aporte_anual_total: number;
  comparativa_mutualidades: ComparativaMutual[];
  cobertura_accidentes: number;
  prestaciones_incluidas: string[];
  ahorro_potencial: number;
  _insight?: any;
  _chart?: any;
}

// Fuente: SII 2026 - Aportes adicionales por sector
const APORTES_ADICIONALES: Record<string, number> = {
  agricultura: 3.4,
  construccion: 3.2,
  mineria: 2.8,
  transporte: 2.2,
  manufactura: 1.8,
  salud: 1.5,
  otros: 1.2,
  comercio: 0.7,
  educacion: 0.6,
  oficina: 0.5,
};

// Fuente: ACHS, IST, Mutual Seguridad 2026
const DATOS_MUTUALES: Record<string, { tasa_ajuste: number; cobertura_mercado: number; sucursales: number; prestaciones: string[] }> = {
  achs: {
    tasa_ajuste: 0,
    cobertura_mercado: 45,
    sucursales: 46,
    prestaciones: [
      'Atención ambulatoria 24/7',
      'Hospitalización y quirófanos',
      'Prestaciones en dinero por incapacidad temporal/permanente',
      'Protésicos y órtesis',
      'Programas de prevención sectorial',
      'Telemedicina',
      'Rehabilitación vocacional',
    ],
  },
  ist: {
    tasa_ajuste: -0.02,
    cobertura_mercado: 30,
    sucursales: 32,
    prestaciones: [
      'Atención médica integral',
      'Hospitalización especializada',
      'Prestaciones económicas por accidente',
      'Seguimiento ocupacional',
      'Rehabilitación física y psicosocial',
      'Bonificación por prevención',
      'Servicios complementarios (dental, óptico)',
    ],
  },
  mutual_seguridad: {
    tasa_ajuste: 0.02,
    cobertura_mercado: 25,
    sucursales: 38,
    prestaciones: [
      'Atención médica y quirúrgica',
      'Hospitalización general y especializados',
      'Prestaciones dinero (incapacidad)',
      'Prótesis y órtesis',
      'Programas personalizados prevención',
      'Beneficios complementarios (farmacia)',
      'Apoyo psicosocial post-accidente',
    ],
  },
};

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).considerar_bono_prevencion = (i as any).considerar_bono_prevencion === true || (i as any).considerar_bono_prevencion === 'true';
  // Validaciones
  if (i.remuneracion_promedio_mensual <= 0 || i.numero_trabajadores <= 0) {
    return {
      tasa_aporte_base: 0,
      tasa_aporte_adicional: 0,
      tasa_total_sin_bono: 0,
      tasa_total_con_bono: 0,
      aporte_mensual_por_trabajador: 0,
      aporte_mensual_total: 0,
      aporte_anual_total: 0,
      comparativa_mutualidades: [],
      cobertura_accidentes: 0,
      prestaciones_incluidas: [],
      ahorro_potencial: 0,
      _insight: undefined,
      _chart: undefined,
    };
  }

  // Constantes SII 2026
  const TASA_BASE = 0.95; // Fijo, ley obligatorio
  const BONO_PREVENCION = 0.4; // Promedio 0,3-0,5% si implementa programa certificado

  // Obtener aporte adicional según sector (SII)
  const aporte_adicional = APORTES_ADICIONALES[i.sector_actividad] || APORTES_ADICIONALES['otros'];

  // Tasa sin bono
  const tasa_sin_bono = TASA_BASE + aporte_adicional;

  // Tasa con bono (si aplica)
  const tasa_con_bono = i.considerar_bono_prevencion ? Math.max(tasa_sin_bono - BONO_PREVENCION, 0) : tasa_sin_bono;
  const tasa_a_usar = i.considerar_bono_prevencion ? tasa_con_bono : tasa_sin_bono;

  // Aporte por trabajador (en pesos)
  const aporte_por_trabajador = (i.remuneracion_promedio_mensual * tasa_a_usar) / 100;

  // Aporte total mensual y anual
  const aporte_mensual_total = aporte_por_trabajador * i.numero_trabajadores;
  const aporte_anual_total = aporte_mensual_total * 12;

  // Comparativa de mutuales
  const comparativa: ComparativaMutual[] = [];

  if (i.mutual_comparar === 'comparar_todas' || i.mutual_comparar === 'achs') {
    const tasa_achs = tasa_a_usar + DATOS_MUTUALES['achs'].tasa_ajuste;
    const aporte_achs = (i.remuneracion_promedio_mensual * tasa_achs) / 100 * i.numero_trabajadores;
    comparativa.push({
      nombre: 'ACHS',
      tasa: tasa_achs,
      aporte_mensual: aporte_achs,
      cobertura: `${DATOS_MUTUALES['achs'].cobertura_mercado}% mercado`,
      sucursales: DATOS_MUTUALES['achs'].sucursales,
    });
  }

  if (i.mutual_comparar === 'comparar_todas' || i.mutual_comparar === 'ist') {
    const tasa_ist = tasa_a_usar + DATOS_MUTUALES['ist'].tasa_ajuste;
    const aporte_ist = (i.remuneracion_promedio_mensual * tasa_ist) / 100 * i.numero_trabajadores;
    comparativa.push({
      nombre: 'IST',
      tasa: tasa_ist,
      aporte_mensual: aporte_ist,
      cobertura: `${DATOS_MUTUALES['ist'].cobertura_mercado}% mercado`,
      sucursales: DATOS_MUTUALES['ist'].sucursales,
    });
  }

  if (i.mutual_comparar === 'comparar_todas' || i.mutual_comparar === 'mutual_seguridad') {
    const tasa_ms = tasa_a_usar + DATOS_MUTUALES['mutual_seguridad'].tasa_ajuste;
    const aporte_ms = (i.remuneracion_promedio_mensual * tasa_ms) / 100 * i.numero_trabajadores;
    comparativa.push({
      nombre: 'Mutual de Seguridad',
      tasa: tasa_ms,
      aporte_mensual: aporte_ms,
      cobertura: `${DATOS_MUTUALES['mutual_seguridad'].cobertura_mercado}% mercado`,
      sucursales: DATOS_MUTUALES['mutual_seguridad'].sucursales,
    });
  }

  // Ahorro potencial (diferencia entre mayor y menor costo)
  let ahorro_potencial = 0;
  if (comparativa.length > 1) {
    const aportes = comparativa.map((m) => m.aporte_mensual);
    const maximo = Math.max(...aportes);
    const minimo = Math.min(...aportes);
    ahorro_potencial = (maximo - minimo) * 12;
  }

  // Cobertura accidentes según mutual seleccionada
  let cobertura_accidentes = 40; // Promedio
  let prestaciones_incluidas: string[] = [];

  if (i.mutual_comparar === 'achs' || (i.mutual_comparar === 'comparar_todas' && comparativa.length > 0)) {
    cobertura_accidentes = DATOS_MUTUALES['achs'].cobertura_mercado;
    prestaciones_incluidas = DATOS_MUTUALES['achs'].prestaciones;
  } else if (i.mutual_comparar === 'ist') {
    cobertura_accidentes = DATOS_MUTUALES['ist'].cobertura_mercado;
    prestaciones_incluidas = DATOS_MUTUALES['ist'].prestaciones;
  } else if (i.mutual_comparar === 'mutual_seguridad') {
    cobertura_accidentes = DATOS_MUTUALES['mutual_seguridad'].cobertura_mercado;
    prestaciones_incluidas = DATOS_MUTUALES['mutual_seguridad'].prestaciones;
  }

  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const aporteMensualR = Math.round(aporte_mensual_total);
  const aporteAnualR = Math.round(aporte_anual_total);
  const ahorroR = Math.round(ahorro_potencial);

  // Donut: descompone el aporte mensual total en su porción legal base (0,95%)
  // y la porción adicional por sector, escaladas para sumar el total real
  // (que ya puede incluir el descuento por bono de prevención).
  const sliceBase = tasa_sin_bono > 0 ? aporteMensualR * (TASA_BASE / tasa_sin_bono) : 0;
  const sliceAdic = aporteMensualR - sliceBase;
  const _chart = aporteMensualR <= 0 ? undefined : {
    type: 'doughnut',
    slices: [
      { label: 'Tasa base legal (0,95%)', value: Math.round(sliceBase) },
      { label: `Adicional sector (${aporte_adicional}%)`, value: Math.round(sliceAdic) },
    ],
    prefix: '$',
    centerValue: fmtCLP(aporteMensualR),
    centerLabel: 'aporte/mes',
    ariaLabel: `Aporte mensual total de ${fmtCLP(aporteMensualR)} a la mutualidad, compuesto por la tasa base legal de 0,95% y el adicional por sector de ${aporte_adicional}%.`,
  };

  const _insight = {
    title: 'Lo que paga tu empresa por la Ley de Accidentes',
    text: `Con **${i.numero_trabajadores}** trabajador${i.numero_trabajadores === 1 ? '' : 'es'} y una renta promedio de **${fmtCLP(i.remuneracion_promedio_mensual)}**, el aporte a la mutualidad suma **${fmtCLP(aporteMensualR)}/mes** (**${fmtCLP(aporteAnualR)}** al año) a una tasa de **${tasa_a_usar}%**.${i.considerar_bono_prevencion ? ' Ya estás aplicando el **bono de prevención**, que te baja la tasa.' : ''}${ahorroR > 0 ? ` Comparando mutualidades, podrías ahorrar hasta **${fmtCLP(ahorroR)}/año** eligiendo la más conveniente.` : ''}`,
    tone: ahorroR > 0 ? 'warn' : 'neutral',
    icon: '🏭',
  };

  return {
    tasa_aporte_base: TASA_BASE,
    tasa_aporte_adicional: aporte_adicional,
    tasa_total_sin_bono: tasa_sin_bono,
    tasa_total_con_bono: tasa_con_bono,
    aporte_mensual_por_trabajador: Math.round(aporte_por_trabajador),
    aporte_mensual_total: aporteMensualR,
    aporte_anual_total: aporteAnualR,
    comparativa_mutualidades: comparativa,
    cobertura_accidentes: cobertura_accidentes,
    prestaciones_incluidas: prestaciones_incluidas,
    ahorro_potencial: ahorroR,
    _insight,
    _chart,
  };
}
