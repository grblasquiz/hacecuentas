export interface Inputs {
  monto_inversion: number;
  plazo_meses: number;
  perfil_riesgo: 'conservador' | 'moderado' | 'agresivo';
  tasa_cuenta_ahorro: number;
  tasa_cdt: number;
  tasa_fic: number;
  tasa_tes: number;
  tasa_fondo_activo: number;
  es_cliente_banco: 'si' | 'no';
}

export interface OutputRow {
  instrumento: string;
  tasa_anual: number;
  rentabilidad_bruta: number;
  retencion: number;
  comision: number;
  gravamen_4x1000: number;
  rentabilidad_neta: number;
  rendimiento_neto_pct: number;
}

export interface Outputs {
  resultado_cuenta_ahorro: number;
  rentabilidad_neta_cuenta_ahorro: number;
  resultado_cdt: number;
  rentabilidad_neta_cdt: number;
  resultado_fic: number;
  rentabilidad_neta_fic: number;
  resultado_tes: number;
  rentabilidad_neta_tes: number;
  resultado_fondo_activo: number;
  rentabilidad_neta_fondo_activo: number;
  mejor_opcion: string;
  diferencia_maxima: number;
  tabla_resumen: OutputRow[];
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DIAN, Banco República, Superfinanciera
  const RETENCION_CDT_TES = 0.08; // 8% retención en la fuente CDT/TES
  const RETENCION_FIC_FONDOS = 0.19; // 19% ganancias ocasionales
  const RETENCION_CUENTA_AHORRO = 0.0; // Exenta personas naturales < $34.5M anuales
  const GRAVAMEN_4X1000 = 0.004; // $4 por cada $1.000
  const COMISION_CDT_ESTANDAR = 0.015; // 1.5% promedio cliente estándar
  const COMISION_CDT_PREFERENTE = 0.005; // 0.5% cliente preferente
  const COMISION_FIC_ADMIN = 0.0075; // 0.75% administrador FIC
  const COMISION_FIC_CUSTODIO = 0.0008; // 0.08% custodio
  const COMISION_TES_BROKER = 0.008; // 0.8% si se vende antes vencimiento
  const COMISION_FONDO_ADMIN = 0.012; // 1.2% fondo gestión activa
  const COMISION_FONDO_CUSTODIO = 0.0015; // 0.15% custodio
  
  const es_preferente = i.es_cliente_banco === 'si';
  const plazo_fraccion = i.plazo_meses / 12;
  
  // Función auxiliar: cálculo genérico rentabilidad neta
  function calcularRentabilidad(
    tasa_anual: number,
    retencion_rate: number,
    comision_rate: number,
    aplicar_gravamen: boolean = true
  ): { bruto: number; neto: number; detalle: { retencion: number; comision: number; gravamen: number } } {
    const rentabilidad_bruta = i.monto_inversion * (tasa_anual / 100) * plazo_fraccion;
    const retencion = rentabilidad_bruta * retencion_rate;
    const comision = rentabilidad_bruta * comision_rate;
    const gravamen = aplicar_gravamen ? i.monto_inversion * GRAVAMEN_4X1000 * plazo_fraccion : 0;
    const rentabilidad_neta = rentabilidad_bruta - retencion - comision - gravamen;
    
    return {
      bruto: rentabilidad_bruta,
      neto: Math.max(0, rentabilidad_neta),
      detalle: { retencion, comision, gravamen }
    };
  }
  
  // 1. CUENTA AHORRO
  const cuenta_ahorro = calcularRentabilidad(
    i.tasa_cuenta_ahorro,
    RETENCION_CUENTA_AHORRO,
    0, // sin comisión típicamente
    true // gravamen 4×1000 aplica
  );
  
  // 2. CDT (Certificado Depósito a Término)
  const comision_cdt = es_preferente ? COMISION_CDT_PREFERENTE : COMISION_CDT_ESTANDAR;
  const gravamen_cdt_exento = es_preferente; // cliente preferente exento
  const cdt = calcularRentabilidad(
    i.tasa_cdt,
    RETENCION_CDT_TES,
    comision_cdt,
    !gravamen_cdt_exento // aplica gravamen si no es preferente
  );
  
  // 3. FIC LIQUIDEZ
  const comision_fic_total = COMISION_FIC_ADMIN + COMISION_FIC_CUSTODIO;
  const fic = calcularRentabilidad(
    i.tasa_fic,
    RETENCION_FIC_FONDOS,
    comision_fic_total,
    true
  );
  
  // 4. TES CORTO PLAZO
  // Si plazo < 12 meses y se vende antes vencimiento, aplica comisión broker
  const aplica_comision_tes = i.plazo_meses < 12 ? COMISION_TES_BROKER : 0;
  const tes = calcularRentabilidad(
    i.tasa_tes,
    RETENCION_CDT_TES,
    aplica_comision_tes,
    false // TES vencimiento exento gravamen
  );
  
  // 5. FONDO GESTIÓN ACTIVA
  const comision_fondo_total = COMISION_FONDO_ADMIN + COMISION_FONDO_CUSTODIO;
  const fondo_activo = calcularRentabilidad(
    i.tasa_fondo_activo,
    RETENCION_FIC_FONDOS,
    comision_fondo_total,
    true
  );
  
