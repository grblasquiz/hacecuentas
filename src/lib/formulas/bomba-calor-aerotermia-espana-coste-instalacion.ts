export interface Inputs {
  superficie_m2: number;
  zona_climatica: 'A' | 'B' | 'C' | 'D' | 'E';
  nivel_aislamiento: 'malo' | 'medio' | 'bueno';
  sistema_actual: 'gas_natural' | 'gasoil' | 'electrico' | 'bomba_calor_antigua' | 'ninguno';
  precio_electricidad: number;
  precio_combustible: number;
  tipo_solicitante: 'particular_renta_baja' | 'particular_general' | 'comunidad_vecinos';
  base_imponible_irpf: number;
}

export interface Outputs {
  potencia_necesaria_kw: number;
  coste_instalacion_base: number;
  subvencion_next_gen: number;
  porcentaje_subvencion: number;
  coste_neto_tras_subvencion: number;
  deduccion_irpf: number;
  coste_real_final: number;
  consumo_kwh_anual: number;
  factura_electrica_anual: number;
  coste_actual_anual: number;
  ahorro_anual: number;
  payback_anos: number;
  cop_estimado: number;
  ahorro_co2_kg_anual: number;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes de carga térmica por zona y aislamiento (W/m²) ---
  // Fuente: CTE DB-HE, Apéndice B + valores orientativos sector instaladores
  const CARGA_TERMICA: Record<string, Record<string, number>> = {
    A: { malo: 40, medio: 25, bueno: 15 },
    B: { malo: 55, medio: 35, bueno: 20 },
    C: { malo: 70, medio: 45, bueno: 28 },
    D: { malo: 85, medio: 55, bueno: 35 },
    E: { malo: 100, medio: 65, bueno: 42 },
  };

  // --- COP estacional (SCOP) por zona climática ---
  // Fuente: IDAE, guía de aerotermia 2023; EN 14825 condiciones de ensayo
  const COP_ZONA: Record<string, number> = {
    A: 4.2,
    B: 3.8,
    C: 3.4,
    D: 3.0,
    E: 2.7,
  };

  // --- Horas equivalentes de calefacción (h/año) por zona ---
  // Fuente: RITE, Atlas de Radiación Solar AEMET; estimación conservadora
  const HORAS_EQUIV: Record<string, number> = {
    A: 800,
    B: 1100,
    C: 1500,
    D: 1900,
    E: 2200,
  };

  // --- Rendimiento del sistema actual ---
  // Gas condensación moderna: 0.92; gasoil: 0.85; eléctrico resistivo: 1.0; BdC antigua: 2.2
  const RENDIMIENTO_ACTUAL: Record<string, number> = {
    gas_natural: 0.92,
    gasoil: 0.85,
    electrico: 1.0,
    bomba_calor_antigua: 2.2,
    ninguno: 1.0,
  };

  // --- Emisiones CO2 por kWh (factor de emisión) ---
  // Fuente: MITECO, factores de emisión electricidad España 2025: 0.181 kgCO2/kWh
  // Gas natural: 0.202 kgCO2/kWh; gasoil calefacción: 0.267 kgCO2/kWh
  const CO2_ELECTRICIDAD = 0.181; // kgCO2/kWh — MITECO 2025
  const CO2_COMBUSTIBLE: Record<string, number> = {
    gas_natural: 0.202,
    gasoil: 0.267,
    electrico: 0.181,
    bomba_calor_antigua: 0.181,
    ninguno: 0.0,
  };

  // --- Porcentaje de subvención Next Generation EU ---
  // Fuente: RD 691/2021 y convocatorias CCAA 2023-2024; vigente orientativamente en 2026
  const SUBVENCION_PCT: Record<string, number> = {
    particular_renta_baja: 0.60,
    particular_general: 0.40,
    comunidad_vecinos: 0.50,
  };
  // Límite máximo de subvención (€)
  const SUBVENCION_MAX: Record<string, number> = {
    particular_renta_baja: 12000,
    particular_general: 9000,
    comunidad_vecinos: 15000,
  };

  // --- Deducción IRPF (RD-Ley 19/2021, Ley 35/2006 modificada) ---
  // Deducción 40% sobre base; base máxima 7.500 €; límite deducción 3.000 €
  const IRPF_DEDUCCION_PCT = 0.40;
  const IRPF_BASE_MAX = 7500; // € — base máxima de deducción

