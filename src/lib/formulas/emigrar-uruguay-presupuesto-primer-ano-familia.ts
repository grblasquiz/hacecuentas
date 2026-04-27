export interface Inputs {
  adultos: number;
  menores: number;
  zona: string;
  tipo_colegio: string;
  vuelos: number;
  gestor_residencia: string;
  seguro_medico: string;
  vehiculo: string;
}

export interface Outputs {
  total_usd: number;
  costo_mensual_usd: number;
  desglose_residencia: number;
  desglose_vuelos: number;
  desglose_alquiler: number;
  desglose_colegio: number;
  desglose_salud: number;
  desglose_manutencion: number;
  desglose_vehiculo: number;
  nota: string;
}

export function compute(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.round(Number(i.adultos) || 0));
  const menores = Math.max(0, Math.round(Number(i.menores) || 0));
  const totalPersonas = adultos + menores;
  const vuelos = Math.max(0, Math.round(Number(i.vuelos) || 0));

  if (adultos === 0) {
    return {
      total_usd: 0,
      costo_mensual_usd: 0,
      desglose_residencia: 0,
      desglose_vuelos: 0,
      desglose_alquiler: 0,
      desglose_colegio: 0,
      desglose_salud: 0,
      desglose_manutencion: 0,
      desglose_vehiculo: 0,
      nota: "Ingresá al menos 1 adulto para calcular.",
    };
  }

  // ── RESIDENCIA (Acuerdo Mercosur, DNM Uruguay) ──────────────────────────────
  // Por cuenta propia: ~USD 100/adulto, ~USD 50/menor
  // Con gestor/escribano: ~USD 450/adulto, ~USD 200/menor
  const RESIDENCIA_ADULTO_PROPIO = 100;
  const RESIDENCIA_MENOR_PROPIO = 50;
  const RESIDENCIA_ADULTO_GESTOR = 450;
  const RESIDENCIA_MENOR_GESTOR = 200;

  let desglose_residencia = 0;
  if (i.gestor_residencia === "con_gestor") {
    desglose_residencia =
      adultos * RESIDENCIA_ADULTO_GESTOR +
      menores * RESIDENCIA_MENOR_GESTOR;
  } else {
    desglose_residencia =
      adultos * RESIDENCIA_ADULTO_PROPIO +
      menores * RESIDENCIA_MENOR_PROPIO;
  }

  // ── VUELOS (AEP/EZE → MVD, promedio temporada normal) ──────────────────────
  const VUELO_POR_PERSONA_USD = 110; // promedio 2026
  const desglose_vuelos = vuelos * VUELO_POR_PERSONA_USD;

  // ── ALQUILER por zona (depto familiar, valor mensual USD) ──────────────────
  // Usa valor medio del rango para familia con hijos (3-4 amb.)
  // Si no hay menores usa rango inferior (2-3 amb.)
  interface ZonaAlquiler {
    sinHijos: number;
    conHijos: number;
  }
  const ALQUILER_ZONA: Record<string, ZonaAlquiler> = {
    pocitos:        { sinHijos: 950,  conHijos: 1350 },
    carrasco:       { sinHijos: 1200, conHijos: 1700 },
    punta_del_este: { sinHijos: 1450, conHijos: 2300 },
    interior:       { sinHijos: 575,  conHijos: 850  },
  };
  const zonaKey = i.zona in ALQUILER_ZONA ? i.zona : "pocitos";
  const alquilerMensual =
    menores > 0
      ? ALQUILER_ZONA[zonaKey].conHijos
      : ALQUILER_ZONA[zonaKey].sinHijos;

  // Depósito de garantía = 2 meses de alquiler (práctica estándar Uruguay)
  const DEPOSITO_MESES = 2;
  const deposito = alquilerMensual * DEPOSITO_MESES;
  const desglose_alquiler = alquilerMensual * 12 + deposito;

  // ── ESCOLARIZACIÓN ─────────────────────────────────────────────────────────
  // Costo por hijo por año (matrícula + 12 cuotas)
  interface ColegioCosto {
    matricula: number;
    cuotaMensual: number;
  }
  const COLEGIO_COSTOS: Record<string, ColegioCosto> = {
    publico:       { matricula: 10,  cuotaMensual: 0   },
    privado_medio: { matricula: 450, cuotaMensual: 400 },
    privado_alto:  { matricula: 1200, cuotaMensual: 950 },
  };
  const colegioKey =
    i.tipo_colegio in COLEGIO_COSTOS ? i.tipo_colegio : "privado_medio";
  const costoAnualPorHijo =
    COLEGIO_COSTOS[colegioKey].matricula +
    COLEGIO_COSTOS[colegioKey].cuotaMensual * 12;
  const desglose_colegio = menores * costoAnualPorHijo;

  // ── COBERTURA MÉDICA ───────────────────────────────────────────────────────
  // Mutualista: ~USD 80/adulto/mes, ~USD 50/menor/mes (aporte individual sin empleador)
  // Privado:    ~USD 160/adulto/mes, ~USD 100/menor/mes (SUAT, Médica Uruguaya)
  const SALUD_MENSUAL: Record<string, { adulto: number; menor: number }> = {
    mutualista: { adulto: 80,  menor: 50  },
    privado:    { adulto: 160, menor: 100 },
  };
  const saludKey =
    i.seguro_medico in SALUD_MENSUAL ? i.seguro_medico : "mutualista";
  const saludMensual =
    adultos * SALUD_MENSUAL[saludKey].adulto +
    menores * SALUD_MENSUAL[saludKey].menor;
  const desglose_salud = saludMensual * 12;

  // ── MANUTENCIÓN (alimentación, transporte, servicios, ocio) ───────────────
  // Varía por zona: se aplica un multiplicador regional
  const MANUTENCION_ADULTO_BASE = 450; // USD/mes (Pocitos base)
  const MANUTENCION_MENOR_BASE  = 250; // USD/mes
  const ZONA_MULTIPLIER: Record<string, number> = {
    pocitos:        1.0,
    carrasco:       1.1,
    punta_del_este: 1.25,
    interior:       0.80,
  };
  const mult = ZONA_MULTIPLIER[zonaKey] ?? 1.0;
  const manutencionMensual =
    (adultos * MANUTENCION_ADULTO_BASE + menores * MANUTENCION_MENOR_BASE) * mult;
  const desglose_manutencion = manutencionMensual * 12;

  // ── VEHÍCULO (seguro + patente anual, si aplica) ───────────────────────────
  // Seguro auto Uruguayo: ~USD 600/año; Patente promedio: ~USD 400/año
  const VEHICULO_ANUAL = 1000; // seguro (~USD 600) + patente (~USD 400)
  const desglose_vehiculo = i.vehiculo === "si" ? VEHICULO_ANUAL : 0;

  // ── TOTAL ──────────────────────────────────────────────────────────────────
  const total_usd =
    desglose_residencia +
    desglose_vuelos +
    desglose_alquiler +
    desglose_colegio +
    desglose_salud +
    desglose_manutencion +
    desglose_vehiculo;

  // Costo mensual recurrente (sin gastos únicos del mes 1)
  const gastosUnicos =
    desglose_residencia +
    desglose_vuelos +
    deposito +
    (menores > 0 ? menores * COLEGIO_COSTOS[colegioKey].matricula : 0);
  const gastosRecurrentes = total_usd - gastosUnicos;
  const costo_mensual_usd = Math.round(gastosRecurrentes / 12);

  // ── NOTA ───────────────────────────────────────────────────────────────────
  const zonaLabel: Record<string, string> = {
    pocitos:        "Pocitos / Punta Carretas",
    carrasco:       "Carrasco / Ciudad de la Costa",
    punta_del_este: "Punta del Este / Maldonado",
    interior:       "Interior",
  };
  const nota =
    `Estimación para ${totalPersonas} persona${totalPersonas !== 1 ? "s" : ""} en ${
      zonaLabel[zonaKey]
    }. No incluye mudanza de contenedor, compra de muebles ni impuestos uruguayos (IRPF). ` +
    `Alquiler mensual estimado: USD ${alquilerMensual.toLocaleString("es-AR")}. ` +
    (menores > 0 && colegioKey !== "publico"
      ? `Colegio (${colegioKey === "privado_alto" ? "bilingüe/alto nivel" : "privado medio"}): USD ${costoAnualPorHijo.toLocaleString("es-AR")}/hijo/año. `
      : "") +
    "Valores orientativos 2026.";

  return {
    total_usd:            Math.round(total_usd),
    costo_mensual_usd,
    desglose_residencia:  Math.round(desglose_residencia),
    desglose_vuelos:      Math.round(desglose_vuelos),
    desglose_alquiler:    Math.round(desglose_alquiler),
    desglose_colegio:     Math.round(desglose_colegio),
    desglose_salud:       Math.round(desglose_salud),
    desglose_manutencion: Math.round(desglose_manutencion),
    desglose_vehiculo:    Math.round(desglose_vehiculo),
    nota,
  };
}