  // Tabla resumen
  const tabla_resumen: OutputRow[] = [
    {
      instrumento: 'Cuenta Ahorro',
      tasa_anual: i.tasa_cuenta_ahorro,
      rentabilidad_bruta: cuenta_ahorro.bruto,
      retencion: 0,
      comision: 0,
      gravamen_4x1000: cuenta_ahorro.detalle.gravamen,
      rentabilidad_neta: cuenta_ahorro.neto,
      rendimiento_neto_pct: (cuenta_ahorro.neto / i.monto_inversion) * 100
    },
    {
      instrumento: 'CDT',
      tasa_anual: i.tasa_cdt,
      rentabilidad_bruta: cdt.bruto,
      retencion: cdt.detalle.retencion,
      comision: cdt.detalle.comision,
      gravamen_4x1000: cdt.detalle.gravamen,
      rentabilidad_neta: cdt.neto,
      rendimiento_neto_pct: (cdt.neto / i.monto_inversion) * 100
    },
    {
      instrumento: 'FIC Liquidez',
      tasa_anual: i.tasa_fic,
      rentabilidad_bruta: fic.bruto,
      retencion: fic.detalle.retencion,
      comision: fic.detalle.comision,
      gravamen_4x1000: fic.detalle.gravamen,
      rentabilidad_neta: fic.neto,
      rendimiento_neto_pct: (fic.neto / i.monto_inversion) * 100
    },
    {
      instrumento: 'TES Corto Plazo',
      tasa_anual: i.tasa_tes,
      rentabilidad_bruta: tes.bruto,
      retencion: tes.detalle.retencion,
      comision: tes.detalle.comision,
      gravamen_4x1000: tes.detalle.gravamen,
      rentabilidad_neta: tes.neto,
      rendimiento_neto_pct: (tes.neto / i.monto_inversion) * 100
    },
    {
      instrumento: 'Fondo Gestión Activa',
      tasa_anual: i.tasa_fondo_activo,
      rentabilidad_bruta: fondo_activo.bruto,
      retencion: fondo_activo.detalle.retencion,
      comision: fondo_activo.detalle.comision,
      gravamen_4x1000: fondo_activo.detalle.gravamen,
      rentabilidad_neta: fondo_activo.neto,
      rendimiento_neto_pct: (fondo_activo.neto / i.monto_inversion) * 100
    }
  ];
  
  // Mejor opción según perfil
  let mejor_opcion = 'CDT';
  let mejor_neto = cdt.neto;
  
  if (i.perfil_riesgo === 'conservador') {
    // Preferir cuenta ahorro, CDT, TES en ese orden
    if (i.plazo_meses <= 6) {
      mejor_opcion = cuenta_ahorro.neto > cdt.neto ? 'Cuenta Ahorro' : 'CDT';
      mejor_neto = Math.max(cuenta_ahorro.neto, cdt.neto);
    } else {
      mejor_opcion = cdt.neto > tes.neto ? 'CDT' : 'TES';
      mejor_neto = Math.max(cdt.neto, tes.neto);
    }
  } else if (i.perfil_riesgo === 'moderado') {
    // CDT, TES, FIC en ese orden
    const candidatos = [
      { nombre: 'CDT', neto: cdt.neto },
      { nombre: 'TES', neto: tes.neto },
      { nombre: 'FIC Liquidez', neto: fic.neto }
    ];
    const ganador = candidatos.reduce((a, b) => a.neto > b.neto ? a : b);
    mejor_opcion = ganador.nombre;
    mejor_neto = ganador.neto;
  } else {
    // Agresivo: Fondo gestión activa, luego CDT
    mejor_opcion = fondo_activo.neto > cdt.neto ? 'Fondo Gestión Activa' : 'CDT';
    mejor_neto = Math.max(fondo_activo.neto, cdt.neto);
  }
  
  // Diferencia máxima
  const rentabilidades_netas = [
    cuenta_ahorro.neto,
    cdt.neto,
    fic.neto,
    tes.neto,
    fondo_activo.neto
  ];
  const maxima = Math.max(...rentabilidades_netas);
  const minima = Math.min(...rentabilidades_netas);
  const diferencia_maxima = maxima - minima;
  
  return {
    resultado_cuenta_ahorro: i.monto_inversion + cuenta_ahorro.neto,
    rentabilidad_neta_cuenta_ahorro: cuenta_ahorro.neto,
    resultado_cdt: i.monto_inversion + cdt.neto,
    rentabilidad_neta_cdt: cdt.neto,
    resultado_fic: i.monto_inversion + fic.neto,
    rentabilidad_neta_fic: fic.neto,
    resultado_tes: i.monto_inversion + tes.neto,
    rentabilidad_neta_tes: tes.neto,
    resultado_fondo_activo: i.monto_inversion + fondo_activo.neto,
    rentabilidad_neta_fondo_activo: fondo_activo.neto,
    mejor_opcion: `${mejor_opcion}: $${Math.round(mejor_neto).toLocaleString('es-CO')} netos (${((mejor_neto / i.monto_inversion) * 100).toFixed(2)}% sobre capital)`,
    diferencia_maxima: diferencia_maxima,
    tabla_resumen: tabla_resumen
  };
}