  // --- Precio mínimo de instalación (€) y coste por kW (€/kW) ---
  // Fuente: datos de mercado instaladores España 2025-2026
  const COSTE_MIN_INSTALACION = 8000; // € mínimo
  const COSTE_POR_KW = 1050; // €/kW instalado (equipo + mano de obra)

  // === CÁLCULOS ===

  // 1. Superficie y zona válidas
  const superficie = Math.max(30, Math.min(400, i.superficie_m2 || 100));
  const zona = i.zona_climatica || 'C';
  const aislamiento = i.nivel_aislamiento || 'medio';
  const sistemaActual = i.sistema_actual || 'gas_natural';
  const precioElectricidad = Math.max(0.05, Math.min(0.50, i.precio_electricidad || 0.18));
  const precioCombustible = Math.max(0.01, Math.min(2.50, i.precio_combustible || 0.072));
  const solicitante = i.tipo_solicitante || 'particular_general';

  // 2. Potencia necesaria (kW)
  const cargaUnitaria = CARGA_TERMICA[zona]?.[aislamiento] ?? 45; // W/m²
  const potencia_kW = (cargaUnitaria * superficie) / 1000;
  const potencia_necesaria_kw = Math.round(potencia_kW * 10) / 10;

  // 3. Coste de instalación base (€)
  const costeRaw = Math.max(COSTE_MIN_INSTALACION, potencia_kW * COSTE_POR_KW);
  const coste_instalacion_base = Math.round(costeRaw);

  // 4. Subvención Next Generation EU
  const pctSubvencion = SUBVENCION_PCT[solicitante] ?? 0.40;
  const maxSubvencion = SUBVENCION_MAX[solicitante] ?? 9000;
  const subvencionBruta = coste_instalacion_base * pctSubvencion;
  const subvencion_next_gen = Math.round(Math.min(subvencionBruta, maxSubvencion));
  const porcentaje_subvencion = Math.round(pctSubvencion * 100);

  // 5. Coste neto tras subvención
  const coste_neto_tras_subvencion = Math.round(coste_instalacion_base - subvencion_next_gen);

  // 6. Deducción IRPF (RD-Ley 19/2021)
  // Base de deducción: mínimo entre coste neto y base máxima legal
  const baseDeduccion = Math.min(coste_neto_tras_subvencion, IRPF_BASE_MAX);
  const deduccion_irpf = Math.round(baseDeduccion * IRPF_DEDUCCION_PCT);

  // 7. Coste real final
  const coste_real_final = Math.max(0, Math.round(coste_neto_tras_subvencion - deduccion_irpf));

  // 8. COP y demanda energética anual
  const cop = COP_ZONA[zona] ?? 3.4;
  const cop_estimado = cop;
  const horasEquiv = HORAS_EQUIV[zona] ?? 1500;

  // Demanda térmica anual (kWh): potencia × horas equivalentes
  // Incluye calefacción + estimación ACS (~15% adicional)
  const demandaCalefaccion = potencia_kW * horasEquiv;
  const demandaACS = demandaCalefaccion * 0.15;
  const demandaTotal = demandaCalefaccion + demandaACS;

  // Consumo eléctrico de la bomba de calor (kWh/año)
  const consumo_kwh_anual = Math.round(demandaTotal / cop);

  // 9. Factura eléctrica anual con aerotermia
  const factura_electrica_anual = Math.round(consumo_kwh_anual * precioElectricidad);

  // 10. Coste actual anual del sistema de calefacción existente
  // Se estima el mismo nivel de demanda térmica cubierta con el sistema actual
  const rendimientoActual = RENDIMIENTO_ACTUAL[sistemaActual] ?? 0.92;
  let consumoCombustibleAnual: number;

  if (sistemaActual === 'electrico') {
    // Resistencias eléctricas: COP=1, mismo precio electricidad
    consumoCombustibleAnual = demandaTotal / rendimientoActual;
    const coste_actual_anual = Math.round(consumoCombustibleAnual * precioElectricidad);
    const ahorro_anual = Math.max(0, coste_actual_anual - factura_electrica_anual);
    const payback_anos = ahorro_anual > 0 ? Math.round((coste_real_final / ahorro_anual) * 10) / 10 : 99;

    // 11. Ahorro CO2
    const co2Actual = consumoCombustibleAnual * (CO2_COMBUSTIBLE[sistemaActual] ?? 0.181);
    const co2Aerotermia = consumo_kwh_anual * CO2_ELECTRICIDAD;
    const ahorro_co2_kg_anual = Math.round(Math.max(0, co2Actual - co2Aerotermia));

    return {
      potencia_necesaria_kw,
      coste_instalacion_base,
      subvencion_next_gen,
      porcentaje_subvencion,
      coste_neto_tras_subvencion,
      deduccion_irpf,
      coste_real_final,
      consumo_kwh_anual,
      factura_electrica_anual,
      coste_actual_anual,
      ahorro_anual,
      payback_anos,
      cop_estimado,
      ahorro_co2_kg_anual,
    };
  } else if (sistemaActual === 'bomba_calor_antigua') {
    // BdC antigua: usa electricidad con COP 2.2
    consumoCombustibleAnual = demandaTotal / rendimientoActual;
    const coste_actual_anual = Math.round(consumoCombustibleAnual * precioElectricidad);
    const ahorro_anual = Math.max(0, coste_actual_anual - factura_electrica_anual);
    const payback_anos = ahorro_anual > 0 ? Math.round((coste_real_final / ahorro_anual) * 10) / 10 : 99;

    const co2Actual = consumoCombustibleAnual * CO2_ELECTRICIDAD;
    const co2Aerotermia = consumo_kwh_anual * CO2_ELECTRICIDAD;
    const ahorro_co2_kg_anual = Math.round(Math.max(0, co2Actual - co2Aerotermia));

    return {
      potencia_necesaria_kw,
      coste_instalacion_base,
      subvencion_next_gen,
      porcentaje_subvencion,
      coste_neto_tras_subvencion,
      deduccion_irpf,
      coste_real_final,
      consumo_kwh_anual,
      factura_electrica_anual,
      coste_actual_anual,
      ahorro_anual,
      payback_anos,
      cop_estimado,
      ahorro_co2_kg_anual,
    };
  } else if (sistemaActual === 'ninguno') {
    // Sin calefacción previa: no hay ahorro real, payback se basa en beneficio en confort
    const coste_actual_anual = 0;
    const ahorro_anual = 0;
    const payback_anos = 99;
    const ahorro_co2_kg_anual = 0;

    return {
      potencia_necesaria_kw,
      coste_instalacion_base,
      subvencion_next_gen,
      porcentaje_subvencion,
      coste_neto_tras_subvencion,
      deduccion_irpf,
      coste_real_final,
      consumo_kwh_anual,
      factura_electrica_anual,
      coste_actual_anual,
      ahorro_anual,
      payback_anos,
      cop_estimado,
      ahorro_co2_kg_anual,
    };
  } else {
    // Gas natural o gasoil: demanda térmica / rendimiento = kWh combustible consumidos
    consumoCombustibleAnual = demandaTotal / rendimientoActual;
    const coste_actual_anual = Math.round(consumoCombustibleAnual * precioCombustible);
    const ahorro_anual = Math.max(0, coste_actual_anual - factura_electrica_anual);
    const payback_anos = ahorro_anual > 0 ? Math.round((coste_real_final / ahorro_anual) * 10) / 10 : 99;

    // Ahorro CO2
    const factorCO2 = CO2_COMBUSTIBLE[sistemaActual] ?? 0.202;
    const co2Actual = consumoCombustibleAnual * factorCO2;
    const co2Aerotermia = consumo_kwh_anual * CO2_ELECTRICIDAD;
    const ahorro_co2_kg_anual = Math.round(Math.max(0, co2Actual - co2Aerotermia));

    return {
      potencia_necesaria_kw,
      coste_instalacion_base,
      subvencion_next_gen,
      porcentaje_subvencion,
      coste_neto_tras_subvencion,
      deduccion_irpf,
      coste_real_final,
      consumo_kwh_anual,
      factura_electrica_anual,
      coste_actual_anual,
      ahorro_anual,
      payback_anos,
      cop_estimado,
      ahorro_co2_kg_anual,
    };
  }
}
